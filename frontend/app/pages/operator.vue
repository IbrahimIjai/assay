<template>
  <div>
    <section class="relative overflow-hidden border-b border-default">
      <div class="grid-bg pointer-events-none absolute inset-0" />
      <UContainer class="relative py-14 lg:py-20">
        <SectionLabel>Operator network</SectionLabel>
        <h1 class="mt-4 max-w-[800px] font-display text-[40px] leading-[1.02] text-highlighted sm:text-[56px]">
          Evidence processing that can be challenged
        </h1>
        <p class="mt-5 max-w-[700px] text-[16px] leading-[1.65] text-toned">
          Operators independently extract, reconcile, and attest to evidence. Agreement
          is measurable; disputes are bonded and resolved on-chain.
        </p>
      </UContainer>
    </section>

    <UContainer class="py-12 lg:py-16">
      <div class="mb-6 rounded-panel bg-stale-50 p-4 text-[13px] text-stale-800 ring-1 ring-stale-200">
        Future network preview — operator metrics below are deterministic demo fixtures.
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

      <div class="mt-6 overflow-x-auto rounded-panel bg-card ring-1 ring-default">
        <table class="min-w-full">
          <thead>
            <tr class="border-b border-default">
              <th
                v-for="heading in headings"
                :key="heading"
                class="whitespace-nowrap bg-muted px-4 py-3 text-left text-[11px] font-medium uppercase tracking-[0.08em] text-muted"
              >
                {{ heading }}
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-default">
            <tr
              v-for="job in jobs"
              :key="job.id"
            >
              <td class="px-4 py-4 font-data text-[13px] text-highlighted">
                {{ job.id }}
              </td>
              <td class="px-4 py-4 font-data text-[13px] text-toned">
                {{ job.asset }}
              </td>
              <td class="px-4 py-4">
                <CoverageBadge
                  :status="job.status"
                  size="sm"
                />
              </td>
              <td class="px-4 py-4 font-data text-[13px] text-toned">
                {{ job.agreement }}
              </td>
              <td class="px-4 py-4 font-data text-[13px] text-toned">
                {{ job.operators }}
              </td>
              <td
                class="px-4 py-4 text-[13px]"
                :class="job.challenge === 'None' ? 'text-muted' : 'text-stale-700'"
              >
                {{ job.challenge }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="mt-6 grid gap-6 lg:grid-cols-2">
        <section class="rounded-panel bg-band p-6 text-white lg:p-7">
          <div class="text-[12px] uppercase tracking-[0.08em] text-white/40">
            Slashing boundary
          </div>
          <h2 class="mt-3 font-display text-[30px]">
            What an operator can be punished for
          </h2>
          <ul class="mt-6 space-y-3 text-[14px] leading-[1.6] text-white/70">
            <li>Signing an extraction that conflicts with the source evidence.</li>
            <li>Submitting inconsistent roots for the same verification round.</li>
            <li>Withholding after accepting a time-bound verification job.</li>
          </ul>
        </section>
        <section class="rounded-panel bg-card p-6 ring-1 ring-default lg:p-7">
          <div class="text-[12px] uppercase tracking-[0.08em] text-muted">
            Open challenge
          </div>
          <h2 class="mt-3 font-display text-[30px] text-highlighted">
            Round r-4816
          </h2>
          <p class="mt-4 text-[14px] leading-[1.65] text-toned">
            One of two operators disagreed on extracted notional. A bonded challenge is
            open; the disputed round remains visible and cannot silently disappear.
          </p>
          <div class="mt-5 font-data text-[13px] text-stale-700">
            Status: AWAITING RESOLUTION
          </div>
        </section>
      </div>
    </UContainer>
  </div>
</template>

<script setup lang="ts">
import type { CoverageStatus } from '~/utils/assay'

useSeoMeta({ title: 'Operator network — Assay Protocol' })

const metrics = [
  { label: 'Operator stake', value: '248k HSK', note: 'Bonded across 4 operators' },
  { label: 'Verification jobs', value: '4,822', note: 'Lifetime completed rounds' },
  { label: 'Agreement rate', value: '99.2%', note: 'Within configured tolerance' },
  { label: 'Failed rounds', value: '18', note: 'Visible and challengeable' }
]

const headings = ['Job', 'Asset', 'Result', 'Agreement', 'Operators', 'Challenge']
const jobs: { id: string, asset: string, status: CoverageStatus | 'challenged', agreement: string, operators: string, challenge: string }[] = [
  { id: 'r-4822', asset: 'SILVER-001', status: 'covered', agreement: '100%', operators: '3 / 3', challenge: 'None' },
  { id: 'r-4819', asset: 'PCN-A', status: 'failed', agreement: '100%', operators: '2 / 2', challenge: 'None' },
  { id: 'r-4816', asset: 'PCN-A', status: 'challenged', agreement: '50%', operators: '1 / 2', challenge: 'Bonded · open' }
]
</script>
