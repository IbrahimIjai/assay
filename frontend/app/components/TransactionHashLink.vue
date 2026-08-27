<template>
  <a
    :href="explorerTx(hash)"
    target="_blank"
    rel="noopener noreferrer"
    class="mt-4 block rounded-[10px] bg-ground/80 p-3 ring-1 ring-default transition-colors hover:bg-ground"
    :aria-label="`View transaction ${hash} on the HashKey Chain explorer`"
  >
    <span class="flex items-center justify-between gap-3 text-[12px] font-medium text-toned">
      View on HashKey explorer
      <UIcon
        name="i-lucide-arrow-up-right"
        class="size-3.5 shrink-0"
      />
    </span>
    <span class="mt-2 block break-all font-data text-[12px] leading-[1.6] text-highlighted">
      {{ hash }}
    </span>
  </a>
</template>

<script setup lang="ts">
import { explorerTx } from '~/utils/contracts'

defineProps<{
  hash: `0x${string}`
}>()
</script>
