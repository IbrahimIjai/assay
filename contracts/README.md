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

## Deploy to HashKey Chain mainnet

The deployment is configured for HashKey Chain mainnet (chain ID `177`) through the
`hsk_mainnet` RPC alias. The script rejects any other chain ID to prevent an accidental
testnet deployment.

Set the deployer key without committing it to the repository, confirm that the derived
account has enough HSK for gas, and run:

```bash
export DEPLOYER_PRIVATE_KEY=<private-key>
forge script script/Deploy.s.sol:Deploy \
  --rpc-url hsk_mainnet \
  --broadcast \
  --slow
```

To inspect the current gas price before broadcasting:

```bash
cast gas-price --rpc-url hsk_mainnet
```

The script deploys `MockStablecoin` and `MockBorrowVerifier` and seeds the lending pool
with mock tokens. It is therefore a mainnet demo deployment, not a production deployment
using a canonical stablecoin or a production borrower verifier.

### Current mainnet demo

The contracts are deployed on HashKey Chain mainnet:

| Contract | Address |
| --- | --- |
| Groth16 verifier | `0x7D4adbab9A78a0b278DCc9B16d3643a2F8327c93` |
| Custodian registry | `0x3BaF50F4152Bb2C3F0E27693600c6C6c56D9D0E7` |
| Reserve registry | `0xBe9ec79854e459F38E0B868A0c3429AAbf6784b2` |
| Compliance | `0xfA845604F52843a7b5cfA4030120c6238741F420` |
| vSILVER | `0xed11D4afd9A7a4fe0bbBAC34315B6B438FF1bc78` |
| mUSDC | `0x337361Dd8D8Ee27Ab5EfFec69412AC8B080d704a` |
| Borrow verifier (demo) | `0xC6f99ef3133C628B265551Eb677a2Be8cF411e0d` |
| Shielded vault | `0xBB4e1DC17e8B233B9233aAD487D44e420490058B` |
| Lending pool | `0xe0Afb36ca378CdF034c2BdC5Ee3Ac90f726a20c5` |
| Challenge manager | `0x6BfD1C86a78822243F20461F96EB013566412580` |

For the video, start the mainnet-enabled agent API from `agent/` with
`./examples/run-api-mainnet.sh`, then start the frontend with `bun run dev`.
Use this order: healthy proof, mint 1,000 vSILVER, supply 1,000 mUSDC, deposit/borrow/repay,
then submit the under-backed proof last to demonstrate that subsequent issuance is blocked.

## Compile the circuit

```bash
npm run circuit:compile
npm run circuit:info
```

Then generate a Groth16 verifier using the commands in `circuit/README.md`.

## Important security boundary

The ZK proof proves that **registered custodians signed consistent reserve statements** and that the statements cover the token supply. It does not prove that a custodian's real-world statement is truthful. The protocol draft calls this out explicitly, and the implementation keeps that oracle limitation visible rather than hiding it.

This is a hackathon implementation, not an audited financial protocol.
