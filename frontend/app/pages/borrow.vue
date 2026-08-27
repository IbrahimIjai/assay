<template>
  <div>
    <section class="relative overflow-hidden border-b border-default">
      <div class="grid-bg pointer-events-none absolute inset-0" />
      <UContainer class="relative py-14 lg:py-20">
        <SectionLabel>Private borrowing</SectionLabel>
        <h1 class="mt-4 max-w-[760px] font-display text-[40px] leading-[1.02] text-highlighted sm:text-[56px]">
          Prove eligibility without revealing the position
        </h1>
        <p class="mt-5 max-w-[680px] text-[16px] leading-[1.65] text-toned">
          The vault consumes a commitment and a zero-knowledge proof. Lenders see the
          debt and coverage constraints—not the borrower's identity or note secret.
        </p>
      </UContainer>
    </section>

    <UContainer class="py-12 lg:py-16">
      <div class="mb-6 flex items-center gap-2 rounded-panel bg-stale-50 p-4 text-[13px] text-stale-800 ring-1 ring-stale-200">
        <UIcon
          name="i-lucide-info"
          class="size-4 shrink-0"
        />
        Mainnet demo — collateral ownership and 60% LTV are enforced on-chain; the borrowing verifier remains a clearly labelled demo verifier.
      </div>

      <WalletBalances
        class="mb-6"
        :refresh-key="transactionHash"
      />

      <div class="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section class="rounded-panel bg-card p-6 ring-1 ring-default lg:p-7">
          <div class="flex items-center justify-between gap-4">
            <div>
              <div class="text-[12px] uppercase tracking-[0.08em] text-muted">
                Borrow position
              </div>
              <h2 class="mt-2 font-display text-[32px] text-highlighted">
                {{ positionTitle }}
              </h2>
            </div>
            <div class="flex flex-wrap items-center justify-end gap-2">
              <CoverageBadge
                :status="reserveStatus"
                size="sm"
              />
              <span class="rounded-full bg-muted px-3 py-1.5 font-data text-[11px] text-toned ring-1 ring-default">
                STEP {{ currentStep }} / 3
              </span>
            </div>
          </div>

          <div class="mt-6 grid grid-cols-3 gap-2">
            <div
              v-for="step in steps"
              :key="step.number"
              class="rounded-[10px] p-3 ring-1 transition-colors"
              :class="step.number < currentStep
                ? 'bg-covered-50 text-covered-700 ring-covered-200'
                : step.number === currentStep
                  ? 'bg-primary text-white ring-primary'
                  : 'bg-muted text-muted ring-default'"
            >
              <div class="font-data text-[11px]">
                0{{ step.number }}
              </div>
              <div class="mt-1 text-[12px] font-medium">
                {{ step.label }}
              </div>
            </div>
          </div>

          <div
            v-if="!commitment"
            class="mt-7"
          >
            <div class="flex items-end justify-between gap-4">
              <div>
                <div class="text-[12px] uppercase tracking-[0.08em] text-muted">
                  Collateral to deposit
                </div>
                <p class="mt-2 text-[13px] text-toned">
                  Choose any amount up to your available vSILVER balance.
                </p>
              </div>
              <button
                type="button"
                class="text-[12px] font-medium text-primary hover:underline"
                :disabled="!silverBalance"
                @click="setMaxDeposit"
              >
                Use max
              </button>
            </div>

            <div class="mt-4 flex items-center gap-3 rounded-panel border border-default bg-muted px-4 py-3 focus-within:border-primary">
              <input
                v-model.number="depositAmount"
                type="number"
                min="0"
                step="0.0001"
                :max="formatToken(silverBalance, 18)"
                class="min-w-0 flex-1 bg-transparent font-data text-[20px] text-highlighted outline-none"
                aria-label="vSILVER collateral amount"
              >
              <span class="font-data text-[13px] text-toned">vSILVER</span>
            </div>

            <p
              v-if="depositError"
              class="mt-2 text-[12px] text-failed-700"
            >
              {{ depositError }}
            </p>

            <div class="mt-5 grid gap-px overflow-hidden rounded-panel bg-default ring-1 ring-default sm:grid-cols-3">
              <div class="bg-muted p-4">
                <div class="text-[11px] uppercase tracking-[0.07em] text-muted">
                  Wallet balance
                </div>
                <div class="mt-2 font-data text-[15px] text-highlighted">
                  {{ formatToken(silverBalance, 18) }} vSILVER
                </div>
              </div>
              <div class="bg-muted p-4">
                <div class="text-[11px] uppercase tracking-[0.07em] text-muted">
                  Collateral value
                </div>
                <div class="mt-2 font-data text-[15px] text-highlighted">
                  {{ formatToken(collateralValue, 6) }} mUSDC
                </div>
              </div>
              <div class="bg-muted p-4">
                <div class="text-[11px] uppercase tracking-[0.07em] text-muted">
                  Max debt · 60%
                </div>
                <div class="mt-2 font-data text-[15px] text-covered-700">
                  {{ formatToken(previewMaxDebt, 6) }} mUSDC
                </div>
              </div>
            </div>

            <div class="mt-5 rounded-panel bg-stale-50 p-4 text-[12px] leading-[1.6] text-stale-800 ring-1 ring-stale-200">
              Deposited collateral remains in the vault until its loan is fully repaid. The deployed contract has no standalone collateral-withdraw function.
            </div>

            <UButton
              class="mt-5 w-full justify-center"
              size="lg"
              :label="pending ? pendingLabel : depositButtonLabel"
              :loading="pending"
              :disabled="!canDeposit"
              @click="depositCollateral"
            />
          </div>

          <div
            v-else-if="!loanId"
            class="mt-7"
          >
            <div class="rounded-panel bg-covered-50 p-4 ring-1 ring-covered-200">
              <div class="flex items-center justify-between gap-4">
                <span class="text-[12px] font-medium text-covered-700">Collateral deposited</span>
                <span class="font-data text-[13px] text-covered-700">{{ formatToken(depositedAmount, 18) }} vSILVER</span>
              </div>
            </div>

            <div class="mt-6 flex items-end justify-between gap-4">
              <div>
                <div class="text-[12px] uppercase tracking-[0.08em] text-muted">
                  Amount to borrow
                </div>
                <p class="mt-2 text-[13px] text-toned">
                  Limited by the vault LTV and available pool liquidity.
                </p>
              </div>
              <button
                type="button"
                class="text-[12px] font-medium text-primary hover:underline"
                @click="setMaxBorrow"
              >
                Use max
              </button>
            </div>

            <div class="mt-4 flex items-center gap-3 rounded-panel border border-default bg-muted px-4 py-3 focus-within:border-primary">
              <input
                v-model.number="borrowAmount"
                type="number"
                min="0"
                step="0.01"
                :max="formatToken(borrowCapacity, 6)"
                class="min-w-0 flex-1 bg-transparent font-data text-[20px] text-highlighted outline-none"
                aria-label="mUSDC borrow amount"
              >
              <span class="font-data text-[13px] text-toned">mUSDC</span>
            </div>

            <p
              v-if="borrowError"
              class="mt-2 text-[12px] text-failed-700"
            >
              {{ borrowError }}
            </p>

            <div class="mt-4">
              <div class="flex items-center justify-between text-[12px] text-toned">
                <span>Selected LTV</span>
                <span
                  class="font-data"
                  :class="selectedLtv > 60 ? 'text-failed-700' : 'text-highlighted'"
                >
                  {{ selectedLtv.toFixed(2) }}% / 60.00%
                </span>
              </div>
              <div class="mt-2 h-2 overflow-hidden rounded-full bg-ink-100">
                <div
                  class="h-full rounded-full transition-all"
                  :class="selectedLtv > 60 ? 'bg-failed-500' : 'bg-primary'"
                  :style="{ width: `${selectedLtvBar}%` }"
                />
              </div>
            </div>

            <div class="mt-5 grid gap-3 sm:grid-cols-2">
              <div class="rounded-panel bg-muted p-4 ring-1 ring-default">
                <div class="text-[11px] uppercase tracking-[0.07em] text-muted">
                  Borrow capacity
                </div>
                <div class="mt-2 font-data text-[16px] text-highlighted">
                  {{ formatToken(borrowCapacity, 6) }} mUSDC
                </div>
              </div>
              <label class="rounded-panel bg-muted p-4 ring-1 ring-default">
                <span class="text-[11px] uppercase tracking-[0.07em] text-muted">Loan term</span>
                <select
                  v-model.number="maturityDays"
                  class="mt-2 w-full bg-transparent font-data text-[15px] text-highlighted outline-none"
                >
                  <option :value="7">7 days</option>
                  <option :value="30">30 days</option>
                  <option :value="90">90 days</option>
                </select>
              </label>
            </div>

            <UButton
              class="mt-5 w-full justify-center"
              size="lg"
              :label="pending ? pendingLabel : `Borrow ${formatToken(borrowUnits, 6)} mUSDC`"
              :loading="pending"
              :disabled="!canBorrow"
              @click="borrow"
            />
          </div>

          <div
            v-else
            class="mt-7"
          >
            <div class="grid gap-px overflow-hidden rounded-panel bg-default ring-1 ring-default sm:grid-cols-3">
              <div class="bg-muted p-4">
                <div class="text-[11px] uppercase tracking-[0.07em] text-muted">
                  Collateral locked
                </div>
                <div class="mt-2 font-data text-[15px] text-highlighted">
                  {{ formatToken(depositedAmount, 18) }} vSILVER
                </div>
              </div>
              <div class="bg-muted p-4">
                <div class="text-[11px] uppercase tracking-[0.07em] text-muted">
                  Debt remaining
                </div>
                <div class="mt-2 font-data text-[15px] text-highlighted">
                  {{ formatToken(outstandingDebt, 6) }} mUSDC
                </div>
              </div>
              <div class="bg-muted p-4">
                <div class="text-[11px] uppercase tracking-[0.07em] text-muted">
                  Matures
                </div>
                <div class="mt-2 font-data text-[13px] text-highlighted">
                  {{ maturityLabel }}
                </div>
              </div>
            </div>

            <div class="mt-6 flex items-end justify-between gap-4">
              <div>
                <div class="text-[12px] uppercase tracking-[0.08em] text-muted">
                  Repayment amount
                </div>
                <p class="mt-2 text-[13px] text-toned">
                  Partial repayments reduce debt; full repayment unlocks the collateral.
                </p>
              </div>
              <button
                type="button"
                class="text-[12px] font-medium text-primary hover:underline"
                @click="setMaxRepay"
              >
                Pay max
              </button>
            </div>

            <div class="mt-4 flex items-center gap-3 rounded-panel border border-default bg-muted px-4 py-3 focus-within:border-primary">
              <input
                v-model.number="repayAmount"
                type="number"
                min="0"
                step="0.01"
                :max="formatToken(outstandingDebt, 6)"
                class="min-w-0 flex-1 bg-transparent font-data text-[20px] text-highlighted outline-none"
                aria-label="mUSDC repayment amount"
              >
              <span class="font-data text-[13px] text-toned">mUSDC</span>
            </div>

            <p
              v-if="repayError"
              class="mt-2 text-[12px] text-failed-700"
            >
              {{ repayError }}
            </p>

            <UButton
              class="mt-5 w-full justify-center"
              size="lg"
              :label="pending ? pendingLabel : `Repay ${formatToken(repayUnits, 6)} mUSDC`"
              :loading="pending"
              :disabled="!canRepay"
              @click="repay"
            />
          </div>

          <div
            v-if="message"
            class="mt-5 rounded-panel p-4 text-[13px] leading-[1.6] ring-1"
            :class="messageTone === 'error' ? 'bg-failed-50 text-failed-700 ring-failed-200' : 'bg-covered-50 text-covered-700 ring-covered-200'"
          >
            {{ message }}
          </div>
          <TransactionHashLink
            v-if="transactionHash"
            :hash="transactionHash"
          />
        </section>

        <aside class="rounded-panel bg-band p-6 text-white lg:p-7">
          <div class="text-[12px] uppercase tracking-[0.08em] text-white/40">
            Privacy boundary
          </div>
          <h2 class="mt-3 font-display text-[30px]">
            What leaves the wallet
          </h2>
          <div class="mt-6 space-y-4">
            <div
              v-for="item in disclosures"
              :key="item.label"
              class="flex items-start justify-between gap-5 border-b border-white/10 pb-4 last:border-0"
            >
              <span class="text-[14px] text-white/55">{{ item.label }}</span>
              <span
                class="text-right font-data text-[13px]"
                :class="item.private ? 'text-stale-300' : 'text-covered-300'"
              >
                {{ item.value }}
              </span>
            </div>
          </div>
          <p class="mt-6 text-[13px] leading-[1.65] text-white/50">
            The note secret never leaves this page. Only public commitment metadata is retained locally so an unfinished position can be restored after a refresh. This demo deposit still exposes the sender and amount; hiding them requires the production borrowing circuit.
          </p>

          <div class="mt-7 border-t border-white/10 pt-6">
            <div class="text-[12px] uppercase tracking-[0.08em] text-white/40">
              Enforced by the vault
            </div>
            <div class="mt-4 space-y-3">
              <div
                v-for="rule in contractRules"
                :key="rule.label"
                class="flex items-center justify-between gap-4 text-[13px]"
              >
                <span class="text-white/50">{{ rule.label }}</span>
                <span class="font-data text-white">{{ rule.value }}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </UContainer>
  </div>
</template>

<script setup lang="ts">
import { encodeAbiParameters, formatUnits, keccak256, parseUnits, toBytes, type Address } from 'viem'
import { contracts, deploymentReady, silverAssetId } from '~/utils/contracts'
import { poolAbi, publicClient, reserveRegistryAbi, tokenAbi, vaultAbi } from '~/utils/web3'

useSeoMeta({ title: 'Private borrowing — Assay Protocol' })

type StoredBorrowSession = {
  commitment: `0x${string}`
  nullifier: `0x${string}`
  loanId: `0x${string}` | ''
}

const pending = ref(false)
const pendingLabel = ref('')
const message = ref('')
const messageTone = ref<'success' | 'error'>('success')
const transactionHash = ref<`0x${string}` | ''>('')
const commitment = ref<`0x${string}` | ''>('')
const nullifier = ref<`0x${string}` | ''>('')
const loanId = ref<`0x${string}` | ''>('')
const depositAmount = ref(0)
const borrowAmount = ref(0)
const repayAmount = ref(0)
const maturityDays = ref(30)
const maturityTimestamp = ref(0)
const depositedAmount = ref(0n)
const outstandingDebt = ref(0n)
const silverBalance = ref(0n)
const stablecoinBalance = ref(0n)
const poolLiquidity = ref(0n)
const balancesLoaded = ref(false)
const reserveCovered = ref(false)
const reserveFresh = ref(false)
const reserveChecked = ref(false)
const { ensureWallet, waitForReceipt, writeContract } = useAssayWallet()
const { address, isConnected } = useConnection()

const steps = [
  { number: 1, label: 'Deposit' },
  { number: 2, label: 'Borrow' },
  { number: 3, label: 'Repay' }
]

const disclosures = [
  { label: 'Collateral commitment', value: 'PUBLIC', private: false },
  { label: 'Debt amount', value: 'PUBLIC', private: false },
  { label: 'Nullifier', value: 'PUBLIC', private: false },
  { label: 'Position size', value: 'PUBLIC IN DEMO', private: false },
  { label: 'Owner identity', value: 'PUBLIC IN DEMO', private: false },
  { label: 'Note secret', value: 'NEVER SHARED', private: true }
]

const contractRules = computed(() => [
  { label: 'Demo silver price', value: '$40.00' },
  { label: 'Maximum LTV', value: '60.00%' },
  { label: 'Pool liquidity', value: `${formatToken(poolLiquidity.value, 6)} mUSDC` },
  { label: 'Reserve gate', value: reserveStatus.value.toUpperCase() }
])

const reserveStatus = computed<'covered' | 'stale' | 'failed'>(() => {
  if (reserveCovered.value && reserveFresh.value) return 'covered'
  if (reserveCovered.value) return 'stale'
  return 'failed'
})

const currentStep = computed(() => loanId.value ? 3 : commitment.value ? 2 : 1)
const positionTitle = computed(() => {
  if (loanId.value) return 'Manage your loan'
  if (commitment.value) return 'Choose your debt'
  return 'Build your collateral'
})

const depositUnits = computed(() => parseAmount(depositAmount.value, 18))
const borrowUnits = computed(() => parseAmount(borrowAmount.value, 6))
const repayUnits = computed(() => parseAmount(repayAmount.value, 6))
const collateralValue = computed(() => (depositUnits.value * 40_000_000n) / 10n ** 18n)
const previewMaxDebt = computed(() => (collateralValue.value * 6000n) / 10_000n)
const vaultMaxDebt = computed(() => (depositedAmount.value * 40_000_000n * 6000n) / (10n ** 18n * 10_000n))
const borrowCapacity = computed(() => vaultMaxDebt.value < poolLiquidity.value ? vaultMaxDebt.value : poolLiquidity.value)
const depositedValue = computed(() => (depositedAmount.value * 40_000_000n) / 10n ** 18n)
const selectedLtv = computed(() => depositedValue.value
  ? Number((borrowUnits.value * 1_000_000n) / depositedValue.value) / 10_000
  : 0)
const selectedLtvBar = computed(() => Math.min(100, (selectedLtv.value / 60) * 100))

const depositError = computed(() => {
  if (!depositUnits.value) return ''
  if (balancesLoaded.value && depositUnits.value > silverBalance.value) return 'This amount exceeds your available vSILVER balance.'
  return ''
})
const borrowError = computed(() => {
  if (!borrowUnits.value) return ''
  if (reserveChecked.value && reserveStatus.value !== 'covered') return 'Borrowing requires a fresh, covered reserve proof.'
  if (borrowUnits.value > vaultMaxDebt.value) return 'This amount exceeds the vault-enforced 60% LTV limit.'
  if (borrowUnits.value > poolLiquidity.value) return 'The pool does not currently have enough available mUSDC.'
  return ''
})
const repayError = computed(() => {
  if (!repayUnits.value) return ''
  if (repayUnits.value > outstandingDebt.value) return 'The repayment cannot exceed the remaining debt.'
  if (balancesLoaded.value && repayUnits.value > stablecoinBalance.value) return 'This amount exceeds your available mUSDC balance.'
  return ''
})

const canDeposit = computed(() => deploymentReady && !pending.value && depositUnits.value > 0n && !depositError.value)
const canBorrow = computed(() => deploymentReady
  && reserveChecked.value
  && reserveStatus.value === 'covered'
  && !pending.value
  && borrowUnits.value > 0n
  && !borrowError.value)
const canRepay = computed(() => deploymentReady && !pending.value && repayUnits.value > 0n && !repayError.value)
const depositButtonLabel = computed(() => {
  if (!depositUnits.value) return 'Enter collateral amount'
  const prefix = isConnected.value ? 'Approve & deposit' : 'Connect, approve & deposit'
  return `${prefix} ${formatToken(depositUnits.value, 18)} vSILVER`
})
const maturityLabel = computed(() => maturityTimestamp.value
  ? new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(maturityTimestamp.value * 1000))
  : '—')

function parseAmount(value: number, decimals: number): bigint {
  if (!Number.isFinite(value) || value <= 0) return 0n
  try {
    return parseUnits(String(value), decimals)
  } catch {
    return 0n
  }
}

function formatToken(value: bigint, decimals: number): string {
  const numeric = Number(formatUnits(value, decimals))
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 4 }).format(numeric)
}

function setMaxDeposit() {
  depositAmount.value = Number(formatUnits(silverBalance.value, 18))
}

function setMaxBorrow() {
  borrowAmount.value = Number(formatUnits(borrowCapacity.value, 6))
}

function setMaxRepay() {
  const maximum = stablecoinBalance.value < outstandingDebt.value ? stablecoinBalance.value : outstandingDebt.value
  repayAmount.value = Number(formatUnits(maximum, 6))
}

async function refreshBorrowContext(account: Address | undefined = address.value) {
  const [liquidity, latest, fresh] = await Promise.all([
    publicClient.readContract({ address: contracts.lendingPool, abi: poolAbi, functionName: 'totalLiquidity' }),
    publicClient.readContract({ address: contracts.reserveRegistry, abi: reserveRegistryAbi, functionName: 'getLatest', args: [silverAssetId] }),
    publicClient.readContract({ address: contracts.reserveRegistry, abi: reserveRegistryAbi, functionName: 'isFresh', args: [silverAssetId] })
  ])
  poolLiquidity.value = liquidity
  reserveCovered.value = latest.covered
  reserveFresh.value = fresh
  reserveChecked.value = true

  if (account) {
    const [silver, stablecoin] = await Promise.all([
      publicClient.readContract({ address: contracts.rwaToken, abi: tokenAbi, functionName: 'balanceOf', args: [account] }),
      publicClient.readContract({ address: contracts.stablecoin, abi: tokenAbi, functionName: 'balanceOf', args: [account] })
    ])
    silverBalance.value = silver
    stablecoinBalance.value = stablecoin
    balancesLoaded.value = true
  } else {
    silverBalance.value = 0n
    stablecoinBalance.value = 0n
    balancesLoaded.value = false
  }
}

async function ensureAllowance(token: Address, owner: Address, amount: bigint, label: string) {
  const allowance = await publicClient.readContract({
    address: token,
    abi: tokenAbi,
    functionName: 'allowance',
    args: [owner, contracts.shieldedVault]
  })
  if (allowance >= amount) return
  pendingLabel.value = `Approve ${label}`
  const approval = await writeContract({
    address: token,
    abi: tokenAbi,
    functionName: 'approve',
    args: [contracts.shieldedVault, amount]
  })
  await waitForReceipt(approval)
}

function beginTransaction(label: string) {
  pending.value = true
  pendingLabel.value = label
  transactionHash.value = ''
  message.value = ''
}

function failTransaction(error: unknown, fallback: string) {
  messageTone.value = 'error'
  message.value = friendlyError(error, fallback)
}

function friendlyError(error: unknown, fallback: string): string {
  const candidate = error as { shortMessage?: string, message?: string }
  const detail = candidate?.shortMessage || candidate?.message || fallback
  if (/user rejected|user denied|rejected the request/i.test(detail)) return 'The wallet request was cancelled.'
  if (/DebtAboveLtv/i.test(detail)) return 'The requested debt exceeds the vault-enforced 60% LTV limit.'
  if (/InsufficientLiquidity/i.test(detail)) return 'The lending pool does not have enough available mUSDC.'
  if (/InvalidProof|ReserveNotCovered/i.test(detail)) return 'Borrowing is paused until a fresh, covered reserve proof is available.'
  if (/insufficient funds/i.test(detail)) return 'The wallet does not have enough HSK to pay transaction gas.'
  return detail.split('\n')[0] || fallback
}

function sessionKey(account: Address): string {
  return `assay:borrow:${contracts.shieldedVault}:${account.toLowerCase()}`
}

function persistSession(account: Address = address.value as Address) {
  if (!import.meta.client || !account || !commitment.value || !nullifier.value) return
  const session: StoredBorrowSession = {
    commitment: commitment.value,
    nullifier: nullifier.value,
    loanId: loanId.value
  }
  localStorage.setItem(sessionKey(account), JSON.stringify(session))
}

function removeSession(account: Address = address.value as Address) {
  if (!import.meta.client || !account) return
  localStorage.removeItem(sessionKey(account))
}

function resetPositionState() {
  commitment.value = ''
  nullifier.value = ''
  loanId.value = ''
  depositedAmount.value = 0n
  outstandingDebt.value = 0n
  maturityTimestamp.value = 0
  depositAmount.value = 0
  borrowAmount.value = 0
  repayAmount.value = 0
  transactionHash.value = ''
  message.value = ''
}

async function restoreSession(account: Address) {
  if (!import.meta.client) return
  const stored = localStorage.getItem(sessionKey(account))
  if (!stored) return

  try {
    const session = JSON.parse(stored) as StoredBorrowSession
    if (session.loanId) {
      const loan = await publicClient.readContract({
        address: contracts.shieldedVault,
        abi: vaultAbi,
        functionName: 'loans',
        args: [session.loanId]
      })
      if (loan[2].toLowerCase() !== account.toLowerCase() || loan[5] === 0n || loan[6]) {
        removeSession(account)
        return
      }
      commitment.value = loan[1]
      nullifier.value = session.nullifier
      loanId.value = session.loanId
      depositedAmount.value = loan[3]
      outstandingDebt.value = loan[4]
      maturityTimestamp.value = Number(loan[5])
      borrowAmount.value = Number(formatUnits(loan[4], 6))
      repayAmount.value = Number(formatUnits(loan[4], 6))
      messageTone.value = 'success'
      message.value = 'Your active loan was restored from the vault.'
      return
    }

    const note = await publicClient.readContract({
      address: contracts.shieldedVault,
      abi: vaultAbi,
      functionName: 'notes',
      args: [session.commitment]
    })
    if (note[1].toLowerCase() !== account.toLowerCase() || note[2] === 0n || note[3]) {
      removeSession(account)
      return
    }
    commitment.value = session.commitment
    nullifier.value = session.nullifier
    depositedAmount.value = note[2]
    borrowAmount.value = Number(formatUnits((note[2] * 40_000_000n * 6000n) / (10n ** 18n * 10_000n), 6))
    messageTone.value = 'success'
    message.value = 'Your deposited collateral was restored. Choose the amount you want to borrow.'
  } catch {
    messageTone.value = 'error'
    message.value = 'The saved borrow session could not be restored. Refresh balances and try again.'
  }
}

async function depositCollateral() {
  if (!depositUnits.value) return
  beginTransaction('Connect wallet')
  const amount = depositUnits.value
  try {
    const account = await ensureWallet()
    await refreshBorrowContext(account)
    if (amount > silverBalance.value) throw new Error('This amount exceeds your available vSILVER balance.')
    await ensureAllowance(contracts.rwaToken, account, amount, 'vSILVER')

    const secret = keccak256(toBytes(`${account}:${Date.now()}`))
    commitment.value = keccak256(toBytes(secret))
    nullifier.value = keccak256(toBytes(`${secret}:nullifier`))
    pendingLabel.value = 'Confirm collateral deposit'
    const hash = await writeContract({ address: contracts.shieldedVault, abi: vaultAbi, functionName: 'deposit', args: [silverAssetId, amount, commitment.value] })
    await waitForReceipt(hash)
    depositedAmount.value = amount
    const maximumDebt = (amount * 40_000_000n * 6000n) / (10n ** 18n * 10_000n)
    const availableDebt = maximumDebt < poolLiquidity.value ? maximumDebt : poolLiquidity.value
    borrowAmount.value = Number(formatUnits(availableDebt, 6))
    transactionHash.value = hash
    persistSession(account)
    messageTone.value = 'success'
    message.value = `${formatToken(amount, 18)} vSILVER deposited. Choose a debt amount up to the live borrowing capacity.`
    await refreshBorrowContext(account)
  } catch (error) {
    commitment.value = ''
    nullifier.value = ''
    failTransaction(error, 'Collateral deposit failed')
  } finally {
    pending.value = false
  }
}

async function borrow() {
  if (!commitment.value || !nullifier.value || !borrowUnits.value) return
  beginTransaction('Connect wallet')
  const debt = borrowUnits.value
  try {
    const account = await ensureWallet()
    await refreshBorrowContext(account)
    if (debt > vaultMaxDebt.value) throw new Error('DebtAboveLtv')
    if (debt > poolLiquidity.value) throw new Error('InsufficientLiquidity')

    const inputs = [0n, 0n, 0n, 1n, debt, BigInt(nullifier.value), BigInt(commitment.value)] as const
    maturityTimestamp.value = Math.floor(Date.now() / 1000) + maturityDays.value * 86400
    pendingLabel.value = 'Confirm loan'
    const hash = await writeContract({
      address: contracts.shieldedVault,
      abi: vaultAbi,
      functionName: 'borrow',
      args: [silverAssetId, [0n, 0n], [[0n, 0n], [0n, 0n]], [0n, 0n], inputs, account, BigInt(maturityTimestamp.value)]
    })
    await waitForReceipt(hash)
    transactionHash.value = hash
    loanId.value = keccak256(encodeAbiParameters(
      [{ type: 'bytes32' }, { type: 'bytes32' }, { type: 'uint256' }, { type: 'uint256' }],
      [silverAssetId, commitment.value, BigInt(nullifier.value), 177n]
    ))
    outstandingDebt.value = debt
    repayAmount.value = Number(formatUnits(debt, 6))
    persistSession(account)
    messageTone.value = 'success'
    message.value = `${formatToken(debt, 6)} mUSDC received. Full repayment returns ${formatToken(depositedAmount.value, 18)} vSILVER.`
    await refreshBorrowContext(account)
  } catch (error) {
    maturityTimestamp.value = 0
    failTransaction(error, 'Borrowing failed')
  } finally {
    pending.value = false
  }
}

async function repay() {
  if (!loanId.value || !repayUnits.value) return
  beginTransaction('Connect wallet')
  const amount = repayUnits.value
  try {
    const account = await ensureWallet()
    await refreshBorrowContext(account)
    if (amount > outstandingDebt.value) throw new Error('The repayment cannot exceed the remaining debt.')
    if (amount > stablecoinBalance.value) throw new Error('This amount exceeds your available mUSDC balance.')
    await ensureAllowance(contracts.stablecoin, account, amount, 'mUSDC')

    pendingLabel.value = 'Confirm repayment'
    const hash = await writeContract({ address: contracts.shieldedVault, abi: vaultAbi, functionName: 'repay', args: [loanId.value, amount] })
    await waitForReceipt(hash)
    transactionHash.value = hash
    const fullyRepaid = amount >= outstandingDebt.value
    outstandingDebt.value -= amount
    messageTone.value = 'success'
    if (fullyRepaid) {
      const returned = depositedAmount.value
      message.value = `Loan fully repaid. ${formatToken(returned, 18)} vSILVER was returned to your wallet.`
      loanId.value = ''
      commitment.value = ''
      nullifier.value = ''
      depositedAmount.value = 0n
      outstandingDebt.value = 0n
      maturityTimestamp.value = 0
      depositAmount.value = 0
      borrowAmount.value = 0
      repayAmount.value = 0
      removeSession(account)
    } else {
      message.value = `${formatToken(amount, 6)} mUSDC repaid. ${formatToken(outstandingDebt.value, 6)} mUSDC remains outstanding.`
      setMaxRepay()
      persistSession(account)
    }
    await refreshBorrowContext(account)
  } catch (error) {
    failTransaction(error, 'Repayment failed')
  } finally {
    pending.value = false
  }
}

watch(address, async (account) => {
  if (!import.meta.client) return
  resetPositionState()
  balancesLoaded.value = false
  if (!account) {
    refreshBorrowContext().catch(() => {})
    return
  }
  await Promise.allSettled([
    refreshBorrowContext(account),
    restoreSession(account)
  ])
}, { immediate: true })
</script>
