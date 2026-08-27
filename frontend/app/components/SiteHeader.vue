<template>
  <div class="border-b border-[color:var(--color-border-soft)] bg-[var(--color-ivory)]/90 backdrop-blur-sm">
    <UContainer class="h-[90px] flex items-center justify-between gap-6">
      <NuxtLink to="/" class="flex items-center gap-3 text-[var(--color-ink)]">
        <span class="flex size-6 items-center justify-center rounded-[6px] border border-[var(--color-ink)] bg-[var(--color-ink)] text-[10px] font-bold text-white shadow-[0_2px_0_0_rgba(17,24,39,0.15)]">A</span>
        <span class="font-display text-[18px] font-medium tracking-[-0.04em]">Assay Protocol</span>
      </NuxtLink>

      <div class="hidden items-center gap-8 md:flex">
        <a href="#services" class="text-[14px] font-medium text-[var(--color-ink)]/75 transition-colors hover:text-[var(--color-ink)]">Our Services</a>
        <a href="#work" class="text-[14px] font-medium text-[var(--color-ink)]/75 transition-colors hover:text-[var(--color-ink)]">Work</a>
        <a href="#pricing" class="text-[14px] font-medium text-[var(--color-ink)]/75 transition-colors hover:text-[var(--color-ink)]">Pricing</a>
        <a href="#blog" class="text-[14px] font-medium text-[var(--color-ink)]/75 transition-colors hover:text-[var(--color-ink)]">Blog</a>
      </div>

      <div class="flex items-center gap-3">
        <UButton
          label="Book strategy call"
          color="primary"
          class="hidden sm:inline-flex rounded-[10px] px-5 py-2.5 text-[14px] font-bold shadow-[0_3px_0_0_rgba(17,24,39,0.08)]"
        />
      </div>
    </UContainer>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ banded?: boolean }>(), { banded: false })
</script>
