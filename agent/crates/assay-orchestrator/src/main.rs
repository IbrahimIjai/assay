use anyhow::{Context, Result};
use assay_agents::{
    AnomalyAgent, DocumentAgent, DocumentExtractor, NativePdfExtractor, build_witness, reconcile,
};
use assay_core::{DocumentRef, ReserveJob};
use assay_llm::{Llm, MockLlm, OpenAiCompatible};
use chrono::{Duration, Utc};
use std::{path::PathBuf, process::Stdio, sync::Arc};
use tokio::process::Command;
use uuid::Uuid;

#[tokio::main]
async fn main() -> Result<()> {
    tracing_subscriber::fmt::init();
    let raw_args: Vec<String> = std::env::args().skip(1).collect();
    let mock = raw_args.iter().any(|arg| arg == "--mock");
    let prove = raw_args
        .iter()
        .any(|arg| arg == "--prove" || arg == "--submit");
    let submit = raw_args.iter().any(|arg| arg == "--submit");
    let positional: Vec<&String> = raw_args
        .iter()
        .filter(|arg| !arg.starts_with("--"))
        .collect();
    let asset_id = positional
        .first()
        .map(|value| (*value).clone())
        .unwrap_or_else(|| "SILVER-001".into());
    let token_supply = positional
        .get(1)
        .map(|value| (*value).clone())
        .unwrap_or_else(|| "4000".into());
    let unit = positional
        .get(2)
        .map(|value| (*value).clone())
        .unwrap_or_else(|| "kg".into());
    let docs: Vec<PathBuf> = positional.iter().skip(3).map(PathBuf::from).collect();
    if docs.is_empty() {
        anyhow::bail!(
            "usage: cargo run -p assay-orchestrator -- SILVER-001 4000 kg docs/a.pdf docs/b.pdf"
        );
    }

    let llm: Arc<dyn Llm> = if mock {
        Arc::new(MockLlm)
    } else {
        Arc::new(
            OpenAiCompatible::from_env().context("configure OPENAI_API_KEY/OPENAI_MODEL first")?,
        )
    };
    let extractor = NativePdfExtractor;
    let agent = DocumentAgent {
        llm: Arc::clone(&llm),
    };
    let mut evidence = Vec::new();

    for path in docs {
        println!("[document-agent] reading {}", path.display());
        let extracted = extractor.extract(&path).await?;
        println!(
            "[document-agent] {} chars; sha256={}",
            extracted.text.len(),
            extracted.document.sha256
        );
        let result = agent.run(extracted).await?;
        println!(
            "[document-agent] valid={} findings={} attestations={}",
            result.valid,
            result.findings.len(),
            result.attestations.len()
        );
        evidence.push(result);
    }

    let attestations = evidence
        .iter()
        .flat_map(|result| result.attestations.clone())
        .collect::<Vec<_>>();
    let anomaly = AnomalyAgent { llm }.run(&attestations).await?;
    println!("[anomaly-agent] findings={}", anomaly.findings.len());
    for finding in &anomaly.findings {
        println!(
            "[anomaly-agent] {:?}: {} - {}",
            finding.severity, finding.category, finding.explanation
        );
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
    println!(
        "asset={} reserve={} supply={} covered={} agreement={}",
        rec.asset_id, rec.total_quantity, rec.token_supply, rec.covered, rec.agreement
    );
    for f in &rec.findings {
        println!("{:?}: {} - {}", f.severity, f.category, f.explanation);
    }
    let witness = build_witness(&job, &evidence, cutoff)?;
    println!("\n=== WITNESS ===");
    println!("{}", serde_json::to_string_pretty(&witness)?);
    if prove {
        let contracts_dir = PathBuf::from(
            std::env::var("ASSAY_CONTRACTS_DIR").unwrap_or_else(|_| "../contracts".into()),
        );
        let input_path = std::env::temp_dir().join(format!("assay-evidence-{}.json", job.job_id));
        tokio::fs::write(&input_path, serde_json::to_vec_pretty(&attestations)?).await?;
        let mut command = Command::new("node");
        command
            .current_dir(&contracts_dir)
            .arg("circuit/scripts/prove_reserves.mjs")
            .arg("--input")
            .arg(&input_path)
            .arg("--supply")
            .arg(&job.token_supply)
            .stdout(Stdio::piped())
            .stderr(Stdio::piped());
        if submit {
            command.arg("--submit");
        }
        let output = command.output().await.context("run reserve prover")?;
        let _ = tokio::fs::remove_file(&input_path).await;
        if !output.status.success() {
            anyhow::bail!(
                "reserve prover failed: {}",
                String::from_utf8_lossy(&output.stderr)
            );
        }
        println!(
            "\n=== GROTH16 PROOF ===\n{}",
            String::from_utf8_lossy(&output.stdout)
        );
    } else {
        println!(
            "\nRun again with --prove for a locally verified Groth16 proof, or --submit to publish it."
        );
    }
    Ok(())
}
