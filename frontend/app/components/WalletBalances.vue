<template>
  <section class="rounded-panel bg-card p-5 ring-1 ring-default lg:p-6">
    <div class="flex flex-wrap items-start justify-between gap-4">
      <div>
        <div class="flex items-center gap-2 text-[12px] uppercase tracking-[0.08em] text-muted">
          <span
            class="size-2 rounded-full"
            :class="isConnected ? 'bg-covered-500' : 'bg-ink-300'"
          />
          Wallet balances
        </div>
        <p class="mt-2 text-[13px] text-toned">
          {{ accountLabel }}
        </p>
      </div>
      <UButton
        label="Refresh balances"
        color="neutral"
        variant="ghost"
        size="sm"
        :loading="loading"
        :disabled="!isConnected"
        @click="refresh"
      />
    </div>

    <div class="mt-5 grid gap-3 sm:grid-cols-3">
      <div
        v-for="balance in displayedBalances"
        :key="balance.symbol"
        class="rounded-panel bg-muted p-4 ring-1 ring-default"
      >
        <div class="flex items-center justify-between gap-3">
          <span class="font-data text-[12px] text-muted">{{ balance.symbol }}</span>
          <span class="text-[11px] text-muted">{{ balance.note }}</span>
        </div>
        <div class="mt-3 font-display text-[28px] leading-none text-highlighted">
          {{ balance.value }}
        </div>
      </div>
    </div>

    <p
      v-if="error"
      class="mt-3 text-[12px] text-failed-700"
    >
      {{ error }}
    </p>
  </section>
</template>

<script setup lang="ts">
import { formatUnits } from 'viem'
import { contracts, deploymentReady } from '~/utils/contracts'
import { publicClient, tokenAbi } from '~/utils/web3'

const props = defineProps<{
  refreshKey?: string | number
}>()

const { address, isConnected } = useConnection()
const loading = ref(false)
const error = ref('')
const balances = reactive({
  hsk: 0n,
  musdc: 0n,
  silver: 0n
})

const accountLabel = computed(() => {
  if (!isConnected.value || !address.value) return 'Connect a wallet to view live HashKey mainnet balances.'
  return `${address.value.slice(0, 6)}…${address.value.slice(-4)} · HashKey mainnet`
})

const displayedBalances = computed(() => [
  { symbol: 'HSK', note: 'Native gas', value: formatBalance(balances.hsk, 18) },
  { symbol: 'mUSDC', note: 'Mock USDC', value: formatBalance(balances.musdc, 6) },
  { symbol: 'vSILVER', note: 'Tokenized silver', value: formatBalance(balances.silver, 18) }
])

function formatBalance(value: bigint, decimals: number): string {
  if (!isConnected.value) return '—'
  const numeric = Number(formatUnits(value, decimals))
  if (numeric > 0 && numeric < 0.0001) return '<0.0001'
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 4 }).format(numeric)
}

async function refresh() {
  if (!isConnected.value || !address.value || !deploymentReady) return
  loading.value = true
  error.value = ''
  try {
    const [hsk, musdc, silver] = await Promise.all([
      publicClient.getBalance({ address: address.value }),
      publicClient.readContract({
        address: contracts.stablecoin,
        abi: tokenAbi,
        functionName: 'balanceOf',
        args: [address.value]
      }),
      publicClient.readContract({
        address: contracts.rwaToken,
        abi: tokenAbi,
        functionName: 'balanceOf',
        args: [address.value]
      })
    ])
    balances.hsk = hsk
    balances.musdc = musdc
    balances.silver = silver
  } catch (caught) {
    error.value = caught instanceof Error ? caught.message : 'Unable to load wallet balances'
  } finally {
    loading.value = false
  }
}

watch([address, isConnected, () => props.refreshKey], () => {
  if (!isConnected.value) {
    balances.hsk = 0n
    balances.musdc = 0n
    balances.silver = 0n
    error.value = ''
    return
  }
  refresh()
}, { immediate: true })
</script>
