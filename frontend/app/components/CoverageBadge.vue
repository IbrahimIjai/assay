<!--
  The single most important element in the product. Wherever an asset appears,
  this says whether its backing is currently proven. Three states, one shape,
  no other component in the app is allowed to use these colours.
-->
<template>
  <span
    :class="[
      'inline-flex items-center gap-2 rounded-full ring-1 font-medium whitespace-nowrap',
      meta.tint,
      meta.text,
      size === 'sm' ? 'px-2.5 py-1 text-[12px]' : 'px-3.5 py-1.5 text-[13px]'
    ]"
  >
    <span
      :class="[
        'rounded-full',
        meta.dot,
        size === 'sm' ? 'size-1.5' : 'size-2',
        pulse && status === 'covered' ? 'animate-pulse' : ''
      ]"
    />
    {{ meta.label }}
  </span>
</template>

<script setup lang="ts">
import { statusMeta, type CoverageStatus } from '~/utils/assay'

const props = withDefaults(defineProps<{
  status: CoverageStatus | 'challenged'
  size?: 'sm' | 'md'
  pulse?: boolean
}>(), {
  size: 'md',
  pulse: false
})

const meta = computed(() => statusMeta[props.status])
</script>
