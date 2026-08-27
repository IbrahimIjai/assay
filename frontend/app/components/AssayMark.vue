<!--
  The mark is a hallmark punch — the stamp struck into a bar once it has been
  assayed. Outer ring plus a struck centre, nothing else. It has to survive at
  20px in the header, so there is no detail that only works large.
-->
<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    role="img"
    aria-label="Assay Protocol"
    class="shrink-0"
  >
    <rect
      x="1"
      y="1"
      width="22"
      height="22"
      rx="6.5"
      :stroke="color"
      stroke-width="1.75"
    />
    <path
      d="M12 6.4 17.6 12 12 17.6 6.4 12Z"
      :fill="color"
    />
  </svg>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  size?: number
  color?: string
}>(), {
  size: 22,
  color: 'currentColor'
})
</script>
