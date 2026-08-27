/**
 * Public presentation metadata for the deployed SILVER-001 mainnet demo.
 *
 * Transactional pages read `ReserveRegistry`, `CustodianRegistry` and
 * `LendingPool` directly. The shapes
 * deliberately mirror the on-chain ones — `Attestation` here carries the same
 * four fields the Solidity struct does, and `coverageStatus` returns the same
 * three states — so replacing this file with real contract reads is a matter
 * of swapping the source, not reworking every component that consumes it.
 *
 * Times are stored as "minutes ago" offsets rather than fixed timestamps so
 * the freshness countdowns stay live for as long as the demo is being shown.
 * Anything rendering these must do so client-side; see `TimeAgo.vue`.
 */

/** Mirrors `ReserveRegistry.coverageStatus()`: 0 ok, 1 stale, 2 failed. */
import { contracts } from '~/utils/contracts'

export type CoverageStatus = 'covered' | 'stale' | 'failed'

export interface Asset {
  id: string
  symbol: string
  name: string
  kind: string
  /** Unit the custodian attests in — ounces, square feet, notional. */
  unit: string
  /** Count only. Custodian identities are never published; that is the point. */
  custodians: number
  /** Tokens outstanding, the circuit's public `tokenSupply`. */
  supply: number
  /** Sum of attested quantities proven in the last round. Private in the witness. */
  reserves: number
  priceUsd: number
  /** Basis points. Reads from `LendingPool.maxLTV()`, which reads the registry. */
  maxLtvBps: number
  /** How long an attestation stays fresh before `isFresh()` goes false. */
  freshnessWindowHours: number
  lastProofMinutesAgo: number
  status: CoverageStatus
  contract: string
  blurb: string
}

export interface ProofRound {
  id: string
  assetId: string
  minutesAgo: number
  status: CoverageStatus | 'challenged'
  /** Attested reserves over supply, in basis points. */
  coverageBps: number
  supplyAtProof: number
  proofHash: string
  /** Operators that agreed within tolerance, out of those that submitted. */
  operatorsAgreed: number
  operatorsTotal: number
  verifyGas: number
  block: number
}

export const assets: Asset[] = [
  {
    id: 'SILVER-001',
    symbol: 'SILVER-001',
    name: 'Verified Silver',
    kind: 'Tokenized silver',
    unit: 'kg',
    custodians: 3,
    supply: 4_000,
    reserves: 4_180,
    priceUsd: 31.42,
    maxLtvBps: 6500,
    freshnessWindowHours: 24,
    lastProofMinutesAgo: 14,
    status: 'covered',
    contract: contracts.rwaToken,
    blurb: 'Private custodian evidence is turned into a public reserve proof. The chain only sees the claim and the proof — not the individual vault accounts or the underlying reserve book.'
  }
]

// Live proof state is read from ReserveRegistry. We intentionally do not ship
// fictional mainnet rounds as a fallback.
export const proofRounds: ProofRound[] = []

/* ------------------------------------------------------------------ derived */

export function getAsset(id: string): Asset | undefined {
  return assets.find(a => a.id === id || a.symbol.toLowerCase() === id.toLowerCase())
}

export function roundsForAsset(id: string): ProofRound[] {
  return proofRounds.filter(r => r.assetId.toLowerCase() === id.toLowerCase())
}

/** Attested reserves over supply. Above 1.0 is the only acceptable value. */
export function coverageRatio(asset: Asset): number {
  return asset.reserves / asset.supply
}

/** Reserves in excess of supply — the buffer, in the asset's own unit. */
export function surplus(asset: Asset): number {
  return asset.reserves - asset.supply
}

export function assetValueUsd(asset: Asset): number {
  return asset.reserves * asset.priceUsd
}

export const totalValueSecured = assets.reduce((sum, a) => sum + assetValueUsd(a), 0)

export const coveredCount = assets.filter(a => a.status === 'covered').length

/** Minutes remaining before the current attestation goes stale. Negative once it has. */
export function freshnessRemainingMinutes(asset: Asset): number {
  return asset.freshnessWindowHours * 60 - asset.lastProofMinutesAgo
}

/* -------------------------------------------------------------- presentation */

export const statusMeta: Record<CoverageStatus | 'challenged', {
  label: string
  color: 'success' | 'warning' | 'error' | 'neutral'
  dot: string
  text: string
  tint: string
  description: string
}> = {
  covered: {
    label: 'Covered',
    color: 'success',
    dot: 'bg-covered-500',
    text: 'text-covered-700',
    tint: 'bg-covered-50 ring-covered-200',
    description: 'Reserves proven at or above supply, within the freshness window.'
  },
  stale: {
    label: 'Stale',
    color: 'warning',
    dot: 'bg-stale-500',
    text: 'text-stale-700',
    tint: 'bg-stale-50 ring-stale-200',
    description: 'Last proof is outside the freshness window. Minting is blocked until a new round lands.'
  },
  failed: {
    label: 'Failed',
    color: 'error',
    dot: 'bg-failed-500',
    text: 'text-failed-700',
    tint: 'bg-failed-50 ring-failed-200',
    description: 'The round verified but coverage did not hold. Minting and new borrows are blocked.'
  },
  challenged: {
    label: 'Challenged',
    color: 'warning',
    dot: 'bg-stale-500',
    text: 'text-stale-700',
    tint: 'bg-stale-50 ring-stale-200',
    description: 'A bonded dispute is open against this round pending resolution.'
  }
}

const compactUsd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  notation: 'compact',
  maximumFractionDigits: 1
})

export function formatUsd(value: number): string {
  return compactUsd.format(value)
}

export function formatQty(value: number): string {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value)
}

export function formatBps(bps: number): string {
  return `${(bps / 100).toFixed(2)}%`
}

export function formatRatio(ratio: number): string {
  return `${(ratio * 100).toFixed(2)}%`
}

/** First and last six characters. Long enough to compare, short enough to sit in a row. */
export function truncateHash(hash: string): string {
  return `${hash.slice(0, 8)}…${hash.slice(-6)}`
}

/**
 * Human-readable elapsed time. Called only from the client — see the note at
 * the top of this file about why offsets are stored rather than timestamps.
 */
export function formatElapsed(minutes: number): string {
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${Math.floor(minutes)} min ago`

  const hours = minutes / 60
  if (hours < 24) return `${Math.floor(hours)} hr ago`

  const days = hours / 24
  if (days < 30) return `${Math.floor(days)} ${Math.floor(days) === 1 ? 'day' : 'days'} ago`

  return `${Math.floor(days / 30)} mo ago`
}

/** Countdown to staleness, or how long it has been stale. */
export function formatCountdown(minutes: number): string {
  const abs = Math.abs(minutes)
  const hours = Math.floor(abs / 60)
  const mins = Math.floor(abs % 60)
  const body = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`

  return minutes >= 0 ? `${body} until stale` : `stale for ${body}`
}
