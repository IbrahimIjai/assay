<template>
  <div>
    <section class="relative overflow-hidden border-b border-default">
      <div class="grid-bg pointer-events-none absolute inset-0" />
      <UContainer class="relative py-14 lg:py-20">
        <NuxtLink
          to="/asset/silver-001"
          class="inline-flex items-center gap-1.5 text-[13px] text-muted transition-colors hover:text-highlighted"
        >
          <UIcon
            name="i-lucide-arrow-left"
            class="size-3.5"
          />
          Back to asset
        </NuxtLink>

        <div class="mt-8 max-w-[760px]">
          <SectionLabel>Minting</SectionLabel>
          <h1 class="mt-4 font-display text-[40px] leading-[1.02] text-highlighted sm:text-[56px]">
            Reserve proof required before issuance
          </h1>
          <p class="mt-5 text-[16px] leading-[1.65] text-toned">
            The compliance module is the gate. If the proof is stale or the coverage check fails,
            minting reverts at the contract level instead of relying on a UI-only warning.
          </p>
        </div>
      </UContainer>
    </section>

    <UContainer class="py-12 lg:py-16">
      <div class="mb-6 flex items-center gap-2 rounded-panel bg-stale-50 p-4 text-[13px] text-stale-800 ring-1 ring-stale-200">
        <UIcon
          name="i-lucide-info"
          class="size-4 shrink-0"
        />
        HashKey mainnet — this page reads ReserveRegistry and sends a real wallet transaction.
      </div>

      <WalletBalances
        class="mb-6"
        :refresh-key="transactionHash"
      />

      <div class="mb-6 grid gap-3 sm:grid-cols-3">
        <div class="rounded-panel bg-card p-4 ring-1 ring-default">
          <span class="font-data text-[12px] text-muted">01</span>
          <p class="mt-2 text-[14px] text-highlighted">
            Run the healthy reserve proof
          </p>
        </div>
        <div class="rounded-panel bg-card p-4 ring-1 ring-default">
          <span class="font-data text-[12px] text-muted">02</span>
          <p class="mt-2 text-[14px] text-highlighted">
            Connect the issuer wallet
          </p>
        </div>
        <div class="rounded-panel bg-card p-4 ring-1 ring-default">
          <span class="font-data text-[12px] text-muted">03</span>
          <p class="mt-2 text-[14px] text-highlighted">
            Mint 1,000 reserve-capped vSILVER
          </p>
        </div>
      </div>

      <div class="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div class="rounded-panel bg-card p-6 ring-1 ring-default lg:p-7">
          <div class="text-[12px] uppercase tracking-[0.08em] text-muted">
            Reserve coverage
          </div>
          <div class="mt-5 flex items-end gap-4">
            <div class="font-display text-[54px] leading-none text-highlighted">
              {{ canMint ? 'Covered' : 'Blocked' }}
            </div>
            <span
              class="mb-2 rounded-full px-2.5 py-1 font-data text-[12px] ring-1"
              :class="canMint ? 'bg-covered-50 text-covered-700 ring-covered-200' : 'bg-failed-50 text-failed-700 ring-failed-200'"
            >
              {{ canMint ? '✓ VERIFIED' : 'FAILED' }}
            </span>
          </div>

          <div class="mt-6 grid gap-6 sm:grid-cols-2">
            <div class="rounded-panel bg-muted p-4 ring-1 ring-default">
              <div class="text-[12px] uppercase tracking-[0.08em] text-muted">
                Freshness
              </div>
              <div class="mt-2 font-display text-[28px] leading-none text-highlighted">
                {{ freshnessText }}
              </div>
              <div class="mt-2 text-[13px] text-toned">
                Remaining before mint blocks
              </div>
            </div>
            <div class="rounded-panel bg-muted p-4 ring-1 ring-default">
              <div class="text-[12px] uppercase tracking-[0.08em] text-muted">
                Proof hash
              </div>
              <div class="mt-2 font-data text-[15px] text-highlighted">
                {{ proofHashLabel }}
              </div>
              <div class="mt-2 text-[13px] text-toned">
                Registered on-chain
              </div>
            </div>
          </div>

          <div class="mt-8">
            <label class="text-[12px] uppercase tracking-[0.08em] text-muted">Mint amount</label>
            <div class="mt-3 flex items-center gap-3 rounded-panel border border-default bg-muted px-4 py-3">
              <span class="font-data text-[13px] text-muted">[</span>
              <input
                v-model="mintAmount"
                type="number"
                min="1"
                class="w-full bg-transparent text-[18px] text-highlighted outline-none"
              >
              <span class="font-data text-[13px] text-muted">]</span>
            </div>
          </div>

          <div class="mt-8 flex flex-wrap items-center gap-3">
            <UButton
              :label="canMint ? `Mint ${mintAmount || 0} vSILVER` : 'MINT DISABLED'"
              size="lg"
              :disabled="!canMint"
              :loading="transactionState === 'pending'"
              @click="attemptMint"
            />
            <span class="text-[13px] text-muted">{{ canMint ? 'Eligible under current reserve proof' : 'MINT DISABLED' }}</span>
          </div>

          <div
            v-if="transactionState !== 'idle'"
            class="mt-6 rounded-panel p-4 ring-1"
            :class="transactionState === 'confirmed' ? 'bg-covered-50 ring-covered-200' : 'bg-failed-50 ring-failed-200'"
          >
            <div
              class="font-data text-[12px]"
              :class="transactionState === 'confirmed' ? 'text-covered-700' : 'text-failed-700'"
            >
              MAINNET CONTRACT RESPONSE
            </div>
            <div class="mt-2 text-[14px] font-medium text-highlighted">
              {{ transactionState === 'confirmed' ? `Mint ${mintAmount} vSILVER confirmed` : transactionError || 'Transaction reverted' }}
            </div>
            <div
              v-if="transactionState === 'reverted'"
              class="mt-2 font-data text-[12px] text-failed-700"
            >
              AssayCompliance.ReserveNotCovered()
            </div>
            <TransactionHashLink
              v-if="transactionState === 'confirmed' && transactionHash"
              :hash="transactionHash"
            />
          </div>
        </div>

        <div class="rounded-panel bg-muted p-6 ring-1 ring-default lg:p-7">
          <div class="text-[12px] uppercase tracking-[0.08em] text-muted">
            Compliance state
          </div>
          <h2 class="mt-3 font-display text-[30px] leading-[1.08] text-highlighted">
            Issuance status
          </h2>

          <div class="mt-6 rounded-panel bg-card p-4 ring-1 ring-default">
            <div
              class="flex items-center gap-2 text-[13px] font-medium"
              :class="canMint ? 'text-covered-700' : 'text-failed-700'"
            >
              <span
                class="size-2 rounded-full"
                :class="canMint ? 'bg-covered-500' : 'bg-failed-500'"
              />
              {{ canMint ? 'Eligible for mint' : 'Missing fresh proof' }}
            </div>
            <p class="mt-3 text-[14px] leading-[1.6] text-toned">
              {{ canMint
                ? 'The registry is currently above the required reserve threshold and the proof is fresh enough for mint issuance.'
                : 'Reserve coverage could not be verified. The compliance contract will reject issuance until a healthy round is recorded.'
              }}
            </p>
          </div>

          <div class="mt-6 space-y-3 text-[14px] leading-[1.6] text-toned">
            <div class="flex items-center justify-between gap-4 border-b border-default pb-2.5">
              <span>Reserve coverage</span>
              <span class="font-data text-highlighted">{{ canMint ? 'COVERED' : 'BLOCKED' }}</span>
            </div>
            <div class="flex items-center justify-between gap-4 border-b border-default pb-2.5">
              <span>Freshness</span>
              <span class="font-data text-highlighted">{{ freshnessText }}</span>
            </div>
            <div class="flex items-center justify-between gap-4">
              <span>Contract check</span>
              <span
                class="font-data"
                :class="canMint ? 'text-covered-700' : 'text-failed-700'"
              >
                {{ canMint ? 'PASS' : 'REVERT' }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </UContainer>
  </div>
</template>

<script setup lang="ts">
import { parseUnits } from 'viem'
import { contracts, deploymentReady, silverAssetId } from '~/utils/contracts'
import { publicClient, reserveRegistryAbi, tokenAbi } from '~/utils/web3'

type TransactionState = 'idle' | 'pending' | 'confirmed' | 'reverted'

const mintAmount = ref(1000)
const transactionState = ref<TransactionState>('idle')
const transactionError = ref('')
const transactionHash = ref<`0x${string}` | ''>('')
const totalSupply = ref(0n)
const attestation = ref({ covered: false, asOf: 0n, supplyAtProof: 0n, proofHash: '0x' })
const fresh = ref(false)
const { ensureWallet, waitForReceipt, writeContract } = useAssayWallet()

const requestedAmount = computed(() => {
  try {
    return parseUnits(String(mintAmount.value || 0), 18)
  } catch {
    return 0n
  }
})
const canMint = computed(() => deploymentReady
  && fresh.value
  && attestation.value.covered
  && requestedAmount.value > 0n
  && totalSupply.value + requestedAmount.value <= attestation.value.supplyAtProof)
const freshnessText = computed(() => {
  if (!attestation.value.asOf) return 'No proof'
  const remaining = Number(attestation.value.asOf + 86400n) * 1000 - Date.now()
  if (remaining <= 0) return 'Stale'
  const hours = Math.floor(remaining / 3_600_000)
  const minutes = Math.floor((remaining % 3_600_000) / 60_000)
  return `${hours}h ${minutes}m remaining`
})
const proofHashLabel = computed(() => attestation.value.proofHash.length > 10
  ? `${attestation.value.proofHash.slice(0, 10)}…`
  : 'No proof')

async function refresh() {
  if (!deploymentReady) return
  const [latest, isFresh, supply] = await Promise.all([
    publicClient.readContract({ address: contracts.reserveRegistry, abi: reserveRegistryAbi, functionName: 'getLatest', args: [silverAssetId] }),
    publicClient.readContract({ address: contracts.reserveRegistry, abi: reserveRegistryAbi, functionName: 'isFresh', args: [silverAssetId] }),
    publicClient.readContract({ address: contracts.rwaToken, abi: tokenAbi, functionName: 'totalSupply' })
  ])
  attestation.value = latest as typeof attestation.value
  fresh.value = isFresh
  totalSupply.value = supply
}

async function attemptMint() {
  transactionState.value = 'pending'
  transactionError.value = ''
  transactionHash.value = ''
  try {
    const account = await ensureWallet()
    const hash = await writeContract({
      address: contracts.rwaToken,
      abi: tokenAbi,
      functionName: 'mint',
      args: [account, requestedAmount.value]
    })
    await waitForReceipt(hash)
    transactionHash.value = hash
    transactionState.value = 'confirmed'
    await refresh()
  } catch (error) {
    transactionState.value = 'reverted'
    transactionError.value = error instanceof Error ? error.message : 'Transaction failed'
  }
}

onMounted(() => refresh().catch((error) => {
  transactionError.value = error.message
}))
</script>
