<template>
  <div class="min-h-screen bg-default">
    <SiteHeader>
      <template #right>
        <span class="hidden sm:inline text-meta text-muted">Result state</span>
        <div class="flex gap-1 border border-default rounded-full p-1">
          <UButton
            v-for="(to, name) in stateRoutes"
            :key="name"
            :to="to"
            :label="stateLabels[name]"
            color="neutral"
            :variant="state === name ? 'solid' : 'ghost'"
            size="xs"
            class="rounded-full"
          />
        </div>
      </template>
    </SiteHeader>

    <div class="max-w-[680px] mx-auto px-6 pt-18 pb-28">
      <template v-if="credential">
        <!-- Revocation is information, not an error: it is stated plainly and
             the full document stays on the page. -->
        <p
          v-if="credential.state === 'revoked'"
          class="text-body text-highlighted mb-6"
        >
          This credential was revoked by {{ credential.issuer }} on {{ credential.revokedOn }}.
        </p>

        <!-- A yellow flag, not a failure. -->
        <p
          v-else-if="credential.state === 'unknown'"
          class="text-body text-highlighted mb-6"
        >
          This document hasn't been altered since it was signed, but the signer
          <HashChip
            :value="credential.signer!"
            :copyable="false"
          />
          hasn't verified a domain. Treat it as unverified.
        </p>

        <div class="border border-default rounded-card overflow-hidden">
          <!-- The one moment of color in the entire product UI. -->
          <div
            class="h-1"
            :class="stripClass"
          />

          <div class="p-8">
            <div class="flex items-start justify-between gap-6">
              <h1 class="font-display text-section">
                {{ credential.title }}
              </h1>
              <UBadge
                :color="badgeColor"
                :label="stateLabels[credential.state]"
                class="shrink-0 whitespace-nowrap"
              />
            </div>

            <dl class="grid grid-cols-[140px_1fr] gap-x-6 gap-y-3 mt-6 text-body text-highlighted">
              <dt class="text-meta text-muted pt-[3px]">
                Holder
              </dt>
              <dd>{{ credential.holder }}</dd>
              <dt class="text-meta text-muted pt-[3px]">
                Issued by
              </dt>
              <dd class="text-card">
                {{ credential.issuer }}
              </dd>
              <dt class="text-meta text-muted pt-[3px]">
                Date issued
              </dt>
              <dd>{{ credential.dateIssued }}</dd>
            </dl>

            <dl class="border-t border-default mt-8 pt-6 grid grid-cols-[140px_1fr] gap-x-6 gap-y-3 items-center">
              <dt class="text-meta text-muted">
                Swarm reference
              </dt>
              <dd>
                <HashChip
                  :value="credential.swarmRef"
                  :copy="credential.id"
                />
              </dd>
              <dt class="text-meta text-muted">
                Merkle root
              </dt>
              <dd>
                <HashChip
                  :value="credential.merkleRoot"
                  :copyable="false"
                />
              </dd>
              <dt class="text-meta text-muted">
                Anchor transaction
              </dt>
              <dd>
                <NuxtLink
                  to="#tx"
                  class="font-mono text-meta text-highlighted underline underline-offset-[3px]"
                >
                  {{ credential.anchorTx }}
                </NuxtLink>
              </dd>
              <dt class="text-meta text-muted">
                Batch size
              </dt>
              <dd class="font-mono text-meta text-highlighted">
                {{ credential.batchSize }}
              </dd>
            </dl>

            <CredentialDocument
              class="mt-8"
              :issuer-name="credential.issuerName"
              :holder="credential.holder"
              :body="credential.document.body"
              :date="credential.dateIssued"
            />

            <div class="flex items-center justify-between gap-4 mt-4">
              <span class="font-mono text-meta text-muted">
                {{ credential.document.filename }} · {{ credential.document.pages }} page ·
                {{ credential.document.size }}
              </span>
              <UButton
                to="#download"
                label="Download original"
                color="neutral"
                variant="outline"
                size="sm"
                class="rounded-full shrink-0"
              />
            </div>
          </div>
        </div>
      </template>

      <!-- Errors state what happened and what to do, and never apologize. -->
      <div
        v-else
        class="py-18"
      >
        <h1 class="font-display text-section">
          No credential at that link.
        </h1>
        <p class="text-body text-toned mt-4">
          Check for a truncated URL — credential links are long.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const route = useRoute()

const credential = computed(() => credentials[route.params.id as string])
const state = computed<VerificationState>(() => credential.value?.state ?? 'notfound')

/* The empty state is the design's, but the status code should still say what
   happened, so a link checker or a crawler sees it too. */
const event = useRequestEvent()
if (!credential.value && event) {
  setResponseStatus(event, 404)
}

const stripClass = computed(() => ({
  verified: 'gradient-strip',
  revoked: 'bg-error',
  unknown: 'bg-warning',
  notfound: ''
}[state.value]))

const badgeColor = computed(() => ({
  verified: 'success',
  revoked: 'error',
  unknown: 'warning',
  notfound: 'neutral'
}[state.value] as 'success' | 'error' | 'warning' | 'neutral'))

useSeoMeta({
  title: credential.value
    ? `${credential.value.title} — ${stateLabels[state.value]} · Vouch`
    : 'No credential at that link · Vouch'
})
</script>
