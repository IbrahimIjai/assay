<!--
  One step visible at a time, progress shown as pills rather than a progress
  bar. Errors are inline and specific; the cost is stated in plain terms.
-->
<template>
  <div class="max-w-[860px]">
    <div class="flex items-baseline justify-between gap-6">
      <h1 class="font-display text-section">
        Issue a batch
      </h1>
      <UButton
        to="/dashboard"
        label="Cancel"
        color="neutral"
        variant="link"
      />
    </div>

    <nav
      v-if="step < 5"
      class="flex flex-wrap gap-1 mt-8"
    >
      <UButton
        v-for="s in steps"
        :key="s.n"
        :label="`${s.n} · ${s.label}`"
        color="neutral"
        :variant="step === s.n ? 'solid' : 'outline'"
        size="sm"
        class="rounded-full"
        @click="step = s.n"
      />
    </nav>

    <!-- 1 · Upload -->
    <div
      v-if="step === 1"
      class="mt-8"
    >
      <UCard :ui="{ body: 'p-8' }">
        <div class="flex flex-wrap items-center justify-between gap-6">
          <div>
            <div class="text-card font-medium text-highlighted">
              {{ uploadedFile.name }}
            </div>
            <div class="text-meta text-muted mt-1">
              {{ uploadedFile.detail }}
            </div>
          </div>
          <UButton
            label="Replace file"
            color="neutral"
            variant="outline"
            size="sm"
            class="rounded-full shrink-0"
          />
        </div>
      </UCard>

      <UTable
        :data="csvRows"
        :columns="csvColumns"
        class="mt-6"
      >
        <template #validation-cell="{ row }">
          <span :class="row.original.error && 'text-warning'">
            {{ row.original.validation }}
          </span>
        </template>
      </UTable>

      <div class="flex flex-wrap items-center gap-4 mt-8">
        <UButton
          label="Continue"
          color="neutral"
          @click="step = 2"
        />
        <span class="text-meta text-muted">Rows with errors are skipped unless you fix them.</span>
      </div>
    </div>

    <!-- 2 · Map columns -->
    <div
      v-else-if="step === 2"
      class="mt-8"
    >
      <p class="text-body text-toned max-w-[620px]">
        Match the columns in your file to credential fields. This mapping is saved for the
        next batch from this domain.
      </p>

      <div class="border border-default rounded-card mt-6 divide-y divide-default">
        <div
          v-for="mapping in columnMappings"
          :key="mapping.column"
          class="grid gap-6 md:grid-cols-2 items-center p-6"
        >
          <div>
            <div class="text-meta text-muted">
              CSV column
            </div>
            <div class="font-mono text-meta text-highlighted mt-1">
              {{ mapping.column }}
            </div>
          </div>
          <div>
            <div class="text-meta text-muted">
              Credential field
            </div>
            <USelect
              v-model="mappings[mapping.column]"
              :items="mapping.options"
              size="lg"
              :aria-label="`Credential field for ${mapping.column}`"
              class="w-full mt-1"
            />
          </div>
        </div>
      </div>

      <div class="flex items-center gap-4 mt-8">
        <UButton
          label="Continue"
          color="neutral"
          @click="step = 3"
        />
        <UButton
          label="Back"
          color="neutral"
          variant="link"
          @click="step = 1"
        />
      </div>
    </div>

    <!-- 3 · Visibility -->
    <div
      v-else-if="step === 3"
      class="mt-8"
    >
      <p class="text-body text-toned max-w-[620px]">
        Visibility cannot be changed after the batch is signed.
      </p>

      <div class="grid gap-4 md:grid-cols-2 mt-6">
        <button
          v-for="option in visibilityOptions"
          :key="option.value"
          type="button"
          class="text-left bg-transparent rounded-card border p-6 transition-colors duration-[160ms] ease-out focus-visible:outline-3 focus-visible:outline-primary/25"
          :class="visibility === option.value ? 'border-inverted' : 'border-default hover:border-accented'"
          :aria-pressed="visibility === option.value"
          @click="visibility = option.value"
        >
          <div class="text-card font-medium text-highlighted">
            {{ option.label }}
          </div>
          <p class="text-body text-toned mt-2">
            {{ option.description }}
          </p>
        </button>
      </div>

      <div class="flex items-center gap-4 mt-8">
        <UButton
          label="Continue"
          color="neutral"
          @click="step = 4"
        />
        <UButton
          label="Back"
          color="neutral"
          variant="link"
          @click="step = 2"
        />
      </div>
    </div>

    <!-- 4 · Review and sign -->
    <div
      v-else-if="step === 4"
      class="mt-8 max-w-[680px]"
    >
      <UCard :ui="{ body: 'p-8' }">
        <div class="font-display text-section">
          {{ batchReview.headline }}
        </div>
        <p class="text-body text-toned mt-3">
          {{ batchReview.detail }}
        </p>
        <dl class="border-t border-default mt-6 pt-6 grid grid-cols-[180px_1fr] gap-x-6 gap-y-3 text-body text-highlighted">
          <template
            v-for="[label, value] in batchReview.rows"
            :key="label"
          >
            <dt class="text-meta text-muted">
              {{ label }}
            </dt>
            <dd :class="label === 'Signing key' && 'font-mono text-meta'">
              {{ label === 'Visibility' ? visibilityLabel : value }}
            </dd>
          </template>
        </dl>
      </UCard>

      <div class="flex items-center gap-4 mt-8">
        <UButton
          label="Sign and publish"
          color="neutral"
          @click="step = 5"
        />
        <UButton
          label="Back"
          color="neutral"
          variant="link"
          @click="step = 3"
        />
      </div>
    </div>

    <!-- Receipt -->
    <div
      v-else
      class="mt-8 max-w-[680px]"
    >
      <h2 class="font-display text-section">
        Batch published.
      </h2>
      <p class="text-body text-toned mt-4">
        {{ publishedBatch.count }} credentials anchored in transaction
        <NuxtLink
          to="#tx"
          class="font-mono text-meta text-highlighted underline underline-offset-[3px]"
        >{{ publishedBatch.tx }}</NuxtLink>. Claim links are ready to send.
      </p>

      <UCard class="mt-8">
        <div class="grid gap-4">
          <div class="flex items-center gap-2">
            <div class="flex-1 font-mono text-meta text-highlighted bg-elevated rounded-md px-4 py-3 break-all">
              {{ publishedBatch.link }}
            </div>
            <UButton
              label="Copy"
              color="neutral"
              variant="outline"
              size="sm"
              class="rounded-full shrink-0"
              @click="copyLink"
            />
            <span
              v-if="copied"
              class="text-meta text-muted"
            >Copied</span>
          </div>
          <div class="flex flex-wrap items-center gap-3">
            <UButton
              label="Send claim links by email"
              color="neutral"
            />
            <UButton
              to="#csv"
              label="Download claim links (CSV)"
              color="neutral"
              variant="outline"
              size="sm"
              class="rounded-full"
            />
            <UButton
              to="/dashboard"
              label="Back to batches"
              color="neutral"
              variant="link"
            />
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'

definePageMeta({ layout: 'dashboard' })
useSeoMeta({ title: 'Issue a batch · Vouch' })

const steps = [
  { n: 1, label: 'Upload' },
  { n: 2, label: 'Map columns' },
  { n: 3, label: 'Visibility' },
  { n: 4, label: 'Review and sign' }
]

const step = ref(1)
const visibility = ref('public')
const visibilityLabel = computed(() =>
  visibilityOptions.find(o => o.value === visibility.value)?.label ?? 'Public'
)

/* The mapping is remembered for the next batch from this domain. */
const mappings = reactive<Record<string, string>>(
  Object.fromEntries(columnMappings.map(m => [m.column, m.options[0]!]))
)

const csvColumns: TableColumn<(typeof csvRows)[number]>[] = [
  { accessorKey: 'row', header: 'Row', meta: { class: { td: 'font-mono text-meta text-muted' } } },
  { accessorKey: 'recipient', header: 'Recipient', meta: { class: { td: 'text-highlighted' } } },
  { accessorKey: 'email', header: 'Email' },
  { accessorKey: 'award', header: 'Award' },
  { accessorKey: 'validation', header: 'Validation' }
]

const copied = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined

async function copyLink() {
  try {
    await navigator.clipboard.writeText(publishedBatch.link)
  } catch {
    return
  }
  copied.value = true
  clearTimeout(timer)
  timer = setTimeout(() => (copied.value = false), 2000)
}

onBeforeUnmount(() => clearTimeout(timer))
</script>
