# Assay Protocol

**Verified reserves and private credit for tokenized real-world assets on HashKey Chain.**

> *Assay* — the test of a precious metal to determine its purity. The name is the thesis.

---

## 1. In plain English

When you buy a token that claims to be backed by real silver in a vault, or a real building collecting rent, you are trusting a PDF the issuer publishes every few months. Nobody checks it continuously, and nobody can check it without the issuer handing over their private records. Assay fixes that. Small AI programs read the documents custodians already produce — vault statements, bank confirmations, rent rolls — and turn them into a cryptographic proof that the real assets held are at least equal to the tokens issued. The proof reveals nothing about what is inside the vault or who owns what; it only proves the backing is there. That proof is wired directly into the token, so an issuer physically cannot mint more tokens than they can back. On top of this we build a lending market: because the backing is continuously proven, you can borrow stablecoins against your tokenized silver or property — and you can do it privately, without publishing your net worth or your identity to everyone watching the chain, while still satisfying every regulatory eligibility rule.

---

## 2. The problem

Three gaps, all real, all currently open on HashKey Chain.

**Reserves are trusted, not verified.** Tokenized silver, real estate and notes are live on HashKey today. Verification of the underlying is a periodic auditor's PDF. Between reports, holders have no signal at all.

**ERC-3643 gives permissioning but not confidentiality.** The standard binds every holder to an on-chain identity and checks eligibility by address lookup. Consequence: an investor's entire book — positions, sizes, entry timing, counterparties — is public and tied to a KYC'd identity. This is the loudest institutional objection to on-chain RWA and it is unsolved on this chain.

**RWA collateral is nearly unusable in DeFi.** A lender can price the token but cannot verify the backing, so RWA lending is either permissioned and ultra-conservative or does not exist.

Assay addresses all three with one mechanism: make backing provable, then make that proof composable.

---

## 3. What we are building

Three layers. Each is useful alone; together they are a market.

### Layer 1 — Proof of Reserve
Agents ingest custodian documents, a circuit proves reserves ≥ supply without revealing the underlying book, and the result is written to an on-chain registry.

### Layer 2 — Enforcement
The registry is wired into the token's ERC-3643 compliance module. Stale or failed proof means minting reverts. Not a dashboard — an actual constraint on the asset.

### Layer 3 — Private Lending
A shielded vault holds RWA collateral as a single eligible ERC-3643 holder. Borrowers prove note ownership *and* valid investor eligibility in zero knowledge, then draw stablecoins. Positions are private; pool solvency is public.

---

## 4. End-to-end walkthrough

1. Issuer registers its custodians and their signing keys in `CustodianRegistry`.
2. Custodians sign structured attestations: `{asset, quantity, accountRef, asOf}`.
3. Ingestion agents fetch and normalise custodian documents into those structured payloads. Multiple independent operators run this, each staked.
4. Operators must agree within tolerance. Disagreement fails the round and publishes the discrepancy.
5. The prover builds a witness from the signed attestations and generates a proof.
6. `ReserveVerifier` verifies on-chain; `ReserveRegistry` stores `{asset, covered, asOf, proofHash}`.
7. `AssayCompliance` reads the registry. Mint reverts if the proof is stale or coverage failed.
8. A holder deposits collateral into `ShieldedVault` and receives a note commitment.
9. To borrow, the holder submits one proof covering note ownership, eligibility, valuation, coverage freshness and LTV. Stablecoins go to a stealth address.
10. Loans are fixed-term and over-collateralized. Repay by maturity or the collateral is auctioned.

---

## 5. What the witness is (and is not)

The witness is the circuit's **private input**. It is not a public disclosure.

Public: proof, token supply, custodian set root, time bound, coverage boolean.
Private: individual quantities, account references, which custodians signed.

**Why the agent cannot lie.** Every quantity in the witness must be bound to a valid signature from a key in the registered custodian set. The agent holds no signing key, so it cannot invent reserves. It can only *omit* an attestation, which makes coverage look worse, never better. The failure mode is asymmetric and slashable.

**What this does not fix.** If a custodian signs false data, you get a valid proof of a lie. ZK gives consistency, not physical truth. The oracle problem survives. State this explicitly rather than letting a judge find it.

---

## 6. Contracts

All Solidity, HashKey Chain (OP Stack L2, EVM-equivalent).

### `CustodianRegistry.sol`
Issuer-governed set of custodian signing keys per asset.

```solidity
function registerCustodian(bytes32 asset, uint256[2] calldata eddsaPubKey) external onlyIssuer;
function revokeCustodian(bytes32 asset, uint256[2] calldata eddsaPubKey) external onlyIssuer;
function custodianRoot(bytes32 asset) external view returns (bytes32);
```

Maintains a Merkle root over active custodian keys. The root is a public input to the circuit.

### `ReserveVerifier.sol`
Auto-generated from the circuit by snarkjs. Groth16. Single external `verifyProof`.

### `ReserveRegistry.sol`
The composable primitive. Everything else reads this.

```solidity
struct Attestation {
    bool     covered;
    uint64   asOf;
    uint256  supplyAtProof;
    bytes32  proofHash;
}

function submitProof(
    bytes32 asset,
    uint256[8] calldata proof,
    uint256[4] calldata publicInputs
) external;

function latest(bytes32 asset) external view returns (Attestation memory);
function isFresh(bytes32 asset) external view returns (bool);
function coverageStatus(bytes32 asset) external view returns (uint8); // 0 ok, 1 stale, 2 failed
```

`submitProof` checks the custodian root and supply in `publicInputs` match on-chain state before accepting.

### `AssayCompliance.sol`
ERC-3643 compliance module. This is the headline.

```solidity
function canTransfer(address from, address to, uint256 amount) external view returns (bool);
function created(address to, uint256 amount) external; // reverts if !isFresh || !covered
```

### `ShieldedVault.sol`
Holds RWA collateral. Is itself a single eligible ERC-3643 holder, which preserves the permissioning model.

```solidity
function deposit(bytes32 asset, uint256 amount, bytes32 noteCommitment) external;
function borrow(
    uint256[8] calldata proof,
    bytes32 nullifier,
    bytes32 newCommitment,
    uint256 debtAmount,
    address stealthPayout,
    uint64  maturity
) external;
function repay(bytes32 loanId, uint256 amount) external;
function auction(bytes32 loanId) external; // post-maturity only
```

Append-only Merkle tree of note commitments. Nullifier set prevents double-spend.

### `LendingPool.sol`
Stablecoin side. Public and boring on purpose — lenders underwrite pool solvency, not identities.

```solidity
function supply(uint256 amount) external;
function withdraw(uint256 shares) external;
function utilisation() external view returns (uint256);
function maxLTV(bytes32 asset) external view returns (uint256); // reads ReserveRegistry
```

### `ChallengeManager.sol`
Bonded disputes against a submitted proof round. Slashes agent stake when custodian-signed data contradicts the witness.

---

## 7. Circuits

Circom + snarkjs + Groth16. Rationale in §9.

### `reserve_coverage.circom`

```
template ReserveCoverage(N, TREE_DEPTH) {
    // public
    signal input custodianRoot;
    signal input tokenSupply;
    signal input timeBound;
    signal output covered;

    // private (the witness)
    signal input quantity[N];
    signal input accountRef[N];
    signal input asOf[N];
    signal input pubKeyX[N];
    signal input pubKeyY[N];
    signal input sigR8x[N];
    signal input sigR8y[N];
    signal input sigS[N];
    signal input pathElements[N][TREE_DEPTH];
    signal input pathIndices[N][TREE_DEPTH];
}
```

Constraints:
1. **Message binding** — `Poseidon(asset, quantity[i], accountRef[i], asOf[i])` is the signed message.
2. **Signature validity** — EdDSA-Poseidon verification against `pubKey[i]`.
3. **Custodian membership** — Merkle inclusion of `Poseidon(pubKeyX[i], pubKeyY[i])` under `custodianRoot`.
4. **Freshness** — `asOf[i] >= timeBound` for all `i`.
5. **Coverage** — `sum(quantity) >= tokenSupply`.
6. **Uniqueness** — nullifier per attestation prevents replay across rounds.

Fixed `N` with zero-padding; padded slots contribute zero quantity and skip signature checks via a selector signal.

### `borrow_eligibility.circom`

```
template BorrowEligibility(TREE_DEPTH, CLAIM_DEPTH) {
    // public
    signal input noteRoot;
    signal input claimRoot;
    signal input oraclePrice;
    signal input coverageFresh;
    signal input debtAmount;
    signal input nullifier;
    signal input newCommitment;

    // private
    signal input noteAmount, noteAsset, noteBlinding, ownerSk;
    signal input notePath[TREE_DEPTH], notePathIdx[TREE_DEPTH];
    signal input claimIssuerPk[2], claimSig[3], claimExpiry, claimJurisdiction;
    signal input claimPath[CLAIM_DEPTH], claimPathIdx[CLAIM_DEPTH];
}
```

Constraints:
1. Note commitment membership under `noteRoot`.
2. Nullifier correctly derived from `ownerSk` and the note — prevents double-spend, unlinkable to the commitment.
3. Valid unexpired investor claim from a trusted issuer in `claimRoot`, jurisdiction in the permitted set.
4. `coverageFresh == 1`.
5. `debtAmount * 1e18 <= noteAmount * oraclePrice * maxLTV`.
6. `newCommitment` correctly re-commits the residual collateral.

---

## 8. Off-chain services

| Service | Language | Role |
|---|---|---|
| Ingestion agent | TypeScript | Fetch custodian documents, extract structured attestations, submit to coordinator |
| Coordinator | TypeScript | Collect N operator submissions, check tolerance agreement, assemble witness |
| Prover | Node + snarkjs | Generate Groth16 proof, submit to `ReserveRegistry` |
| Indexer | TypeScript | Event indexing for the UI; note tree sync for wallet-side proving |
| Custodian signer | TypeScript CLI | Reference tool custodians run to sign structured payloads |

Note ownership proving happens **client-side** in the browser. The server never sees a user's note secrets.

---

## 9. Technical decisions

**Circom over Noir.** Not because it is better — Noir has nicer syntax and no per-circuit trusted setup with UltraHonk. But we have shipped a Circom circuit before and know the pipeline: circomlib, snarkjs, auto-generated Solidity verifier, ~250k gas to verify, fine on an L2. A hackathon is a bad place to learn a proving stack. If more than two clear weeks remain, spend one weekend evaluating Noir and decide then.

**EdDSA over BabyJubjub, not ECDSA.** In-circuit ECDSA verification is expensive and will eat the build. Registering custodian EdDSA keys is a legitimate architectural choice and defensible in thirty seconds.

**Poseidon everywhere.** ZK-friendly, in circomlib, consistent across both circuits.

**Fixed-term over-collateralized loans, no ongoing liquidation.** Hidden positions mean nobody knows when to liquidate. Three options exist: borrower-attested health proofs, threshold disclosure to a committee, or fixed-term expiry. We take fixed-term. Silver and property are low-volatility collateral, so this is a genuinely appropriate product rather than a dodge, and it removes the entire keeper problem. Borrower-attested health goes on the roadmap.

**Regulator viewing key on every position.** Cheap to implement, changes how the whole design reads to a compliance-first audience. Privacy that preserves the compliance guarantee rather than routing around it.

---

## 10. UI pages

### Public
| Page | Route | Contents |
|---|---|---|
| Landing | `/` | One-line thesis, live coverage status across all tracked assets |
| Asset detail | `/asset/[id]` | Coverage badge, supply vs proven reserves, proof history, freshness countdown, custodian count (not identities) |
| Proof explorer | `/proofs` | Every submitted proof round, verification status, challenge state |

### Issuer
| Page | Route | Contents |
|---|---|---|
| Custodian management | `/issuer/custodians` | Register / revoke signing keys, current root |
| Mint | `/issuer/mint` | Mint form that visibly blocks when coverage is stale or failed |
| Proof schedule | `/issuer/schedule` | Cadence config, last round, operator agreement status |

### Borrower
| Page | Route | Contents |
|---|---|---|
| Deposit | `/borrow/deposit` | Select asset, deposit, note secret saved client-side with explicit backup warning |
| My positions | `/borrow/positions` | Local-only decrypted view of notes and loans |
| Borrow | `/borrow/new` | Amount, term, live LTV, coverage gate, client-side proof generation with progress state |
| Repay | `/borrow/repay` | Outstanding debt, maturity countdown, repay action |

### Lender
| Page | Route | Contents |
|---|---|---|
| Supply | `/lend` | Deposit stablecoins, APY, utilisation |
| Pool health | `/lend/health` | Total debt, total collateral, coverage status per collateral type, maturity ladder |

### Operator
| Page | Route | Contents |
|---|---|---|
| Agent dashboard | `/operator` | Stake, submitted rounds, agreement rate, slashing events |

Proof generation in the browser takes real seconds. Design the waiting state deliberately — it is the most-seen screen in the whole app.

---

## 11. Build order

Strictly sequential. Each step is demonstrable on its own.

**1. Contracts with mocked reserves.** `CustodianRegistry`, a verifier stub, `ReserveRegistry`, `AssayCompliance`. Prove that mint reverts when coverage is stale. *If this does not work, nothing else matters.*

**2. Coverage circuit, no signatures.** Just `sum(quantity) >= tokenSupply`. Get the full pipeline green end to end — witness, proof, on-chain verify — before adding any complexity.

**3. Add EdDSA verification and Merkle membership** to the coverage circuit. Replace the verifier stub with the real generated one.

**4. Ingestion agent, single operator.** Custodian signer CLI, document extraction, coordinator, prover submission.

**5. `ShieldedVault` + note tree + deposit.** No borrowing yet. Verify commitments and nullifiers work.

**6. `borrow_eligibility` circuit + borrow flow.** Eligibility claims stubbed against a mock trusted issuer.

**7. `LendingPool`** and the coverage-driven LTV curve.

**8. UI.** Public pages first, then borrower, then the rest.

**9. Multi-operator agreement + staking + `ChallengeManager`.**

**Cut line: steps 9 and parts of 8.** If time compresses, ship 1–7 with a thin UI. Single-operator with a stated roadmap to staking is honest; a broken multi-operator system is not.

---

## 12. Demo script

Use silver. It is concrete, it is already live on HashKey, and the audience understands ounces.

1. Show a healthy asset. Coverage proven, fresh, minting works.
2. Deposit collateral, borrow stablecoins. Show the block explorer: the position is invisible, only pool totals moved.
3. Hand the custodian a statement showing less metal than tokens outstanding.
4. Run the round. Coverage fails. Badge flips. **The mint transaction reverts on screen.** New borrows against that asset are blocked.

Thirty seconds, no narration required.

---

## 13. Known limitations

State these before anyone asks.

- **Custodian trust.** A custodian that signs false data yields a valid proof of a lie. We prove consistency, not physical truth.
- **Document extraction.** Ideally custodians sign structured payloads directly and agents disappear. Reality is PDFs and portal exports, so extraction needs redundancy plus stake rather than trust.
- **Trusted setup.** Groth16 requires per-circuit ceremony. Acceptable for a demo; a production deployment needs a real ceremony or a migration to a universal-setup system.
- **Oracle dependency.** Collateral valuation uses a public price oracle with all the usual assumptions.
- **Fixed-term loans only.** No ongoing liquidation in v1, by deliberate design.

---

## 14. Track mapping

**HashKey Chain:** RWA (primary), DeFi, Blockchain Infrastructure. HashKey's own stated goal is unifying AI agent payments, RWA and institutional-grade DeFi — this sits exactly on that line.

**EAG:** Local AI, Private AI & User-Owned Data (primary — selective disclosure and private credentials), Real-World Ethereum Applications, Application Middleware & Open-Source Tooling.

---

## 15. Beyond the hackathon

`ReserveRegistry` is a public good. Any lending market, DEX or wallet on HashKey can read it without permission and without paying us. That composability is the argument for ecosystem funding, and it is the reason this is infrastructure rather than a product.

Immediate roadmap: borrower-attested health proofs enabling ongoing liquidation; custodians signing structured payloads natively; a real trusted setup ceremony; extension of Layer 1 to the tokenized equity and note issuers already live on the chain.