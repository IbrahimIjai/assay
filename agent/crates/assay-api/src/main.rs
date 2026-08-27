use assay_core::ReserveJob;
use axum::{
    Json, Router,
    extract::State,
    http::{HeaderMap, HeaderValue, StatusCode},
    routing::{get, post},
};
use chrono::Utc;
use serde::Deserialize;
use serde_json::json;
use std::{net::SocketAddr, path::PathBuf, sync::Arc};
use tokio::process::Command;
use uuid::Uuid;

#[derive(Clone)]
struct AppState {
    agent_root: Arc<PathBuf>,
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
    let orchestrator = std::env::var("ASSAY_ORCHESTRATOR_BIN")
        .map(PathBuf::from)
        .unwrap_or_else(|_| state.agent_root.join("target/debug/assay-orchestrator"));
    let mut command = Command::new(orchestrator);
    command
        .current_dir(state.agent_root.as_ref())
        .arg("SILVER-001")
        .arg("4000")
        .arg("kg")
        .arg("demo-pdfs/custodian_a_healthy.pdf")
        .arg("demo-pdfs/custodian_b_healthy.pdf")
        .arg(format!("demo-pdfs/custodian_c_{suffix}.pdf"))
        .arg("--mock")
        .arg("--prove");
    if std::env::var("ASSAY_ENABLE_SUBMISSION").as_deref() == Ok("true") {
        command.arg("--submit");
    }

    match command.output().await {
        Ok(output) if output.status.success() => (
            StatusCode::OK,
            cors_headers(),
            Json(json!({
                "ok": true,
                "scenario": scenario,
                "submitted": std::env::var("ASSAY_ENABLE_SUBMISSION").as_deref() == Ok("true"),
                "log": String::from_utf8_lossy(&output.stdout),
            })),
        ),
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
    };
    let app = Router::new()
        .route("/health", get(health))
        .route("/demo/job", get(demo_job))
        .route("/demo/proof", post(run_proof).options(options))
        .with_state(state);
    let addr: SocketAddr = std::env::var("ASSAY_API_ADDR")
        .unwrap_or_else(|_| "0.0.0.0:3000".to_string())
        .parse()?;
    let listener = tokio::net::TcpListener::bind(addr).await?;
    axum::serve(listener, app).await?;
    Ok(())
}
