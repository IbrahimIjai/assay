# Assay agent architecture

## Principle

AI interprets messy evidence. Deterministic Rust validates and reconciles it. ZK proves the exact statements encoded in the witness. Solidity enforces the resulting claim.

## Agents

1. Document Agent - extracts custodian facts from PDFs into a typed schema.
2. Evidence Agent - deterministic validation plus confidence warnings.
3. Anomaly Agent - finds suspicious changes/inconsistencies across attestations.
4. Coordinator - deterministic quorum/tolerance reconciliation; no LLM authority.
5. Witness Builder - deterministic conversion to Circom inputs; no LLM authority.
6. Prover - cryptographic service boundary; no LLM authority.

## Mainnet demo implementation

`assay-orchestrator --mock --prove` reads the bundled PDFs, runs extraction, anomaly review,
deterministic reconciliation, witness construction, Groth16 proof generation, and local proof
verification. `--submit` additionally publishes the proof to the deployed HashKey mainnet
`ReserveRegistry`. The API exposes this fixed healthy/under-backed flow at `POST /demo/proof`;
mainnet submission is disabled unless `ASSAY_ENABLE_SUBMISSION=true`.

The fixed demo signer derives deterministic keys for synthetic custodian fixtures. It must be
replaced by signatures originating from real custodians before the protocol represents real-world
assets.

## Trust boundary

An LLM never receives a private key and never has mint/transfer authority. A custodian or trusted signer provides the cryptographic binding for the attestation. The proof establishes consistency of signed statements; it does not prove physical truth when the signer lies.
