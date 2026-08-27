<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 26 26"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M13 1.5 24.5 8v10L13 24.5 1.5 18V8Z"
      stroke="currentColor"
      stroke-width="1.2"
    />
    <path
      d="M7 10.5 13 20l6-9.5"
      stroke="currentColor"
      stroke-width="1.2"
    />
  </svg>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ size?: number }>(), { size: 26 })
</script>
