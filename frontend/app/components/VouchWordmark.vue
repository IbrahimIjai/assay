<template>
  <NuxtLink
    :to="to"
    class="flex items-center gap-3 text-highlighted rounded-md focus-visible:outline-3 focus-visible:outline-primary/25"
  >
    <VouchMark :size="mark" />
    <span
      class="font-display -tracking-[0.01em]"
      :style="{ fontSize: `${text}px` }"
    >Vouch</span>
  </NuxtLink>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  to?: string
  mark?: number
  text?: number
}>(), {
  to: '/',
  mark: 26,
  text: 22
})
</script>
