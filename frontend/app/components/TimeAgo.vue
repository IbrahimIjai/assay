<!--
  Elapsed time that keeps counting while the page is open.

  The offset prop is static, so the first render is identical on server and
  client and hydration is clean; the ticking only starts after mount. That is
  the whole reason `utils/assay.ts` stores "minutes ago" rather than timestamps.
-->
<template>
  <span class="tabular">{{ label }}</span>
</template>

<script setup lang="ts">
import { formatElapsed, formatCountdown } from '~/utils/assay'

const props = withDefaults(defineProps<{
  /** Minutes since the event, at page load. */
  minutes: number
  /** Render as a countdown to staleness instead of elapsed time. */
  countdown?: boolean
}>(), {
  countdown: false
})

const drift = ref(0)
let timer: ReturnType<typeof setInterval> | undefined

const label = computed(() => {
  // A countdown burns down as time passes; elapsed time climbs.
  const value = props.countdown ? props.minutes - drift.value : props.minutes + drift.value
  return props.countdown ? formatCountdown(value) : formatElapsed(value)
})

onMounted(() => {
  timer = setInterval(() => {
    drift.value += 1
  }, 60_000)
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})
</script>
