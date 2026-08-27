<template>
  <div>
    <UContainer class="pt-28 pb-28">
      <div class="flex items-baseline justify-between gap-6">
        <h1 class="font-display text-section">
          Issuer directory
        </h1>
        <span class="text-meta text-muted">12 domains verified by DNS record</span>
      </div>
      <p class="text-body text-toned mt-4 max-w-[620px]">
        Every institution that has verified a domain and anchored at least one batch.
        The domain is the primary key — there are no logos and no rankings.
      </p>

      <UTable
        :data="issuersAll"
        :columns="columns"
        class="mt-8"
      />
    </UContainer>
  </div>
</template>

<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'

useSeoMeta({ title: 'Issuer directory · Vouch' })

const columns: TableColumn<(typeof issuersAll)[number]>[] = [
  { accessorKey: 'domain', header: 'Domain', meta: { class: { td: 'text-highlighted' } } },
  { accessorKey: 'issued', header: 'Credentials issued' },
  { accessorKey: 'first', header: 'First issued' },
  { accessorKey: 'last', header: 'Last issued' }
]
</script>
