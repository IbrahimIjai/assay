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

## Trust boundary

An LLM never receives a private key and never has mint/transfer authority. A custodian or trusted signer provides the cryptographic binding for the attestation. The proof establishes consistency of signed statements; it does not prove physical truth when the signer lies.
