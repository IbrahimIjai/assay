Assay Frontend — AI Coding Agent Brief

Mission

Build the Assay frontend as a serious RWA verification dashboard. The UI must make one story obvious:

Private evidence goes in. AI agents analyze it. A ZK proof verifies the reserve claim. HashKey Chain enforces the result.

Do not build a generic crypto dashboard. The primary demo is tokenized silver (SILVER-001).

Product hierarchy

The frontend has five areas, in this order of importance:

Public asset verification

Issuer reserve-proof workflow

Borrower private position workflow

Lender/pool health

Operator/agent activity

The first demo should work even if only #1 and #2 are complete.

Primary demo flow

State A — Healthy asset

Open /asset/SILVER-001.

Show:

Asset: Verified Silver

Asset ID: SILVER-001

Token supply: 4,000 kg

Proven reserves: 4,180 kg

Coverage: 104.5%

Status: VERIFIED

Proof freshness countdown

Custodian count, but not custodian identities

Latest proof hash

Then show an action:

Mint tokens

The button should be enabled.

State B — Private evidence processing

Navigate to /issuer/proof.

Show a dropzone:

Upload custodian statements

Upload:

custodian_a_healthy.pdf

custodian_b_healthy.pdf

custodian_c_healthy.pdf

After upload, show a pipeline:

Documents received
      ↓
AI extraction
      ↓
Evidence validation
      ↓
Cross-document reconciliation
      ↓
Witness construction
      ↓
ZK proof generation
      ↓
On-chain verification

Each stage should transition visually. Do not fake a single instant loading spinner.

State C — Public/private boundary

This is the most important visual.

Show two panels:

Private evidence

Custodian A     1,850 kg
Custodian B       920 kg
Custodian C     1,410 kg
Account refs    PRIVATE
Signatures      PRIVATE
Source PDFs     PRIVATE

Public proof

Asset            SILVER-001
Token supply     4,000 kg
Coverage         TRUE
As-of            2026-08-27
Custodian root   0x...
Proof hash       0x...

The UI must explain that the chain receives the claim and proof, not the underlying reserve book.

State D — Failure demonstration

Replace custodian C with:

custodian_c_underbacked.pdf

Now the UI must show:

1,850 + 920 + 830 = 3,600 kg
Token supply = 4,000 kg
Coverage = FAILED

Then try the mint action.

The UI should show a real transaction failure/revert from AssayCompliance / the RWA token.

This is the most important demo moment.

Pages

/

Hero:

Prove an RWA is backed without exposing what backs it.

Supporting line:

AI agents turn private custodian records into verifiable reserve proofs. HashKey Chain enforces the result.

Hero metrics:

Assets verified

Latest coverage ratio

Proofs generated

Proof freshness

Main CTA:

View Verified Assets

Secondary CTA:

Run Demo

/asset/[assetId]

This is the strongest public page.

Sections:

Asset header

Coverage status

Reserve vs supply visualization

Proof freshness

Proof history

Custodian count

Contract addresses

What is public / what is private

Do not show private custodian data.

/issuer/proof

Purpose: run the reserve verification pipeline.

UI components:

drag/drop upload

document cards

extracted structured facts

AI findings

reconciliation result

proof-generation progress

transaction status

Document card example:

Custodian Statement A

Asset       SILVER-001
Quantity    1,850 kg
As of       Aug 27, 2026
Account     VAULT-001
Confidence  99%

[View extracted evidence]

Extraction is evidence, not truth. Label it accordingly.

/issuer/mint

Show:

Reserve coverage
104.5%  ✓
Freshness
13h 22m remaining

Mint amount
[ 100 ]

[Mint 100 vSILVER]

When reserve proof is stale/failed:

MINT DISABLED

Reserve coverage could not be verified.
The compliance contract will reject issuance.

/proofs

A proof explorer.

Each row:

proof ID / hash

asset

timestamp

covered / failed

freshness

on-chain transaction

Filters:

verified

failed

stale

/borrow

This is secondary for the hackathon.

Show the concept clearly even if borrowing is mocked:

Private collateral
vSILVER

Position
1,000 vSILVER

Maximum LTV
60%

Borrowable
$24,000 USDC

[Generate private borrowing proof]

Never display a user's note secret.

/lend

Show:

total supplied

total borrowed

utilization

pool solvency

collateral coverage

maturity ladder

The lender sees pool health, not borrower identities.

/operator

Show:

operator stake

verification jobs

agreement rate

failed rounds

slashing/challenge status

This page demonstrates the future decentralized operator network.

Frontend state machine

The asset page should use a simple state machine:

NO_PROOF
   ↓
PROCESSING
   ↓
VERIFIED
   ↓
STALE
   ↓
FAILED

And proof jobs:

UPLOADED
 → EXTRACTING
 → VALIDATING
 → RECONCILING
 → BUILDING_WITNESS
 → PROVING
 → SUBMITTING
 → VERIFIED

Do not let arbitrary UI booleans create contradictory states.

Target API contract

The current crates/assay-api service is only a shell with /health and /demo/job. Treat the endpoints below as the frontend/backend contract to implement.

GET /api/assets

Returns public asset summaries.

[
  {
    "assetId": "SILVER-001",
    "name": "Verified Silver",
    "unit": "kg",
    "tokenSupply": "4000",
    "provenReserve": "4180",
    "coverageBps": 10450,
    "covered": true,
    "status": "verified",
    "asOf": "2026-08-27T09:00:00Z",
    "proofHash": "0x..."
  }
]

GET /api/assets/:assetId

Returns the public asset verification view.

POST /api/proof-jobs

Multipart upload of custodian PDFs.

Request fields:

assetId

tokenSupply

unit

documents[]

Response:

{
  "jobId": "uuid",
  "status": "uploaded"
}

GET /api/proof-jobs/:jobId

Returns pipeline status:

{
  "jobId": "uuid",
  "stage": "reconciling",
  "progress": 72,
  "documents": [],
  "findings": [],
  "reconciliation": {
    "totalQuantity": "4180",
    "tokenSupply": "4000",
    "covered": true,
    "agreement": true
  },
  "proof": null,
  "transaction": null
}

Poll initially every 1 second; switch to SSE/WebSocket later if needed. For the hackathon, polling is acceptable.

GET /api/proofs

Public proof explorer.

GET /api/pools/health

Public lender metrics.

Wallet / chain integration

The frontend should use the user's injected EVM wallet.

Required actions:

connect wallet

switch to HSK testnet when required

read contract addresses

submit transactions

wait for confirmations

show explorer links

Keep contract addresses in environment variables/config, never hard-code them throughout components.

Suggested config shape:

export const contracts = {
  reserveRegistry: import.meta.env.VITE_RESERVE_REGISTRY,
  reserveVerifier: import.meta.env.VITE_RESERVE_VERIFIER,
  compliance: import.meta.env.VITE_ASSAY_COMPLIANCE,
  rwaToken: import.meta.env.VITE_RWA_TOKEN,
  shieldedVault: import.meta.env.VITE_SHIELDED_VAULT,
  lendingPool: import.meta.env.VITE_LENDING_POOL,
};

Design language

Visual tone:

institutional

financial infrastructure

cryptographic

quiet, trustworthy

Avoid:

cartoon crypto graphics

excessive gradients

meme styling

fake “AI magic” animations

huge token-price dashboards

Use status language such as:

VERIFIED, STALE, FAILED, PROCESSING.

The most important visual hierarchy is:

Asset → Proof → Coverage → Enforcement.

Demo mode

Because this is a hackathon, implement a local demo switch:

VITE_DEMO_MODE=true

In demo mode the frontend can use the synthetic PDF/API fixtures and deterministic mock proof responses, but it must label simulated content clearly.

Never make fake blockchain transactions look real.

Non-negotiable constraints

Do not expose private note secrets to the backend.

Do not show custodian identity when the protocol promises privacy.

Do not claim ZK proves physical truth. It proves statements satisfy the circuit constraints.

Do not let UI state claim VERIFIED before the proof/verifier result is actually available.

Keep the healthy → under-backed transition demonstrable in under 90 seconds.