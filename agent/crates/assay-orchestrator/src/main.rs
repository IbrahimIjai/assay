use anyhow::{Context, Result};
use assay_agents::{build_witness, reconcile, DocumentAgent, DocumentExtractor, NativePdfExtractor};
use assay_core::{DocumentRef, ReserveJob};
use assay_llm::{Llm, MockLlm, OpenAiCompatible};
use chrono::{Duration, Utc};
use std::{path::PathBuf, sync::Arc};
use uuid::Uuid;

#[tokio::main]
async fn main() -> Result<()> {
    tracing_subscriber::fmt::init();
    let mut args = std::env::args().skip(1);
    let mock = std::env::args().any(|a| a == "--mock");
    let asset_id = args.next().unwrap_or_else(|| "SILVER-001".into());
    let token_supply = args.next().unwrap_or_else(|| "4000".into());
    let unit = args.next().unwrap_or_else(|| "kg".into());
    let docs: Vec<PathBuf> = std::env::args().skip(4).filter(|a| a != "--mock").map(PathBuf::from).collect();
    if docs.is_empty() { anyhow::bail!("usage: cargo run -p assay-orchestrator -- SILVER-001 4000 kg docs/a.pdf docs/b.pdf"); }

    let llm: Arc<dyn Llm> = if mock { Arc::new(MockLlm) } else { Arc::new(OpenAiCompatible::from_env().context("configure OPENAI_API_KEY/OPENAI_MODEL first")?) };
    let extractor = NativePdfExtractor;
    let agent = DocumentAgent { llm };
    let mut evidence = Vec::new();

    for path in docs {
        println!("[document-agent] reading {}", path.display());
        let extracted = extractor.extract(&path).await?;
        println!("[document-agent] {} chars; sha256={}", extracted.text.len(), extracted.document.sha256);
        let result = agent.run(extracted).await?;
        println!("[document-agent] valid={} findings={} attestations={}", result.valid, result.findings.len(), result.attestations.len());
        evidence.push(result);
    }

    let cutoff = Utc::now() - Duration::hours(24);
    let job = ReserveJob {
        job_id: Uuid::new_v4(),
        asset_id,
        token_supply,
        unit,
        documents: Vec::<DocumentRef>::new(),
        created_at: Utc::now(),
    };
    let rec = reconcile(&job, &evidence, cutoff)?;
    println!("\n=== RECONCILIATION ===");
    println!("asset={} reserve={} supply={} covered={} agreement={}", rec.asset_id, rec.total_quantity, rec.token_supply, rec.covered, rec.agreement);
    for f in &rec.findings { println!("{:?}: {} - {}", f.severity, f.category, f.explanation); }
    let witness = build_witness(&job, &evidence, cutoff)?;
    println!("\n=== WITNESS ===");
    println!("{}", serde_json::to_string_pretty(&witness)?);
    println!("\nNext: feed this canonical witness into circuits/scripts/prove.sh, then submit the Groth16 proof to ReserveRegistry.");
    Ok(())
}
