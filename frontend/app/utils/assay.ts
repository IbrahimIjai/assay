/**
 * Demo data for the Assay Protocol frontend.
 *
 * Contracts are still under development, so this module stands in for reads
 * against `ReserveRegistry`, `CustodianRegistry` and `LendingPool`. The shapes
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
    id: 'xagh',
    symbol: 'XAGH',
    name: 'Assay Silver',
    kind: 'Precious metal',
    unit: 'oz',
    custodians: 3,
    supply: 4_812_500,
    reserves: 4_861_200,
    priceUsd: 31.42,
    maxLtvBps: 6500,
    freshnessWindowHours: 24,
    lastProofMinutesAgo: 14,
    status: 'covered',
    contract: '0x7a41c2De9F0b8E5417cC3A9d6b21fE84c05B7d33',
    blurb: 'Allocated silver held across three vault operators. Attestations are signed per account and proven in aggregate, so the split between vaults never leaves the witness.'
  },
  {
    id: 'xauh',
    symbol: 'XAUH',
    name: 'Assay Gold',
    kind: 'Precious metal',
    unit: 'oz',
    custodians: 2,
    supply: 61_400,
    reserves: 62_050,
    priceUsd: 2_411.80,
    maxLtvBps: 7000,
    freshnessWindowHours: 24,
    lastProofMinutesAgo: 8,
    status: 'covered',
    contract: '0x3Fb9E7a1C48d05266bB1cE4f79A0d3821eC94b17',
    blurb: 'Two custodians, both signing structured payloads natively. The reference case for what Layer 1 looks like once document extraction is out of the loop entirely.'
  },
  {
    id: 'hkre1',
    symbol: 'HKRE1',
    name: 'Kowloon Commercial Portfolio',
    kind: 'Real estate',
    unit: 'units',
    custodians: 4,
    supply: 2_400_000,
    reserves: 2_428_000,
    priceUsd: 1.04,
    maxLtvBps: 4500,
    freshnessWindowHours: 24,
    lastProofMinutesAgo: 1_874,
    status: 'stale',
    contract: '0xB2c740Ee81aF3d9925cC0b6183eA71fD4482a0c9',
    blurb: 'Rent rolls arrive as portal exports on a weekly cadence, which makes this the asset most exposed to extraction risk. The last round is outside its freshness window.'
  },
  {
    id: 'pcna',
    symbol: 'PCN-A',
    name: 'Private Credit Note, Series A',
    kind: 'Private credit',
    unit: 'notional',
    custodians: 2,
    supply: 18_500_000,
    reserves: 17_940_000,
    priceUsd: 1.00,
    maxLtvBps: 0,
    freshnessWindowHours: 24,
    lastProofMinutesAgo: 126,
    status: 'failed',
    contract: '0x9E0aB4172c53Df8106bb4E9a2705Cc3F81D6e254',
    blurb: 'The bank confirmation for the last round attested less notional than tokens outstanding. The proof verified; coverage did not hold. Minting is blocked at the compliance module.'
  }
]

export const proofRounds: ProofRound[] = [
  { id: 'r-4821', assetId: 'xauh', minutesAgo: 8, status: 'covered', coverageBps: 10106, supplyAtProof: 61_400, proofHash: '0x8c41f0a95d2b7e63c04af1928be5730d6ca8412f9e07b3d5182ac6490fe3b7d1', operatorsAgreed: 3, operatorsTotal: 3, verifyGas: 248_912, block: 14_902_338 },
  { id: 'r-4820', assetId: 'xagh', minutesAgo: 14, status: 'covered', coverageBps: 10101, supplyAtProof: 4_812_500, proofHash: '0x2fa7c31d84e05b96027cf4a1382de6740b9c15a8f3027ed4619b8c05a7f2d3e8', operatorsAgreed: 3, operatorsTotal: 3, verifyGas: 251_044, block: 14_902_301 },
  { id: 'r-4819', assetId: 'pcna', minutesAgo: 126, status: 'failed', coverageBps: 9697, supplyAtProof: 18_500_000, proofHash: '0xd51b902ac7e4f6380192bc45de7a0c8341f96e2b70d5a8c194e073fb62ad5c07', operatorsAgreed: 2, operatorsTotal: 2, verifyGas: 249_530, block: 14_899_774 },
  { id: 'r-4818', assetId: 'xagh', minutesAgo: 194, status: 'covered', coverageBps: 10098, supplyAtProof: 4_812_500, proofHash: '0x7e39041ca8b2df65017a3e92c4bd8016f5a27db390ce641852af07b9d3e2c164', operatorsAgreed: 3, operatorsTotal: 3, verifyGas: 250_887, block: 14_898_112 },
  { id: 'r-4817', assetId: 'xauh', minutesAgo: 248, status: 'covered', coverageBps: 10112, supplyAtProof: 61_400, proofHash: '0x1b6ce8305f9a274d0e83b1c26fa47509d8e3021b7ca5946f30d18e7a25c4b093', operatorsAgreed: 3, operatorsTotal: 3, verifyGas: 248_701, block: 14_896_940 },
  { id: 'r-4816', assetId: 'pcna', minutesAgo: 366, status: 'challenged', coverageBps: 10004, supplyAtProof: 18_500_000, proofHash: '0xa0f7523be91c4d86027e5fa31c9b04d7826ef5910ac37d2b6408f19e5da72c3b', operatorsAgreed: 1, operatorsTotal: 2, verifyGas: 249_118, block: 14_894_507 },
  { id: 'r-4815', assetId: 'xagh', minutesAgo: 434, status: 'covered', coverageBps: 10094, supplyAtProof: 4_780_000, proofHash: '0x64d1a07f3e5928bc016d4a83f0e27519cb8305de74a1962f08b3ec5107d94a2f', operatorsAgreed: 3, operatorsTotal: 3, verifyGas: 251_320, block: 14_892_880 },
  { id: 'r-4814', assetId: 'hkre1', minutesAgo: 1_874, status: 'covered', coverageBps: 10117, supplyAtProof: 2_400_000, proofHash: '0xf30b846ac25917de0483b1e69c07a2d5138fe940b7c25a0e6941d38b07ac52e1', operatorsAgreed: 4, operatorsTotal: 4, verifyGas: 250_216, block: 14_871_045 },
  { id: 'r-4813', assetId: 'xauh', minutesAgo: 2_102, status: 'covered', coverageBps: 10098, supplyAtProof: 60_950, proofHash: '0x5c92e10bd4a7f38602e15c9a7b04df3186ea720c95d3f1b807a4e26c9d15b3fa', operatorsAgreed: 3, operatorsTotal: 3, verifyGas: 248_455, block: 14_866_312 },
  { id: 'r-4812', assetId: 'xagh', minutesAgo: 2_310, status: 'covered', coverageBps: 10089, supplyAtProof: 4_780_000, proofHash: '0x0e47b13fa6c2905d81e0374bc95a2fd6018c73e5a940b2168df05c39e7a4b16d', operatorsAgreed: 3, operatorsTotal: 3, verifyGas: 250_993, block: 14_862_180 },
  { id: 'r-4811', assetId: 'hkre1', minutesAgo: 11_954, status: 'covered', coverageBps: 10105, supplyAtProof: 2_400_000, proofHash: '0xb8250fa71c9d3e460187ac52d0b39f7e14620ca8935df70b41e2a86c5017d9b3', operatorsAgreed: 4, operatorsTotal: 4, verifyGas: 250_402, block: 14_781_663 },
  { id: 'r-4810', assetId: 'pcna', minutesAgo: 12_218, status: 'covered', coverageBps: 10021, supplyAtProof: 18_500_000, proofHash: '0x36ea917c05b2d84f0163ba7e29d05c418f7302ba6d915e0c74a3b28f01ce4d67', operatorsAgreed: 2, operatorsTotal: 2, verifyGas: 249_874, block: 14_776_209 }
]

/* ------------------------------------------------------------------ derived */

export function getAsset(id: string): Asset | undefined {
  return assets.find(a => a.id === id || a.symbol.toLowerCase() === id.toLowerCase())
}

export function roundsForAsset(id: string): ProofRound[] {
  return proofRounds.filter(r => r.assetId === id)
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
