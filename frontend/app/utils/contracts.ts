export const hskMainnet = {
  chainId: 177,
  chainIdHex: '0xb1',
  name: 'HashKey Chain',
  nativeCurrency: { name: 'HSK', symbol: 'HSK', decimals: 18 },
  rpcUrl: 'https://mainnet.hsk.xyz',
  explorerUrl: 'https://hashkey.blockscout.com'
} as const

const zeroAddress = '0x0000000000000000000000000000000000000000'

/** Mainnet addresses are injected after deployment and never fall back to testnet. */
export const contracts = {
  reserveVerifier: import.meta.env.VITE_RESERVE_VERIFIER || '0x7D4adbab9A78a0b278DCc9B16d3643a2F8327c93',
  custodianRegistry: import.meta.env.VITE_CUSTODIAN_REGISTRY || '0x3BaF50F4152Bb2C3F0E27693600c6C6c56D9D0E7',
  reserveRegistry: import.meta.env.VITE_RESERVE_REGISTRY || '0xBe9ec79854e459F38E0B868A0c3429AAbf6784b2',
  compliance: import.meta.env.VITE_ASSAY_COMPLIANCE || '0xfA845604F52843a7b5cfA4030120c6238741F420',
  rwaToken: import.meta.env.VITE_RWA_TOKEN || '0xed11D4afd9A7a4fe0bbBAC34315B6B438FF1bc78',
  stablecoin: import.meta.env.VITE_STABLECOIN || '0x337361Dd8D8Ee27Ab5EfFec69412AC8B080d704a',
  borrowVerifier: import.meta.env.VITE_BORROW_VERIFIER || '0xC6f99ef3133C628B265551Eb677a2Be8cF411e0d',
  shieldedVault: import.meta.env.VITE_SHIELDED_VAULT || '0xBB4e1DC17e8B233B9233aAD487D44e420490058B',
  lendingPool: import.meta.env.VITE_LENDING_POOL || '0xe0Afb36ca378CdF034c2BdC5Ee3Ac90f726a20c5',
  challengeManager: import.meta.env.VITE_CHALLENGE_MANAGER || '0x6BfD1C86a78822243F20461F96EB013566412580'
} as const

export const silverAssetId = '0x1e2beb6209b621770c89114d80ffa4af61136b35c73124168277baf83e2fa5d3'
export const reserveRegistryDeploymentBlock = 26746510n
export const agentApiUrl = import.meta.env.VITE_AGENT_API_URL || 'http://localhost:3001'
export const deploymentReady = Object.values(contracts).every(address => address !== zeroAddress)

export function explorerAddress(address: string): string {
  return `${hskMainnet.explorerUrl}/address/${address}`
}

export function explorerTx(hash: string): string {
  return `${hskMainnet.explorerUrl}/tx/${hash}`
}
