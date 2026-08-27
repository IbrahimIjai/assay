use anyhow::{bail, Context, Result};
use assay_core::{parse_decimal, CustodianAttestation, DocumentRef, EvidenceResult, Reconciliation, ReserveJob, ReserveWitnessInput, RiskFinding, Severity};
use assay_llm::Llm;
use async_trait::async_trait;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::{path::Path, sync::Arc};
use uuid::Uuid;

#[derive(Debug, Clone)]
pub struct ExtractedDocument {
    pub document: DocumentRef,
    pub text: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LlmExtraction {
    pub asset_id: String,
    pub custodian: String,
    pub quantity: String,
    pub unit: String,
    pub account_ref: String,
    pub as_of: String,
    pub confidence: f32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AnomalyResponse {
    pub findings: Vec<RiskFinding>,
}

#[async_trait]
pub trait DocumentExtractor: Send + Sync {
    async fn extract(&self, path: &Path) -> Result<ExtractedDocument>;
}

pub struct NativePdfExtractor;

#[async_trait]
impl DocumentExtractor for NativePdfExtractor {
    async fn extract(&self, path: &Path) -> Result<ExtractedDocument> {
        let bytes = tokio::fs::read(path).await.with_context(|| format!("read {}", path.display()))?;
        let document = DocumentRef::from_bytes(path.display().to_string(), &bytes);
        let text = pdf_extract::extract_text_from_mem(&bytes)
            .with_context(|| format!("extract PDF text from {}", path.display()))?;
        Ok(ExtractedDocument { document, text })
    }
}

pub struct DocumentAgent<L: Llm + ?Sized> { pub llm: Arc<L> }

impl<L: Llm + ?Sized> DocumentAgent<L> {
    pub async fn run(&self, doc: ExtractedDocument) -> Result<EvidenceResult> {
        let system = r#"You are Assay's RWA evidence extraction agent. Extract ONLY facts explicitly present in the supplied custodian document. Never invent or infer quantities. Return JSON with asset_id, custodian, quantity, unit, account_ref, as_of (RFC3339), confidence, and one or more concise findings if anything is inconsistent. If a field is absent, return an empty string. This output is evidence for later deterministic validation, not proof of physical truth."#;
        let extracted: LlmExtraction = serde_json::from_value(self.llm.complete_json(system, &doc.text).await?)?;
        let as_of = DateTime::parse_from_rfc3339(&extracted.as_of)?.with_timezone(&Utc);
        let att = CustodianAttestation {
            attestation_id: Uuid::new_v4(),
            asset_id: extracted.asset_id,
            custodian: extracted.custodian,
            quantity: extracted.quantity,
            unit: extracted.unit,
            account_ref: extracted.account_ref,
            as_of,
            source_document: doc.document.document_id,
            extraction_confidence: extracted.confidence,
        };
        let mut findings = Vec::new();
        if att.extraction_confidence < 0.85 {
            findings.push(RiskFinding {
                severity: Severity::Medium,
                category: "low_extraction_confidence".to_string(),
                explanation: "The document agent is not sufficiently confident in the extraction; human or secondary operator review is recommended.".to_string(),
                evidence_ids: vec![att.attestation_id],
            });
        }
        if parse_decimal(&att.quantity).is_err() || att.asset_id.is_empty() || att.account_ref.is_empty() {
            findings.push(RiskFinding {
                severity: Severity::High,
                category: "malformed_attestation".to_string(),
                explanation: "Required reserve fields could not be safely extracted.".to_string(),
                evidence_ids: vec![att.attestation_id],
            });
        }
        Ok(EvidenceResult { document_id: doc.document.document_id, valid: findings.iter().all(|f| !matches!(f.severity, Severity::High | Severity::Critical)), findings, attestations: vec![att] })
    }
}

pub struct AnomalyAgent<L: Llm + ?Sized> { pub llm: Arc<L> }

impl<L: Llm + ?Sized> AnomalyAgent<L> {
    pub async fn run(&self, attestations: &[CustodianAttestation]) -> Result<AnomalyResponse> {
        let input = serde_json::to_string(attestations)?;
        let system = r#"You are an RWA anomaly analyst. Review structured custodian attestations. Return JSON {"findings":[...]}. Flag suspicious jumps, mismatched asset IDs/units, stale dates, duplicate account references, or inconsistent custodian history visible in the supplied records. Do not declare physical truth."#;
        Ok(serde_json::from_value(self.llm.complete_json(system, &input).await?)?)
    }
}

pub fn reconcile(job: &ReserveJob, evidence: &[EvidenceResult], freshness_cutoff: DateTime<Utc>) -> Result<Reconciliation> {
    let mut selected = Vec::new();
    let mut total = 0.0_f64;
    let mut findings = Vec::new();
    let mut asset_match = true;
    for result in evidence {
        if !result.valid { continue; }
        for att in &result.attestations {
            if att.asset_id != job.asset_id || att.unit != job.unit {
                asset_match = false;
                findings.push(RiskFinding {
                    severity: Severity::High,
                    category: "asset_or_unit_mismatch".into(),
                    explanation: format!("Attestation {} does not match job asset/unit.", att.attestation_id),
                    evidence_ids: vec![att.attestation_id],
                });
                continue;
            }
            if att.as_of < freshness_cutoff {
                findings.push(RiskFinding {
                    severity: Severity::High,
                    category: "stale_attestation".into(),
                    explanation: format!("Attestation {} is older than the proof time bound.", att.attestation_id),
                    evidence_ids: vec![att.attestation_id],
                });
                continue;
            }
            let q = parse_decimal(&att.quantity).map_err(anyhow::Error::msg)?;
            if !q.is_finite() || q < 0.0 { bail!("invalid reserve quantity for {}", att.attestation_id); }
            total += q;
            selected.push(att.attestation_id);
        }
    }
    let supply = parse_decimal(&job.token_supply).map_err(anyhow::Error::msg)?;
    let agreement = selected.len() > 0 && asset_match;
    Ok(Reconciliation {
        asset_id: job.asset_id.clone(),
        total_quantity: total.to_string(),
        token_supply: job.token_supply.clone(),
        covered: agreement && total >= supply,
        agreement,
        selected_attestations: selected,
        findings,
    })
}

pub fn build_witness(job: &ReserveJob, evidence: &[EvidenceResult], freshness_cutoff: DateTime<Utc>) -> Result<ReserveWitnessInput> {
    let mut quantities = Vec::new();
    let mut account_refs = Vec::new();
    let mut ids = Vec::new();
    for result in evidence {
        for att in &result.attestations {
            if att.asset_id == job.asset_id && att.unit == job.unit && att.as_of >= freshness_cutoff && result.valid {
                quantities.push(att.quantity.clone());
                account_refs.push(att.account_ref.clone());
                ids.push(att.attestation_id);
            }
        }
    }
    Ok(ReserveWitnessInput {
        asset_id: job.asset_id.clone(),
        token_supply: job.token_supply.clone(),
        time_bound: freshness_cutoff.timestamp(),
        quantities,
        account_refs,
        attestation_ids: ids,
    })
}

pub fn canonical_hash<T: Serialize>(value: &T) -> String {
    let bytes = serde_json::to_vec(value).expect("serializable");
    let mut h = Sha256::new();
    h.update(bytes);
    format!("0x{:x}", h.finalize())
}
