<!-- The document preview itself, rendered inline on its --bg-inset mat. -->
<template>
  <div class="bg-elevated rounded-md p-8 flex justify-center">
    <div class="w-full max-w-[420px] aspect-[1/1.294] bg-default border border-default p-8 flex flex-col items-center justify-center text-center gap-3">
      <div class="text-meta text-muted">
        {{ issuerName }}
      </div>
      <div class="font-display text-card">
        {{ holder }}
      </div>
      <div class="text-meta text-toned max-w-[240px] tracking-normal">
        {{ body }}
      </div>
      <div class="w-12 border-t border-default mt-3" />
      <div class="text-meta text-muted">
        {{ date }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  issuerName: string
  holder: string
  body: string
  date: string
}>()
</script>
