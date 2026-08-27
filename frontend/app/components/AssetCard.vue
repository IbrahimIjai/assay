<!--
  Card shape lifted from the inspiration's service cards — tag chips, a heading,
  body copy, an "explore" affordance pinned to the bottom edge. What changes is
  what sits at the top: coverage state, not an image, because that is the thing
  a reader is scanning the grid for.
-->
<template>
  <NuxtLink
    :to="`/asset/${asset.id.toLowerCase()}`"
    class="group flex flex-col rounded-panel bg-card p-6 ring-1 ring-default transition-shadow duration-200 hover:shadow-soft"
  >
    <div class="flex items-start justify-between gap-4">
      <div>
        <div class="font-data text-[13px] font-medium text-muted">
          {{ asset.symbol }}
        </div>
        <h3 class="mt-1 font-display text-[26px] leading-[1.12] text-highlighted">
          {{ asset.name }}
        </h3>
      </div>
      <CoverageBadge
        :status="asset.status"
        size="sm"
      />
    </div>

    <p class="mt-4 line-clamp-3 text-[14px] leading-[1.6] text-toned">
      {{ asset.blurb }}
    </p>

    <dl class="mt-6 grid grid-cols-3 gap-3 border-t border-default pt-5">
      <div>
        <dt class="text-[11px] uppercase tracking-[0.07em] text-dimmed">
          Coverage
        </dt>
        <dd
          class="mt-1 font-data text-[15px] font-medium"
          :class="statusMeta[asset.status].text"
        >
          {{ formatRatio(coverageRatio(asset)) }}
        </dd>
      </div>
      <div>
        <dt class="text-[11px] uppercase tracking-[0.07em] text-dimmed">
          Value
        </dt>
        <dd class="mt-1 font-data text-[15px] font-medium text-highlighted">
          {{ formatUsd(assetValueUsd(asset)) }}
        </dd>
      </div>
      <div>
        <dt class="text-[11px] uppercase tracking-[0.07em] text-dimmed">
          Custodians
        </dt>
        <dd class="mt-1 font-data text-[15px] font-medium text-highlighted">
          {{ asset.custodians }}
        </dd>
      </div>
    </dl>

    <div class="mt-5 flex items-center justify-between gap-4 text-[13px]">
      <span class="text-muted">
        Last proof <TimeAgo :minutes="asset.lastProofMinutesAgo" />
      </span>
      <span class="inline-flex items-center gap-1.5 font-medium text-highlighted">
        Inspect
        <UIcon
          name="i-lucide-arrow-right"
          class="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
        />
      </span>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import { assetValueUsd, coverageRatio, formatRatio, formatUsd, statusMeta, type Asset } from '~/utils/assay'

defineProps<{ asset: Asset }>()
</script>
