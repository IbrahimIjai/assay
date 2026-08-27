<template>
  <div>
    <section class="relative overflow-hidden border-b border-default">
      <div class="grid-bg pointer-events-none absolute inset-0" />
      <UContainer class="relative py-14 lg:py-20">
        <SectionLabel>Lender view</SectionLabel>
        <h1 class="mt-4 max-w-[760px] font-display text-[40px] leading-[1.02] text-highlighted sm:text-[56px]">
          Pool health without borrower surveillance
        </h1>
        <p class="mt-5 max-w-[680px] text-[16px] leading-[1.65] text-toned">
          Solvency, utilisation, maturities, and collateral coverage are public.
          Borrower identity and private position details are not.
        </p>
      </UContainer>
    </section>

    <UContainer class="py-12 lg:py-16">
      <WalletBalances
        class="mb-6"
        :refresh-key="transactionHash"
      />

      <div class="mb-6 rounded-panel bg-card p-6 ring-1 ring-default">
        <p class="mb-4 text-[14px] leading-[1.6] text-toned">
          <strong class="text-highlighted">Demo:</strong> enter 1,000, connect the deployer wallet, approve mUSDC, and supply it. The live liquidity figure increases and the wallet receives pool shares.
        </p>
        <div class="flex flex-wrap items-end gap-4">
          <div class="min-w-[220px] flex-1">
            <label class="text-[12px] uppercase tracking-[0.08em] text-muted">mUSDC amount / shares</label>
            <input
              v-model="amount"
              type="number"
              min="1"
              class="mt-3 w-full rounded-panel border border-default bg-muted px-4 py-3 text-[18px] outline-none"
            >
          </div>
          <UButton
            label="Supply liquidity"
            :loading="pending"
            :disabled="!deploymentReady"
            @click="supply"
          />
          <UButton
            label="Withdraw shares"
            color="neutral"
            variant="outline"
            :loading="pending"
            :disabled="!deploymentReady"
            @click="withdraw"
          />
          <UButton
            label="Refresh"
            color="neutral"
            variant="ghost"
            @click="refresh"
          />
        </div>
        <p class="mt-3 text-[13px] text-muted">
          {{ message || 'Wallet transactions use the deployed HashKey mainnet mUSDC demo pool.' }}
        </p>
        <TransactionHashLink
          v-if="transactionHash"
          :hash="transactionHash"
        />
      </div>

      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div
          v-for="metric in metrics"
          :key="metric.label"
          class="rounded-panel bg-card p-5 ring-1 ring-default"
        >
          <div class="text-[12px] uppercase tracking-[0.08em] text-muted">
            {{ metric.label }}
          </div>
          <div class="mt-3 font-display text-[36px] leading-none text-highlighted">
            {{ metric.value }}
          </div>
          <div class="mt-3 text-[13px] text-toned">
            {{ metric.note }}
          </div>
        </div>
      </div>

      <div class="mt-6 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <section class="rounded-panel bg-card p-6 ring-1 ring-default lg:p-7">
          <div class="flex items-center justify-between gap-4">
            <div>
              <SectionLabel>Collateral coverage</SectionLabel>
              <h2 class="mt-3 font-display text-[30px] text-highlighted">
                Assets securing the pool
              </h2>
            </div>
            <CoverageBadge status="covered" />
          </div>
          <div class="mt-7 space-y-5">
            <div
              v-for="asset in collateral"
              :key="asset.symbol"
            >
              <div class="flex items-center justify-between gap-4 text-[14px]">
                <span class="font-data text-highlighted">{{ asset.symbol }}</span>
                <span
                  class="font-data"
                  :class="statusMeta[asset.status].text"
                >{{ asset.coverage }}</span>
              </div>
              <div class="mt-2 h-2 overflow-hidden rounded-full bg-ink-100">
                <div
                  class="h-full rounded-full"
                  :class="asset.status === 'covered' ? 'bg-covered-500' : 'bg-stale-500'"
                  :style="{ width: asset.share }"
                />
              </div>
            </div>
          </div>
        </section>

        <section class="rounded-panel bg-band p-6 text-white lg:p-7">
          <div class="text-[12px] uppercase tracking-[0.08em] text-white/40">
            Maturity ladder
          </div>
          <h2 class="mt-3 font-display text-[30px]">
            Debt coming due
          </h2>
          <div class="mt-6 space-y-3">
            <div
              v-for="bucket in maturities"
              :key="bucket.window"
              class="flex items-center justify-between gap-4 rounded-[12px] bg-white/5 p-4 ring-1 ring-white/10"
            >
              <span class="text-[14px] text-white/60">{{ bucket.window }}</span>
              <span class="font-data text-[15px] text-white">{{ bucket.amount }}</span>
            </div>
          </div>
          <p class="mt-6 text-[13px] leading-[1.6] text-white/50">
            Demo fixture shaped for <span class="font-data">GET /api/pools/health</span>.
            No borrower-level records are exposed.
          </p>
        </section>
      </div>
    </UContainer>
  </div>
</template>

<script setup lang="ts">
import { formatUnits, parseUnits } from 'viem'
import { statusMeta, type CoverageStatus } from '~/utils/assay'
import { contracts, deploymentReady } from '~/utils/contracts'
import { poolAbi, publicClient, tokenAbi } from '~/utils/web3'

useSeoMeta({ title: 'Pool health — Assay Protocol' })

const amount = ref(1000)
const liquidity = ref(0n)
const debt = ref(0n)
const utilisation = ref(0n)
const pending = ref(false)
const message = ref('')
const transactionHash = ref<`0x${string}` | ''>('')
const { ensureWallet, waitForReceipt, writeContract } = useAssayWallet()

const metrics = computed(() => [
  { label: 'Available liquidity', value: `${formatUnits(liquidity.value, 6)} mUSDC`, note: 'Live pool token balance' },
  { label: 'Total borrowed', value: `${formatUnits(debt.value, 6)} mUSDC`, note: 'Live outstanding principal' },
  { label: 'Utilisation', value: `${(Number(utilisation.value) / 1e16).toFixed(2)}%`, note: 'Debt / debt plus liquidity' },
  { label: 'Network', value: 'HashKey', note: 'Mainnet chain ID 177' }
])

async function refresh() {
  if (!deploymentReady) return
  const [nextLiquidity, nextDebt, nextUtilisation] = await Promise.all([
    publicClient.readContract({ address: contracts.lendingPool, abi: poolAbi, functionName: 'totalLiquidity' }),
    publicClient.readContract({ address: contracts.lendingPool, abi: poolAbi, functionName: 'totalDebt' }),
    publicClient.readContract({ address: contracts.lendingPool, abi: poolAbi, functionName: 'utilisation' })
  ])
  liquidity.value = nextLiquidity
  debt.value = nextDebt
  utilisation.value = nextUtilisation
}

async function supply() {
  pending.value = true
  message.value = ''
  transactionHash.value = ''
  try {
    const value = parseUnits(String(amount.value), 6)
    const account = await ensureWallet()
    const allowance = await publicClient.readContract({ address: contracts.stablecoin, abi: tokenAbi, functionName: 'allowance', args: [account, contracts.lendingPool] })
    if (allowance < value) {
      const approval = await writeContract({ address: contracts.stablecoin, abi: tokenAbi, functionName: 'approve', args: [contracts.lendingPool, value] })
      await waitForReceipt(approval)
    }
    const hash = await writeContract({ address: contracts.lendingPool, abi: poolAbi, functionName: 'supply', args: [value] })
    await waitForReceipt(hash)
    transactionHash.value = hash
    message.value = `Supplied ${amount.value} mUSDC on mainnet.`
    await refresh()
  } catch (error) {
    message.value = error instanceof Error ? error.message : 'Supply failed'
  } finally { pending.value = false }
}

async function withdraw() {
  pending.value = true
  message.value = ''
  transactionHash.value = ''
  try {
    const shares = parseUnits(String(amount.value), 6)
    await ensureWallet()
    const hash = await writeContract({ address: contracts.lendingPool, abi: poolAbi, functionName: 'withdraw', args: [shares] })
    await waitForReceipt(hash)
    transactionHash.value = hash
    message.value = `Withdrew ${amount.value} pool shares.`
    await refresh()
  } catch (error) {
    message.value = error instanceof Error ? error.message : 'Withdrawal failed'
  } finally { pending.value = false }
}

onMounted(() => refresh().catch((error) => {
  message.value = error.message
}))

const collateral: { symbol: string, coverage: string, share: string, status: CoverageStatus }[] = [
  { symbol: 'SILVER-001', coverage: 'Read from registry', share: '100%', status: 'covered' }
]

const maturities = [
  { window: 'Next 30 days', amount: '$184,000' },
  { window: '31–90 days', amount: '$426,000' },
  { window: '91–180 days', amount: '$511,000' },
  { window: 'Beyond 180 days', amount: '$419,000' }
]
</script>
