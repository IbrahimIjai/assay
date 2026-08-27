<template>
  <div>
    <div class="flex items-baseline justify-between gap-6">
      <h1 class="font-display text-section">
        Batches
      </h1>
      <UButton
        to="/dashboard/issue"
        label="Issue a batch"
        color="neutral"
        class="shrink-0"
      />
    </div>

    <UTable
      :data="batches"
      :columns="columns"
      class="mt-8"
    >
      <template #tx-cell="{ row }">
        <NuxtLink
          v-if="row.original.tx !== '—'"
          to="#tx"
          class="font-mono text-meta text-highlighted underline underline-offset-[3px]"
        >
          {{ row.original.tx }}
        </NuxtLink>
        <span
          v-else
          class="text-muted"
        >—</span>
      </template>

      <template #status-cell="{ row }">
        <UBadge
          v-if="row.original.status === 'Anchored'"
          color="success"
          size="sm"
          label="Anchored"
        />
        <UBadge
          v-else
          color="neutral"
          variant="outline"
          size="sm"
          label="Unsigned"
          class="text-toned"
        />
      </template>
    </UTable>
  </div>
</template>

<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'

definePageMeta({ layout: 'dashboard' })
useSeoMeta({ title: 'Batches · Vouch' })

const columns: TableColumn<(typeof batches)[number]>[] = [
  { accessorKey: 'name', header: 'Batch', meta: { class: { td: 'text-highlighted' } } },
  { accessorKey: 'credentials', header: 'Credentials' },
  { accessorKey: 'issued', header: 'Issued' },
  { accessorKey: 'tx', header: 'Anchor transaction' },
  { accessorKey: 'status', header: 'Status' }
]
</script>
