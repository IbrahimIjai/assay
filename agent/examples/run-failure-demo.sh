#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
cargo run -p assay-orchestrator -- SILVER-001 4000 kg \
  demo-pdfs/custodian_a_healthy.pdf \
  demo-pdfs/custodian_b_healthy.pdf \
  demo-pdfs/custodian_c_underbacked.pdf \
  --mock --prove
