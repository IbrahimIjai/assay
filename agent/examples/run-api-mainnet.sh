#!/usr/bin/env bash
set -euo pipefail

AGENT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CONTRACTS_ROOT="$(cd "$AGENT_ROOT/../contracts" && pwd)"

set -a
source "$CONTRACTS_ROOT/.env"
if [[ -f "$AGENT_ROOT/.env" ]]; then
  source "$AGENT_ROOT/.env"
fi
set +a

export ASSAY_AGENT_ROOT="$AGENT_ROOT"
export ASSAY_CONTRACTS_DIR="$CONTRACTS_ROOT"
export HASHKEY_RPC_URL="https://mainnet.hsk.xyz"
export RESERVE_REGISTRY_ADDRESS="0xBe9ec79854e459F38E0B868A0c3429AAbf6784b2"
# Proofs are submitted by the connected browser wallet by default. Set this to
# true explicitly only when server-side signing is intentional.
export ASSAY_ENABLE_SUBMISSION="${ASSAY_ENABLE_SUBMISSION:-false}"
export ASSAY_API_ADDR="127.0.0.1:3001"

cd "$AGENT_ROOT"
cargo build --workspace
exec target/debug/assay-api
