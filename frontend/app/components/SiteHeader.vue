<template>
  <header class="sticky top-0 z-50 border-b border-default bg-ground/85 backdrop-blur-md">
    <UContainer class="flex h-18 items-center justify-between gap-6">
      <NuxtLink
        to="/"
        class="flex items-center gap-2.5 text-highlighted"
      >
        <AssayMark :size="22" />
        <span class="font-display text-[19px] font-medium">Assay</span>
      </NuxtLink>

      <nav class="hidden items-center gap-8 md:flex">
        <NuxtLink
          v-for="link in links"
          :key="link.label"
          :to="link.to"
          class="text-[14px] font-medium text-toned transition-colors hover:text-highlighted"
        >
          {{ link.label }}
        </NuxtLink>
      </nav>

      <div class="flex items-center gap-2">
        <WalletButton />
        <UButton
          to="/proofs"
          label="Proof explorer"
          color="neutral"
          size="sm"
          class="hidden sm:inline-flex"
        />
        <UButton
          :icon="open ? 'i-lucide-x' : 'i-lucide-menu'"
          color="neutral"
          variant="ghost"
          size="sm"
          class="md:hidden"
          :aria-label="open ? 'Close menu' : 'Open menu'"
          @click="open = !open"
        />
      </div>
    </UContainer>

    <div
      v-if="open"
      class="border-t border-default bg-ground md:hidden"
    >
      <UContainer class="flex flex-col py-3">
        <NuxtLink
          v-for="link in links"
          :key="link.label"
          :to="link.to"
          class="py-2.5 text-[15px] font-medium text-toned"
          @click="open = false"
        >
          {{ link.label }}
        </NuxtLink>
        <NuxtLink
          to="/proofs"
          class="py-2.5 text-[15px] font-medium text-highlighted"
          @click="open = false"
        >
          Proof explorer
        </NuxtLink>
      </UContainer>
    </div>
  </header>
</template>

<script setup lang="ts">
const open = ref(false)

const links = [
  { label: 'Assets', to: '/#assets' },
  { label: 'Issue', to: '/issuer/proof' },
  { label: 'Borrow', to: '/borrow' },
  { label: 'Lend', to: '/lend' },
  { label: 'Operators', to: '/operator' }
]

// A hash link on the current route does not fire a navigation, so close here too.
const route = useRoute()
watch(() => route.fullPath, () => {
  open.value = false
})
</script>
