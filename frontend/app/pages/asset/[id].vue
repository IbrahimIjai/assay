<template>
  <div>
    <section class="relative overflow-hidden border-b border-default">
      <div class="grid-bg pointer-events-none absolute inset-0" />

      <UContainer class="relative py-12 lg:py-16">
        <NuxtLink
          to="/#assets"
          class="inline-flex items-center gap-1.5 text-[13px] text-muted transition-colors hover:text-highlighted"
        >
          <UIcon
            name="i-lucide-arrow-left"
            class="size-3.5"
          />
          All tracked assets
        </NuxtLink>

        <div class="mt-7 flex flex-wrap items-start justify-between gap-6">
          <div>
            <div class="flex items-center gap-3">
              <span class="font-data text-[14px] font-medium text-muted">{{ asset.symbol }}</span>
              <span class="rounded-full bg-muted px-2.5 py-1 text-[12px] text-toned">{{ asset.kind }}</span>
            </div>
            <h1 class="mt-3 font-display text-[40px] leading-[1.02] text-highlighted sm:text-[54px]">
              {{ asset.name }}
            </h1>
          </div>

          <CoverageBadge
            :status="asset.status"
            :pulse="asset.status === 'covered'"
          />
        </div>

        <p class="mt-6 max-w-[660px] text-[16px] leading-[1.65] text-toned">
          {{ asset.blurb }}
        </p>

        <div class="mt-8 flex flex-wrap gap-3">
          <UButton
            v-if="asset.id === 'SILVER-001'"
            to="/issuer/mint"
            label="Mint tokens"
            size="lg"
            :disabled="asset.status !== 'covered'"
            trailing-icon="i-lucide-arrow-right"
          />
          <UButton
            to="/issuer/proof"
            label="Run reserve proof"
            color="neutral"
            variant="outline"
            size="lg"
          />
        </div>
      </UContainer>
    </section>

    <!-- Status explainer. The badge says the state; this says what it means for
         minting and borrowing right now, which is the actionable half. -->
    <section
      class="border-b border-default"
      :class="asset.status === 'covered' ? 'bg-covered-50' : asset.status === 'stale' ? 'bg-stale-50' : 'bg-failed-50'"
    >
      <UContainer class="flex flex-wrap items-center gap-x-4 gap-y-2 py-4">
        <span
          class="size-2 shrink-0 rounded-full"
          :class="statusMeta[asset.status].dot"
        />
        <span
          class="text-[14px] font-medium"
          :class="statusMeta[asset.status].text"
        >{{ statusMeta[asset.status].label }}</span>
        <span class="text-[14px] text-toned">{{ statusMeta[asset.status].description }}</span>
      </UContainer>
    </section>

    <UContainer class="py-12 lg:py-16">
      <div class="grid gap-6 lg:grid-cols-[1.25fr_1fr]">
        <div class="rounded-panel bg-card p-7 ring-1 ring-default">
          <CoverageMeter
            :supply="asset.supply"
            :reserves="asset.reserves"
            :unit="asset.unit"
            :status="asset.status"
          />
        </div>

        <div class="flex flex-col gap-6">
          <!-- Freshness. The countdown is the difference between a proof and a
               PDF, so it gets its own panel rather than a row in a table. -->
          <div class="rounded-panel bg-band p-7 text-white">
            <div class="text-[12px] uppercase tracking-[0.09em] text-white/40">
              Attestation freshness
            </div>

            <div class="mt-4 font-display text-[36px] leading-none">
              <TimeAgo :minutes="asset.lastProofMinutesAgo" />
            </div>
            <div class="mt-2 text-[14px] text-white/55">
              Last verified round
            </div>

            <div class="mt-6 border-t border-white/10 pt-5">
              <div class="flex items-baseline justify-between gap-4">
                <span class="text-[14px] text-white/55">Window</span>
                <span class="font-data text-[14px] text-white">{{ asset.freshnessWindowHours }}h</span>
              </div>
              <div class="mt-2.5 flex items-baseline justify-between gap-4">
                <span class="text-[14px] text-white/55">Status</span>
                <span
                  class="font-data text-[14px]"
                  :class="remaining >= 0 ? 'text-covered-300' : 'text-stale-300'"
                >
                  <TimeAgo
                    :minutes="remaining"
                    countdown
                  />
                </span>
              </div>
            </div>
          </div>

          <dl class="grid gap-px overflow-hidden rounded-panel bg-default ring-1 ring-default sm:grid-cols-2">
            <div
              v-for="fact in facts"
              :key="fact.label"
              class="bg-card p-5"
            >
              <dt class="text-[12px] text-muted">
                {{ fact.label }}
              </dt>
              <dd
                class="mt-1.5 text-[15px] text-highlighted"
                :class="fact.mono ? 'font-data' : 'font-medium'"
              >
                {{ fact.value }}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <!-- Proof history -->
      <div class="mt-14">
        <div class="flex flex-wrap items-end justify-between gap-4">
          <div>
            <SectionLabel>Proof history</SectionLabel>
            <h2 class="mt-3 font-display text-[30px] leading-[1.08] text-highlighted">
              Rounds submitted for {{ asset.symbol }}
            </h2>
          </div>
          <UButton
            to="/proofs"
            label="All assets"
            color="neutral"
            variant="outline"
            size="sm"
            trailing-icon="i-lucide-arrow-up-right"
          />
        </div>

        <div class="mt-6 overflow-x-auto rounded-panel bg-card ring-1 ring-default">
          <table class="min-w-full">
            <thead>
              <tr class="border-b border-default">
                <th
                  v-for="head in headings"
                  :key="head.label"
                  scope="col"
                  class="whitespace-nowrap bg-muted px-4 py-3 text-[11px] font-medium uppercase tracking-[0.08em] text-muted"
                  :class="head.align === 'right' ? 'text-right' : 'text-left'"
                >
                  {{ head.label }}
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-default">
              <tr
                v-for="round in rounds"
                :key="round.id"
                class="transition-colors hover:bg-muted/60"
              >
                <td class="whitespace-nowrap px-4 py-4 font-data text-[13px] text-highlighted">
                  {{ round.id }}
                </td>
                <td class="px-4 py-4">
                  <CoverageBadge
                    :status="round.status"
                    size="sm"
                  />
                </td>
                <td class="whitespace-nowrap px-4 py-4 text-right">
                  <span
                    class="font-data text-[13px] font-medium"
                    :class="statusMeta[round.status].text"
                  >{{ formatBps(round.coverageBps) }}</span>
                </td>
                <td class="whitespace-nowrap px-4 py-4 text-right font-data text-[13px] text-toned">
                  {{ formatQty(round.supplyAtProof) }}
                </td>
                <td class="whitespace-nowrap px-4 py-4 text-right font-data text-[13px] text-toned">
                  {{ round.operatorsAgreed }}/{{ round.operatorsTotal }}
                </td>
                <td class="whitespace-nowrap px-4 py-4 font-data text-[13px] text-muted">
                  {{ truncateHash(round.proofHash) }}
                </td>
                <td class="whitespace-nowrap px-4 py-4 text-right text-[13px] text-muted">
                  <TimeAgo :minutes="round.minutesAgo" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <p class="mt-6 max-w-[720px] text-[13px] leading-[1.65] text-muted">
        Custodian count is published; custodian identities and the split of reserves
        between them are not. Both are private inputs to the circuit, and a verifier
        learns only that the signed quantities sum above supply.
      </p>

      <div class="mt-14 grid gap-6 lg:grid-cols-2">
        <section class="rounded-panel bg-card p-6 ring-1 ring-default">
          <SectionLabel>On-chain contracts</SectionLabel>
          <h2 class="mt-3 font-display text-[30px] text-highlighted">
            Verification path
          </h2>
          <dl class="mt-6 space-y-3">
            <div
              v-for="contract in contractRows"
              :key="contract.label"
              class="flex items-center justify-between gap-4 border-b border-default pb-3 last:border-0"
            >
              <dt class="text-[13px] text-muted">
                {{ contract.label }}
              </dt>
              <dd>
                <a
                  :href="explorerAddress(contract.address)"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="font-data text-[12px] text-highlighted underline decoration-ink-300 underline-offset-4"
                >
                  {{ truncateHash(contract.address) }}
                </a>
              </dd>
            </div>
          </dl>
        </section>

        <section class="rounded-panel bg-band p-6 text-white">
          <div class="text-[12px] uppercase tracking-[0.09em] text-white/40">
            Public / private boundary
          </div>
          <h2 class="mt-3 font-display text-[30px]">
            What verification reveals
          </h2>
          <div class="mt-6 grid gap-5 sm:grid-cols-2">
            <div>
              <div class="font-data text-[12px] text-covered-300">
                PUBLIC
              </div>
              <ul class="mt-3 space-y-2 text-[13px] text-white/70">
                <li>Asset and token supply</li>
                <li>Coverage result</li>
                <li>As-of time and proof hash</li>
                <li>Custodian count and root</li>
              </ul>
            </div>
            <div>
              <div class="font-data text-[12px] text-stale-300">
                PRIVATE
              </div>
              <ul class="mt-3 space-y-2 text-[13px] text-white/70">
                <li>Custodian identities</li>
                <li>Individual quantities</li>
                <li>Accounts and signatures</li>
                <li>Source documents</li>
              </ul>
            </div>
          </div>
          <p class="mt-6 text-[12px] leading-[1.6] text-white/45">
            ZK proves that signed statements satisfy circuit constraints. It does not prove physical truth.
          </p>
        </section>
      </div>
    </UContainer>
  </div>
</template>

<script setup lang="ts">
import {
  assetValueUsd,
  formatBps,
  formatQty,
  formatUsd,
  freshnessRemainingMinutes,
  getAsset,
  roundsForAsset,
  statusMeta,
  truncateHash
} from '~/utils/assay'
import { contracts, explorerAddress } from '~/utils/contracts'

const route = useRoute()

const asset = getAsset(String(route.params.id))

if (!asset) {
  throw createError({
    statusCode: 404,
    statusMessage: 'No such tracked asset',
    fatal: true
  })
}

useSeoMeta({
  title: `${asset.name} (${asset.symbol}) — Assay Protocol`,
  description: asset.blurb
})

const rounds = roundsForAsset(asset.id)
const latestRound = rounds[0]
const remaining = freshnessRemainingMinutes(asset)

const facts = [
  { label: 'Reserve value', value: formatUsd(assetValueUsd(asset)), mono: true },
  { label: 'Custodians', value: `${asset.custodians} registered`, mono: false },
  { label: 'Max LTV', value: asset.maxLtvBps ? `${asset.maxLtvBps / 100}%` : 'Borrowing blocked', mono: true },
  { label: 'Latest proof', value: latestRound ? truncateHash(latestRound.proofHash) : 'No proof', mono: true }
]

const contractRows = [
  { label: 'Reserve registry', address: contracts.reserveRegistry },
  { label: 'Groth16 verifier', address: contracts.reserveVerifier },
  { label: 'Compliance module', address: contracts.compliance },
  { label: 'vSILVER token', address: contracts.rwaToken }
]

const headings = [
  { label: 'Round', align: 'left' },
  { label: 'Result', align: 'left' },
  { label: 'Coverage', align: 'right' },
  { label: 'Supply at proof', align: 'right' },
  { label: 'Operators', align: 'right' },
  { label: 'Proof hash', align: 'left' },
  { label: 'Submitted', align: 'right' }
]
</script>
