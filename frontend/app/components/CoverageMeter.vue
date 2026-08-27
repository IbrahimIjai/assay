<!--
  Coverage ratio against the only threshold that matters: 1.00.

  A bar drawn proportionally from zero would be useless here — every healthy
  asset sits within a percent or two of full coverage, so the whole signal would
  collapse into a rounding error at the right edge. This zooms the axis onto
  95%–105% so the buffer, and a shortfall, are both legible. The window is
  labelled so the zoom is stated rather than implied.
-->
<template>
  <div>
    <div class="flex items-baseline justify-between gap-4">
      <div class="text-[12px] font-medium uppercase tracking-[0.08em] text-muted">
        Coverage ratio
      </div>
      <div
        class="font-data text-[15px] font-medium"
        :class="statusMeta[status].text"
      >
        {{ clampedNote }}{{ formatRatio(ratio) }}
      </div>
    </div>

    <div class="relative mt-3 h-2.5 rounded-full bg-ink-200">
      <div
        class="absolute inset-y-0 left-0 rounded-full transition-[width] duration-700 ease-out"
        :class="barColor"
        :style="{ width: `${position * 100}%` }"
      />

      <!-- The 1.00 threshold. Everything left of this line is a failed round. -->
      <div class="absolute inset-y-[-5px] left-1/2 w-px -translate-x-1/2 bg-ink-950" />
    </div>

    <div class="mt-2 flex justify-between text-[11px] text-dimmed tabular">
      <span>95%</span>
      <span class="font-medium text-toned">100% &middot; supply</span>
      <span>105%</span>
    </div>

    <dl class="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-default pt-5">
      <div>
        <dt class="text-[12px] text-muted">
          Tokens outstanding
        </dt>
        <dd class="mt-1 font-data text-[15px] text-highlighted">
          {{ formatQty(supply) }} <span class="text-muted">{{ unit }}</span>
        </dd>
      </div>
      <div>
        <dt class="text-[12px] text-muted">
          Proven reserves
        </dt>
        <dd class="mt-1 font-data text-[15px] text-highlighted">
          {{ formatQty(reserves) }} <span class="text-muted">{{ unit }}</span>
        </dd>
      </div>
      <div class="col-span-2">
        <dt class="text-[12px] text-muted">
          {{ diff >= 0 ? 'Buffer above supply' : 'Shortfall against supply' }}
        </dt>
        <dd
          class="mt-1 font-data text-[15px]"
          :class="diff >= 0 ? 'text-covered-700' : 'text-failed-700'"
        >
          {{ diff >= 0 ? '+' : '−' }}{{ formatQty(Math.abs(diff)) }} <span class="text-muted">{{ unit }}</span>
        </dd>
      </div>
    </dl>
  </div>
</template>

<script setup lang="ts">
import { formatQty, formatRatio, statusMeta, type CoverageStatus } from '~/utils/assay'

const props = defineProps<{
  supply: number
  reserves: number
  unit: string
  status: CoverageStatus
}>()

const ratio = computed(() => props.reserves / props.supply)
const diff = computed(() => props.reserves - props.supply)

/** Map the 95%–105% window onto 0–1, clamping outliers to the ends. */
const position = computed(() => {
  const pct = ratio.value * 100
  return Math.min(1, Math.max(0, (pct - 95) / 10))
})

/** Flag when the true value sits outside the drawn window. */
const clampedNote = computed(() => {
  const pct = ratio.value * 100
  if (pct > 105) return '↗ '
  if (pct < 95) return '↘ '
  return ''
})

const barColor = computed(() => ({
  covered: 'bg-covered-500',
  stale: 'bg-stale-500',
  failed: 'bg-failed-500'
}[props.status]))
</script>
