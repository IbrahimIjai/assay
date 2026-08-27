<!--
  The simplest screen in the product. Assume the person has never used a crypto
  product and never will: the credential renders immediately, no wallet, no
  signup, and the optional parts look optional.
-->
<template>
  <div class="min-h-screen bg-default">
    <SiteHeader>
      <template #right>
        <UColorModeButton :ui="{ base: 'rounded-full p-2', leadingIcon: 'size-[18px]' }" />
      </template>
    </SiteHeader>

    <div class="max-w-[680px] mx-auto px-6 pt-18 pb-28">
      <h1 class="font-display text-section">
        {{ firstName }} — your degree certificate from {{ credential.issuer }}.
      </h1>
      <p class="text-body text-toned mt-4">
        It is already yours. Nothing to sign up for, nothing to install.
      </p>

      <div class="border border-default rounded-card overflow-hidden mt-8">
        <div class="h-1 gradient-strip" />
        <div class="p-8">
          <CredentialDocument
            :issuer-name="credential.issuerName"
            :holder="credential.holder"
            :body="credential.document.body"
            :date="credential.dateIssued"
          />
          <dl class="grid grid-cols-[140px_1fr] gap-x-6 gap-y-3 mt-6 text-body text-highlighted">
            <dt class="text-meta text-muted pt-[3px]">
              Issued by
            </dt>
            <dd>{{ credential.issuer }}</dd>
            <dt class="text-meta text-muted pt-[3px]">
              Date issued
            </dt>
            <dd>{{ credential.dateIssued }}</dd>
          </dl>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-4 mt-8">
        <UButton
          label="Copy your verification link"
          color="neutral"
          @click="copyLink"
        />
        <UButton
          to="#download"
          label="Download the PDF"
          color="neutral"
          variant="outline"
          size="sm"
          class="rounded-full"
        />
        <span
          v-if="copied"
          class="text-meta text-muted"
        >Copied</span>
      </div>
      <p class="text-meta text-muted mt-3">
        Anyone you send the link to can check it without an account.
      </p>

      <div class="border-t border-default mt-18 pt-6 max-w-[540px]">
        <p class="text-meta text-muted">
          Optionally, connect a wallet to control this credential yourself. You do not
          need one to keep or share the certificate.
        </p>
        <NuxtLink
          to="#wallet"
          class="inline-block mt-3 text-meta text-toned underline underline-offset-[3px] hover:text-highlighted transition-colors duration-[160ms] ease-out"
        >
          Connect a wallet
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const route = useRoute()
const id = route.params.id as string

const credential = credentials[id] ?? credentials['4f2a91d029c1b']!
const firstName = computed(() => credential.holder.split(' ')[0])

const verificationLink = `https://vouch.id/v/${credential.id}`
const copied = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined

async function copyLink() {
  try {
    await navigator.clipboard.writeText(verificationLink)
  } catch {
    return
  }
  copied.value = true
  clearTimeout(timer)
  timer = setTimeout(() => (copied.value = false), 2000)
}

onBeforeUnmount(() => clearTimeout(timer))

useSeoMeta({ title: `Your credential from ${credential.issuer} · Vouch` })
</script>
