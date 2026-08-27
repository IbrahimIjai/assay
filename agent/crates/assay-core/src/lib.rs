use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use uuid::Uuid;

pub type JobId = Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReserveJob {
    pub job_id: JobId,
    pub asset_id: String,
    pub token_supply: String,
    pub unit: String,
    pub documents: Vec<DocumentRef>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DocumentRef {
    pub document_id: Uuid,
    pub path: String,
    pub sha256: String,
}

impl DocumentRef {
    pub fn from_bytes(path: impl Into<String>, bytes: &[u8]) -> Self {
        let mut h = Sha256::new();
        h.update(bytes);
        Self {
            document_id: Uuid::new_v4(),
            path: path.into(),
            sha256: format!("{:x}", h.finalize()),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CustodianAttestation {
    pub attestation_id: Uuid,
    pub asset_id: String,
    pub custodian: String,
    pub quantity: String,
    pub unit: String,
    pub account_ref: String,
    pub as_of: DateTime<Utc>,
    pub source_document: Uuid,
    pub extraction_confidence: f32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Severity {
    Info,
    Low,
    Medium,
    High,
    Critical,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RiskFinding {
    pub severity: Severity,
    pub category: String,
    pub explanation: String,
    pub evidence_ids: Vec<Uuid>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EvidenceResult {
    pub document_id: Uuid,
    pub valid: bool,
    pub findings: Vec<RiskFinding>,
    pub attestations: Vec<CustodianAttestation>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Reconciliation {
    pub asset_id: String,
    pub total_quantity: String,
    pub token_supply: String,
    pub covered: bool,
    pub agreement: bool,
    pub selected_attestations: Vec<Uuid>,
    pub findings: Vec<RiskFinding>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReserveWitnessInput {
    pub asset_id: String,
    pub token_supply: String,
    pub time_bound: i64,
    pub quantities: Vec<String>,
    pub account_refs: Vec<String>,
    pub attestation_ids: Vec<Uuid>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AgentRun<T> {
    pub run_id: Uuid,
    pub output: T,
    pub model: String,
    pub started_at: DateTime<Utc>,
    pub completed_at: DateTime<Utc>,
}

pub fn parse_decimal(s: &str) -> Result<f64, String> {
    s.trim()
        .replace(',', "")
        .parse::<f64>()
        .map_err(|e| format!("invalid quantity `{s}`: {e}"))
}
