use axum::{extract::State, routing::get, Json, Router};
use assay_core::ReserveJob;
use chrono::Utc;
use serde_json::json;
use std::net::SocketAddr;
use uuid::Uuid;

#[derive(Clone)] struct AppState;

async fn health() -> Json<serde_json::Value> { Json(json!({"ok":true,"service":"assay-agent-api"})) }
async fn demo_job(State(_): State<AppState>) -> Json<ReserveJob> {
    Json(ReserveJob { job_id: Uuid::new_v4(), asset_id: "SILVER-001".into(), token_supply: "4000".into(), unit: "kg".into(), documents: vec![], created_at: Utc::now() })
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    tracing_subscriber::fmt::init();
    let app = Router::new().route("/health", get(health)).route("/demo/job", get(demo_job)).with_state(AppState);
    let addr: SocketAddr = "0.0.0.0:3000".parse()?;
    let listener = tokio::net::TcpListener::bind(addr).await?;
    axum::serve(listener, app).await?;
    Ok(())
}
