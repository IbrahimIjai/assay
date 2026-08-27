# Assay Protocol

> **Verified reserves and private credit for tokenized real-world assets.**

This repository is the Foundry + Circom starting implementation of the protocol in `assay-protocol.md`.

## Repository layout

```text
assay-protocol/
├── src/
│   ├── CustodianRegistry.sol
│   ├── ReserveRegistry.sol
│   ├── AssayCompliance.sol
│   ├── ShieldedVault.sol
│   ├── LendingPool.sol
│   ├── ChallengeManager.sol
│   ├── interfaces/
│   │   ├── IReserveVerifier.sol
│   │   ├── ICompliance.sol
│   │   └── IBorrowVerifier.sol
│   ├── mocks/
│   └── tokens/
├── circuit/
│   ├── reserve_coverage.circom
│   ├── input.example.json
│   ├── scripts/
│   └── README.md
├── test/
│   └── ReserveRegistry.t.sol
├── script/
│   └── Deploy.s.sol
├── foundry.toml
├── package.json
└── remappings.txt
```

## What is implemented

### Reserve verification

`CustodianRegistry` manages issuer/custodian sets and the off-chain-computed Merkle root.
`ReserveRegistry` verifies the Groth16 proof, stores the public attestation, and exposes freshness/coverage status.

### Enforcement

`AssayCompliance` blocks issuance when reserve coverage is missing, stale, or failed. `VerifiedRwaToken` is a minimal demo token wired to that compliance module.

### Private credit boundary

`ShieldedVault` implements commitment/nullifier state and a verifier adapter for the future borrower eligibility circuit. `LendingPool` provides a deliberately simple stablecoin liquidity pool for the hackathon demo.

### Disputes

`ChallengeManager` provides a bonded dispute ledger. The real adjudication/slashing policy remains a separate concern.

## Dependencies

The Solidity code targets OpenZeppelin Contracts 5.6.1. OpenZeppelin documents the current audited release line and Foundry installation/remapping flow. citeturn135173search2turn135173search10

The circuit uses Circom 2.x and circomlib Poseidon/EdDSA templates. citeturn905599search5turn764543search0

Install Solidity dependencies:

```bash
forge install OpenZeppelin/openzeppelin-contracts@v5.6.1
forge install foundry-rs/forge-std
```

Install circuit tooling:

```bash
npm install
```

## Test contracts

```bash
forge test -vvv
```

The tests currently exercise the mocked verifier boundary so the compliance/enforcement path can be developed independently of proving setup.

## Compile the circuit

```bash
npm run circuit:compile
npm run circuit:info
```

Then generate a Groth16 verifier using the commands in `circuit/README.md`.

## Important security boundary

The ZK proof proves that **registered custodians signed consistent reserve statements** and that the statements cover the token supply. It does not prove that a custodian's real-world statement is truthful. The protocol draft calls this out explicitly, and the implementation keeps that oracle limitation visible rather than hiding it.

This is a hackathon implementation, not an audited financial protocol.
