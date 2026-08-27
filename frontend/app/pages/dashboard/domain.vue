<template>
  <div class="max-w-[680px]">
    <h1 class="font-display text-section">
      Domain
    </h1>

    <div class="flex items-center gap-3 mt-6">
      <span class="text-card text-highlighted">{{ domainRecord.domain }}</span>
      <UBadge
        color="success"
        size="sm"
        label="Verified"
      />
    </div>
    <p class="text-meta text-muted mt-2">
      Verified {{ domainRecord.verifiedOn }}. Re-checked daily.
    </p>

    <UCard class="mt-8">
      <div class="text-card font-medium text-highlighted">
        TXT record
      </div>
      <p class="text-body text-toned mt-2 mb-4">
        Add this record at
        <span class="font-mono text-meta">{{ domainRecord.host }}</span>.
        Keep it in place — removing it unregisters the domain for new batches.
      </p>

      <div class="flex items-center gap-2">
        <div class="flex-1 font-mono text-meta text-highlighted bg-elevated rounded-md px-4 py-3">
          {{ domainRecord.value }}
        </div>
        <UButton
          label="Copy"
          color="neutral"
          variant="outline"
          size="sm"
          class="rounded-full shrink-0"
          @click="copy"
        />
        <span
          v-if="copied"
          class="text-meta text-muted"
        >Copied</span>
      </div>

      <div class="flex flex-wrap items-center gap-4 mt-6">
        <UButton
          label="Check now"
          color="neutral"
        />
        <span class="text-meta text-muted">Last checked {{ domainRecord.lastChecked }}</span>
      </div>
    </UCard>

    <!-- Failure state names the actual problem. -->
    <UCard class="mt-4">
      <div class="text-card font-medium text-highlighted">
        {{ domainRecord.second.label }}
      </div>
      <p class="text-body text-toned mt-2">
        No TXT record found at
        <span class="font-mono text-meta">{{ domainRecord.second.host }}</span>.
        Add the record above, then check again — DNS changes can take an hour to propagate.
      </p>
    </UCard>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })
useSeoMeta({ title: 'Domain · Vouch' })

const copied = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined

async function copy() {
  try {
    await navigator.clipboard.writeText(domainRecord.value)
  } catch {
    return
  }
  copied.value = true
  clearTimeout(timer)
  timer = setTimeout(() => (copied.value = false), 2000)
}

onBeforeUnmount(() => clearTimeout(timer))
</script>
