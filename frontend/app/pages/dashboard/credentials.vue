<template>
  <div>
    <h1 class="font-display text-section">
      Credentials
    </h1>

    <UInput
      v-model="query"
      size="lg"
      icon="i-lucide-search"
      placeholder="Search by name, email, or reference"
      aria-label="Search credentials"
      :ui="{ root: 'mt-6 max-w-[420px] w-full', leadingIcon: 'size-4 text-muted' }"
    />

    <UTable
      :data="rows"
      :columns="columns"
      empty="No credential matches that search."
      class="mt-8"
    >
      <template #reference-cell="{ row }">
        <HashChip :value="row.original.reference" />
      </template>
      <template #claimed-cell="{ row }">
        <span :class="row.original.claimed === 'Not yet' && 'text-muted'">
          {{ row.original.claimed }}
        </span>
      </template>
    </UTable>
  </div>
</template>

<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'

definePageMeta({ layout: 'dashboard' })
useSeoMeta({ title: 'Credentials · Vouch' })

const query = ref('')

const rows = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return issuedCredentials
  return issuedCredentials.filter(row =>
    [row.holder, row.credential, row.batch, row.reference].some(v => v.toLowerCase().includes(q))
  )
})

const columns: TableColumn<(typeof issuedCredentials)[number]>[] = [
  { accessorKey: 'holder', header: 'Holder', meta: { class: { td: 'text-highlighted' } } },
  { accessorKey: 'credential', header: 'Credential' },
  { accessorKey: 'batch', header: 'Batch' },
  { accessorKey: 'reference', header: 'Reference' },
  { accessorKey: 'claimed', header: 'Claimed' }
]
</script>
