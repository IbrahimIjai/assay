use assay_core::ReserveJob;
use axum::{
    Json, Router,
    extract::{DefaultBodyLimit, Multipart, State},
    http::{HeaderMap, HeaderValue, StatusCode},
    routing::{get, post},
};
use chrono::Utc;
use serde::Deserialize;
use serde_json::json;
use std::{net::SocketAddr, path::PathBuf, sync::Arc};
use tokio::{process::Command, sync::Semaphore};
use uuid::Uuid;

const REQUIRED_DOCUMENTS: usize = 3;
const MAX_PDF_BYTES: usize = 5 * 1024 * 1024;
const MAX_UPLOAD_BYTES: usize = REQUIRED_DOCUMENTS * MAX_PDF_BYTES + 1024 * 1024;

#[derive(Clone)]
struct AppState {
    agent_root: Arc<PathBuf>,
    proof_lock: Arc<Semaphore>,
}

#[derive(Debug, Deserialize)]
struct ProofRequest {
    scenario: Option<String>,
}

fn cors_headers() -> HeaderMap {
    let mut headers = HeaderMap::new();
    headers.insert("access-control-allow-origin", HeaderValue::from_static("*"));
    headers.insert(
        "access-control-allow-headers",
        HeaderValue::from_static("content-type"),
    );
    headers.insert(
        "access-control-allow-methods",
        HeaderValue::from_static("GET,POST,OPTIONS"),
    );
    headers
}

async fn health() -> (HeaderMap, Json<serde_json::Value>) {
    (
        cors_headers(),
        Json(json!({"ok":true,"service":"assay-agent-api"})),
    )
}

async fn demo_job(State(_): State<AppState>) -> (HeaderMap, Json<ReserveJob>) {
    (
        cors_headers(),
        Json(ReserveJob {
            job_id: Uuid::new_v4(),
            asset_id: "SILVER-001".into(),
            token_supply: "4000".into(),
            unit: "kg".into(),
            documents: vec![],
            created_at: Utc::now(),
        }),
    )
}

async fn options() -> (StatusCode, HeaderMap) {
    (StatusCode::NO_CONTENT, cors_headers())
}

async fn run_proof(
    State(state): State<AppState>,
    Json(request): Json<ProofRequest>,
) -> (StatusCode, HeaderMap, Json<serde_json::Value>) {
    let scenario = request.scenario.as_deref().unwrap_or("healthy");
    if scenario != "healthy" && scenario != "failed" {
        return (
            StatusCode::BAD_REQUEST,
            cors_headers(),
            Json(json!({"ok":false,"error":"scenario must be healthy or failed"})),
        );
    }

    let suffix = if scenario == "healthy" {
        "healthy"
    } else {
        "underbacked"
    };
    let documents = vec![
        state.agent_root.join("demo-pdfs/custodian_a_healthy.pdf"),
        state.agent_root.join("demo-pdfs/custodian_b_healthy.pdf"),
        state
            .agent_root
            .join(format!("demo-pdfs/custodian_c_{suffix}.pdf")),
    ];
    execute_proof(&state, &documents, scenario).await
}

async fn upload_proof(
    State(state): State<AppState>,
    mut multipart: Multipart,
) -> (StatusCode, HeaderMap, Json<serde_json::Value>) {
    let upload_dir = std::env::temp_dir().join(format!("assay-upload-{}", Uuid::new_v4()));
    if let Err(error) = tokio::fs::create_dir(&upload_dir).await {
        return api_error(StatusCode::INTERNAL_SERVER_ERROR, error.to_string());
    }

    let mut documents = Vec::with_capacity(REQUIRED_DOCUMENTS);
    let mut upload_error = None;
    loop {
        let field = match multipart.next_field().await {
            Ok(Some(field)) => field,
            Ok(None) => break,
            Err(error) => {
                upload_error = Some(format!("could not read multipart upload: {error}"));
                break;
            }
        };
        if field.name() != Some("documents") {
            continue;
        }
        if documents.len() >= REQUIRED_DOCUMENTS {
            upload_error = Some(format!(
                "upload exactly {REQUIRED_DOCUMENTS} PDF statements"
            ));
            break;
        }
        let file_name = field.file_name().unwrap_or("statement.pdf").to_string();
        if !file_name.to_ascii_lowercase().ends_with(".pdf") {
            upload_error = Some(format!("{file_name} is not a PDF"));
            break;
        }
        let bytes = match field.bytes().await {
            Ok(bytes) => bytes,
            Err(error) => {
                upload_error = Some(format!("could not read {file_name}: {error}"));
                break;
            }
        };
        if bytes.is_empty() || bytes.len() > MAX_PDF_BYTES {
            upload_error = Some(format!("{file_name} must be between 1 byte and 5 MB"));
            break;
        }
        if !bytes.starts_with(b"%PDF-") {
            upload_error = Some(format!("{file_name} does not contain a valid PDF header"));
            break;
        }
        let path = upload_dir.join(format!("statement-{}.pdf", documents.len() + 1));
        if let Err(error) = tokio::fs::write(&path, bytes).await {
            upload_error = Some(format!("could not stage {file_name}: {error}"));
            break;
        }
        documents.push(path);
    }

    if upload_error.is_none() && documents.len() != REQUIRED_DOCUMENTS {
        upload_error = Some(format!(
            "upload exactly {REQUIRED_DOCUMENTS} PDF statements; received {}",
            documents.len()
        ));
    }
    if let Some(error) = upload_error {
        let _ = tokio::fs::remove_dir_all(&upload_dir).await;
        return api_error(StatusCode::BAD_REQUEST, error);
    }

    let response = execute_proof(&state, &documents, "uploaded").await;
    let _ = tokio::fs::remove_dir_all(&upload_dir).await;
    response
}

async fn execute_proof(
    state: &AppState,
    documents: &[PathBuf],
    source: &str,
) -> (StatusCode, HeaderMap, Json<serde_json::Value>) {
    let _permit = match state.proof_lock.try_acquire() {
        Ok(permit) => permit,
        Err(_) => {
            return api_error(
                StatusCode::TOO_MANY_REQUESTS,
                "another proof is already running".into(),
            );
        }
    };

    let orchestrator = std::env::var("ASSAY_ORCHESTRATOR_BIN")
        .map(PathBuf::from)
        .unwrap_or_else(|_| state.agent_root.join("target/debug/assay-orchestrator"));
    let mut command = Command::new(orchestrator);
    command
        .current_dir(state.agent_root.as_ref())
        .arg("SILVER-001")
        .arg("4000")
        .arg("kg");
    for document in documents {
        command.arg(document);
    }
    if std::env::var("ASSAY_USE_LIVE_LLM").as_deref() != Ok("true") {
        command.arg("--mock");
    }
    command.arg("--prove");
    let submission_enabled = std::env::var("ASSAY_ENABLE_SUBMISSION").as_deref() == Ok("true");
    if submission_enabled {
        command.arg("--submit");
    }

    match command.output().await {
        Ok(output) if output.status.success() => {
            let log = String::from_utf8_lossy(&output.stdout);
            let proof = log
                .split_once("=== GROTH16 PROOF ===")
                .and_then(|(_, value)| {
                    serde_json::from_str::<serde_json::Value>(value.trim()).ok()
                });
            (
                StatusCode::OK,
                cors_headers(),
                Json(json!({
                    "ok": true,
                    "source": source,
                    "submitted": submission_enabled,
                    "proof": proof,
                    "log": log,
                })),
            )
        }
        Ok(output) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            cors_headers(),
            Json(json!({"ok":false,"error":String::from_utf8_lossy(&output.stderr)})),
        ),
        Err(error) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            cors_headers(),
            Json(json!({"ok":false,"error":error.to_string()})),
        ),
    }
}

fn api_error(
    status: StatusCode,
    error: String,
) -> (StatusCode, HeaderMap, Json<serde_json::Value>) {
    (
        status,
        cors_headers(),
        Json(json!({"ok":false,"error":error})),
    )
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    tracing_subscriber::fmt::init();
    let default_root = PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .parent()
        .and_then(|path| path.parent())
        .expect("assay-api must be inside the agent workspace")
        .to_path_buf();
    let state = AppState {
        agent_root: Arc::new(
            std::env::var("ASSAY_AGENT_ROOT")
                .map(PathBuf::from)
                .unwrap_or(default_root),
        ),
        proof_lock: Arc::new(Semaphore::new(1)),
    };
    let app = Router::new()
        .route("/health", get(health))
        .route("/demo/job", get(demo_job))
        .route("/demo/proof", post(run_proof).options(options))
        .route("/proof/upload", post(upload_proof).options(options))
        .layer(DefaultBodyLimit::max(MAX_UPLOAD_BYTES))
        .with_state(state);
    let addr: SocketAddr = std::env::var("ASSAY_API_ADDR")
        .unwrap_or_else(|_| "127.0.0.1:3000".to_string())
        .parse()?;
    let listener = tokio::net::TcpListener::bind(addr).await?;
    axum::serve(listener, app).await?;
    Ok(())
}
