<template>
  <div class="max-w-[680px]">
    <h1 class="font-display text-section">
      Keys
    </h1>
    <p class="text-body text-toned mt-4">
      Rotating a key never invalidates credentials you have already issued. Past batches
      stay verifiable against the key that signed them.
    </p>

    <UCard class="mt-8">
      <div class="flex items-center justify-between gap-6">
        <div>
          <div class="text-meta text-muted">
            Current signing key
          </div>
          <div class="font-mono text-meta text-highlighted mt-2 break-all">
            {{ currentKey }}
          </div>
        </div>
        <UButton
          label="Rotate key"
          color="neutral"
          variant="outline"
          size="sm"
          class="rounded-full shrink-0 whitespace-nowrap"
        />
      </div>
    </UCard>

    <UTable
      :data="signingKeys"
      :columns="columns"
      class="mt-8"
    >
      <template #retired-cell="{ row }">
        <span :class="row.original.retired === 'In use' && 'text-muted'">
          {{ row.original.retired }}
        </span>
      </template>
    </UTable>
  </div>
</template>

<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'

definePageMeta({ layout: 'dashboard' })
useSeoMeta({ title: 'Keys · Vouch' })

const columns: TableColumn<(typeof signingKeys)[number]>[] = [
  { accessorKey: 'key', header: 'Key', meta: { class: { td: 'font-mono text-meta text-highlighted' } } },
  { accessorKey: 'from', header: 'In use from' },
  { accessorKey: 'retired', header: 'Retired' },
  { accessorKey: 'batches', header: 'Batches signed' }
]
</script>
