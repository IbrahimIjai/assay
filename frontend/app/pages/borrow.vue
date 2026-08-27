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

      <div class="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section class="rounded-panel bg-card p-6 ring-1 ring-default lg:p-7">
          <p class="mb-5 rounded-panel bg-muted p-4 text-[13px] leading-[1.6] text-toned ring-1 ring-default">
            <strong class="text-highlighted">Demo:</strong> deposit the 1,000 vSILVER just minted, borrow 18,000 mUSDC, then repay. The 60% cap allows up to 24,000 mUSDC at the demo price.
          </p>
          <div class="flex items-center justify-between gap-4">
            <div>
              <div class="text-[12px] uppercase tracking-[0.08em] text-muted">
                Private collateral
              </div>
              <h2 class="mt-2 font-display text-[32px] text-highlighted">
                vSILVER position
              </h2>
            </div>
            <CoverageBadge status="covered" />
          </div>

          <dl class="mt-7 grid gap-px overflow-hidden rounded-panel bg-default ring-1 ring-default sm:grid-cols-2">
            <div
              v-for="fact in facts"
              :key="fact.label"
              class="bg-muted p-5"
            >
              <dt class="text-[12px] text-muted">
                {{ fact.label }}
              </dt>
              <dd class="mt-2 font-data text-[20px] text-highlighted">
                {{ fact.value }}
              </dd>
            </div>
          </dl>

          <div class="mt-7">
            <div class="flex justify-between text-[13px] text-toned">
              <span>Requested debt</span>
              <span class="font-data">$18,000 / $24,000</span>
            </div>
            <div class="mt-2 h-2 overflow-hidden rounded-full bg-ink-100">
              <div class="h-full w-3/4 rounded-full bg-primary" />
            </div>
          </div>

          <div class="mt-8 flex flex-wrap gap-3">
            <UButton
              label="1. Deposit 1,000 vSILVER"
              :loading="pending"
              :disabled="!deploymentReady || Boolean(commitment)"
              @click="depositCollateral"
            />
            <UButton
              label="2. Borrow 18,000 mUSDC"
              :loading="pending"
              :disabled="!commitment || Boolean(loanId)"
              @click="borrow"
            />
            <UButton
              label="3. Repay loan"
              color="neutral"
              variant="outline"
              :loading="pending"
              :disabled="!loanId"
              @click="repay"
            />
          </div>
          <p class="mt-4 text-[13px] text-muted">
            {{ message || 'Complete the three wallet transactions in order.' }}
          </p>
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
            The commitment secret stays in this browser. This demo deposit still exposes the sender and amount; hiding them requires the production borrowing circuit.
          </p>
        </aside>
      </div>
    </UContainer>
  </div>
</template>

<script setup lang="ts">
import { encodeAbiParameters, keccak256, parseUnits, toBytes } from 'viem'
import { contracts, deploymentReady, silverAssetId } from '~/utils/contracts'
import { tokenAbi, vaultAbi } from '~/utils/web3'

useSeoMeta({ title: 'Private borrowing — Assay Protocol' })

const pending = ref(false)
const message = ref('')
const commitment = ref<`0x${string}` | ''>('')
const nullifier = ref<`0x${string}` | ''>('')
const loanId = ref<`0x${string}` | ''>('')
const { ensureWallet, waitForReceipt, writeContract } = useAssayWallet()

const facts = [
  { label: 'Position', value: '1,000 vSILVER' },
  { label: 'Maximum LTV', value: '60%' },
  { label: 'Borrowable', value: '$24,000 USDC' },
  { label: 'Reserve status', value: 'VERIFIED' }
]

const disclosures = [
  { label: 'Collateral commitment', value: 'PUBLIC', private: false },
  { label: 'Debt amount', value: 'PUBLIC', private: false },
  { label: 'Nullifier', value: 'PUBLIC', private: false },
  { label: 'Position size', value: 'PUBLIC IN DEMO', private: false },
  { label: 'Owner identity', value: 'PUBLIC IN DEMO', private: false },
  { label: 'Note secret', value: 'NEVER SHARED', private: true }
]

async function depositCollateral() {
  pending.value = true
  try {
    const account = await ensureWallet()
    const amount = parseUnits('1000', 18)
    const secret = keccak256(toBytes(`${account}:${Date.now()}`))
    commitment.value = keccak256(toBytes(secret))
    nullifier.value = keccak256(toBytes(`${secret}:nullifier`))
    const approval = await writeContract({ address: contracts.rwaToken, abi: tokenAbi, functionName: 'approve', args: [contracts.shieldedVault, amount] })
    await waitForReceipt(approval)
    const hash = await writeContract({ address: contracts.shieldedVault, abi: vaultAbi, functionName: 'deposit', args: [silverAssetId, amount, commitment.value] })
    await waitForReceipt(hash)
    message.value = 'Collateral deposited. The local commitment secret was retained in this page.'
  } catch (error) {
    commitment.value = ''
    nullifier.value = ''
    message.value = error instanceof Error ? error.message : 'Deposit failed'
  } finally { pending.value = false }
}

async function borrow() {
  if (!commitment.value || !nullifier.value) return
  pending.value = true
  try {
    const account = await ensureWallet()
    const debt = parseUnits('18000', 6)
    const inputs = [0n, 0n, 0n, 1n, debt, BigInt(nullifier.value), BigInt(commitment.value)] as const
    const hash = await writeContract({
      address: contracts.shieldedVault,
      abi: vaultAbi,
      functionName: 'borrow',
      args: [silverAssetId, [0n, 0n], [[0n, 0n], [0n, 0n]], [0n, 0n], inputs, account, BigInt(Math.floor(Date.now() / 1000) + 30 * 86400)]
    })
    await waitForReceipt(hash)
    loanId.value = keccak256(encodeAbiParameters(
      [{ type: 'bytes32' }, { type: 'bytes32' }, { type: 'uint256' }, { type: 'uint256' }],
      [silverAssetId, commitment.value, BigInt(nullifier.value), 177n]
    ))
    message.value = '18,000 mUSDC borrowed to the connected wallet.'
  } catch (error) {
    message.value = error instanceof Error ? error.message : 'Borrow failed'
  } finally { pending.value = false }
}

async function repay() {
  if (!loanId.value) return
  pending.value = true
  try {
    await ensureWallet()
    const amount = parseUnits('18000', 6)
    const approval = await writeContract({ address: contracts.stablecoin, abi: tokenAbi, functionName: 'approve', args: [contracts.shieldedVault, amount] })
    await waitForReceipt(approval)
    const hash = await writeContract({ address: contracts.shieldedVault, abi: vaultAbi, functionName: 'repay', args: [loanId.value, amount] })
    await waitForReceipt(hash)
    message.value = 'Loan repaid and vSILVER collateral returned.'
    loanId.value = ''
  } catch (error) {
    message.value = error instanceof Error ? error.message : 'Repayment failed'
  } finally { pending.value = false }
}
</script>
