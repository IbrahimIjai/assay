<template>
  <div>
    <section class="relative overflow-hidden border-b border-default">
      <div class="grid-bg pointer-events-none absolute inset-0" />

      <UContainer class="relative py-14 lg:py-20">
        <SectionLabel>Proof explorer</SectionLabel>
        <h1 class="mt-4 max-w-[760px] font-display text-[40px] leading-[1.02] text-highlighted sm:text-[56px]">
          Every round that has been submitted
        </h1>
        <p class="mt-5 max-w-[620px] text-[16px] leading-[1.65] text-toned">
          Each row is one verification against
          <span class="font-data text-[15px] text-highlighted">ReserveVerifier</span>,
          recorded in the registry. Failed rounds are kept and shown — a proving
          system that hides its failures is just a dashboard.
        </p>

        <dl class="mt-10 flex flex-wrap gap-x-10 gap-y-5">
          <div
            v-for="tally in tallies"
            :key="tally.label"
          >
            <dt class="text-[12px] uppercase tracking-[0.08em] text-muted">
              {{ tally.label }}
            </dt>
            <dd class="mt-1 font-display text-[30px] leading-none text-highlighted">
              {{ tally.value }}
            </dd>
          </div>
        </dl>
      </UContainer>
    </section>

    <UContainer class="py-12 lg:py-16">
      <!-- Filters. Two independent axes, both single-select with an "all" reset. -->
      <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div class="flex flex-wrap items-center gap-2">
          <span class="mr-1 text-[13px] text-muted">Asset</span>
          <button
            v-for="option in assetOptions"
            :key="option.value"
            type="button"
            class="rounded-full px-3.5 py-1.5 font-data text-[13px] ring-1 transition-colors"
            :class="assetFilter === option.value
              ? 'bg-ink-950 text-white ring-transparent'
              : 'bg-card text-toned ring-default hover:text-highlighted'"
            @click="assetFilter = option.value"
          >
            {{ option.label }}
          </button>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <span class="mr-1 text-[13px] text-muted">Result</span>
          <button
            v-for="option in statusOptions"
            :key="option.value"
            type="button"
            class="rounded-full px-3.5 py-1.5 text-[13px] ring-1 transition-colors"
            :class="statusFilter === option.value
              ? 'bg-ink-950 text-white ring-transparent'
              : 'bg-card text-toned ring-default hover:text-highlighted'"
            @click="statusFilter = option.value"
          >
            {{ option.label }}
          </button>
        </div>
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
              v-for="round in filtered"
              :key="round.id"
              class="transition-colors hover:bg-muted/60"
            >
              <td class="whitespace-nowrap px-4 py-4">
                <span class="font-data text-[13px] text-highlighted">{{ round.id }}</span>
              </td>

              <td class="whitespace-nowrap px-4 py-4">
                <NuxtLink
                  :to="`/asset/${round.assetId}`"
                  class="font-data text-[13px] font-medium text-highlighted underline decoration-ink-300 underline-offset-4 hover:decoration-ink-950"
                >
                  {{ symbolFor(round.assetId) }}
                </NuxtLink>
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

              <td class="whitespace-nowrap px-4 py-4 text-right">
                <span class="font-data text-[13px] text-toned">{{ formatQty(round.supplyAtProof) }}</span>
              </td>

              <td class="whitespace-nowrap px-4 py-4 text-right">
                <span
                  class="font-data text-[13px]"
                  :class="round.operatorsAgreed < round.operatorsTotal ? 'text-stale-700' : 'text-toned'"
                >{{ round.operatorsAgreed }}/{{ round.operatorsTotal }}</span>
              </td>

              <td class="whitespace-nowrap px-4 py-4 text-right">
                <span class="font-data text-[13px] text-toned">{{ formatQty(round.verifyGas) }}</span>
              </td>

              <td class="whitespace-nowrap px-4 py-4">
                <span
                  class="font-data text-[13px] text-muted"
                  :title="round.proofHash"
                >{{ truncateHash(round.proofHash) }}</span>
              </td>

              <td class="whitespace-nowrap px-4 py-4 text-right">
                <span class="text-[13px] text-muted">
                  <TimeAgo :minutes="round.minutesAgo" />
                </span>
              </td>
            </tr>

            <tr v-if="!filtered.length">
              <td
                :colspan="headings.length"
                class="px-4 py-16 text-center text-[14px] text-muted"
              >
                No rounds match this filter.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p class="mt-5 text-[13px] leading-[1.6] text-muted">
        Contracts are still under development — these rounds are representative
        fixtures shaped exactly like the registry's
        <span class="font-data">Attestation</span> struct, so the table swaps to
        live reads without changing.
      </p>
    </UContainer>
  </div>
</template>

<script setup lang="ts">
import {
  assets,
  formatBps,
  formatQty,
  proofRounds,
  statusMeta,
  truncateHash
} from '~/utils/assay'

useSeoMeta({
  title: 'Proof explorer — Assay Protocol',
  description: 'Every reserve proof round submitted to the Assay registry, including the rounds that failed.'
})

const assetFilter = ref('all')
const statusFilter = ref('all')

const assetOptions = [
  { label: 'All', value: 'all' },
  ...assets.map(a => ({ label: a.symbol, value: a.id }))
]

const statusOptions = [
  { label: 'All', value: 'all' },
  { label: 'Covered', value: 'covered' },
  { label: 'Stale', value: 'stale' },
  { label: 'Failed', value: 'failed' },
  { label: 'Challenged', value: 'challenged' }
]

const headings = [
  { label: 'Round', align: 'left' },
  { label: 'Asset', align: 'left' },
  { label: 'Result', align: 'left' },
  { label: 'Coverage', align: 'right' },
  { label: 'Supply at proof', align: 'right' },
  { label: 'Operators', align: 'right' },
  { label: 'Verify gas', align: 'right' },
  { label: 'Proof hash', align: 'left' },
  { label: 'Submitted', align: 'right' }
]

const filtered = computed(() => proofRounds.filter((round) => {
  const byAsset = assetFilter.value === 'all' || round.assetId === assetFilter.value
  const byStatus = statusFilter.value === 'all' || round.status === statusFilter.value
  return byAsset && byStatus
}))

const tallies = computed(() => [
  { label: 'Rounds submitted', value: String(proofRounds.length) },
  { label: 'Verified covered', value: String(proofRounds.filter(r => r.status === 'covered').length) },
  { label: 'Coverage failed', value: String(proofRounds.filter(r => r.status === 'failed').length) },
  { label: 'Under challenge', value: String(proofRounds.filter(r => r.status === 'challenged').length) }
])

function symbolFor(assetId: string): string {
  return assets.find(a => a.id === assetId)?.symbol ?? assetId
}
</script>
