import {
  createPublicClient,
  defineChain,
  http,
  parseAbi
} from 'viem'
import { hskMainnet } from '~/utils/contracts'

export const hashKeyChain = defineChain({
  id: hskMainnet.chainId,
  name: hskMainnet.name,
  nativeCurrency: hskMainnet.nativeCurrency,
  rpcUrls: { default: { http: [hskMainnet.rpcUrl] } },
  blockExplorers: { default: { name: 'Blockscout', url: hskMainnet.explorerUrl } }
})

export const publicClient = createPublicClient({ chain: hashKeyChain, transport: http() })

export const reserveRegistryAbi = parseAbi([
  'function getLatest(bytes32 asset) view returns ((bool covered,uint64 asOf,uint256 supplyAtProof,bytes32 proofHash))',
  'function isFresh(bytes32 asset) view returns (bool)',
  'function coverageStatus(bytes32 asset) view returns (uint8)',
  'function proofCount(bytes32 asset) view returns (uint256)'
])

export const tokenAbi = parseAbi([
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address account) view returns (uint256)',
  'function allowance(address owner,address spender) view returns (uint256)',
  'function approve(address spender,uint256 amount) returns (bool)',
  'function mint(address to,uint256 amount)',
  'function decimals() view returns (uint8)'
])

export const poolAbi = parseAbi([
  'function totalLiquidity() view returns (uint256)',
  'function totalDebt() view returns (uint256)',
  'function totalShares() view returns (uint256)',
  'function sharesOf(address account) view returns (uint256)',
  'function utilisation() view returns (uint256)',
  'function supply(uint256 amount) returns (uint256)',
  'function withdraw(uint256 shares) returns (uint256)'
])

export const vaultAbi = parseAbi([
  'function deposit(bytes32 asset,uint256 amount,bytes32 noteCommitment)',
  'function borrow(bytes32 asset,uint256[2] a,uint256[2][2] b,uint256[2] c,uint256[7] publicInputs,address stealthPayout,uint64 maturity) returns (bytes32)',
  'function repay(bytes32 loanId,uint256 amount)'
])
