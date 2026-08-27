<template>
  <div>
    <h1 class="font-display text-section">
      Revocations
    </h1>
    <p class="text-body text-toned mt-4 max-w-[620px]">
      A revoked credential still resolves and still shows its document. Verifiers see the
      revocation and the date it was recorded.
    </p>

    <UTable
      :data="revocations"
      :columns="columns"
      class="mt-8"
    />
  </div>
</template>

<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'

definePageMeta({ layout: 'dashboard' })
useSeoMeta({ title: 'Revocations · Vouch' })

const columns: TableColumn<(typeof revocations)[number]>[] = [
  { accessorKey: 'holder', header: 'Holder', meta: { class: { td: 'text-highlighted' } } },
  { accessorKey: 'credential', header: 'Credential' },
  { accessorKey: 'revoked', header: 'Revoked' },
  { accessorKey: 'by', header: 'Recorded by' },
  { accessorKey: 'reason', header: 'Reason given' }
]
</script>
