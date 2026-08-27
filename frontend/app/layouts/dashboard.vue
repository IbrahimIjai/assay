<template>
  <div class="min-h-screen bg-default lg:grid lg:grid-cols-[260px_1fr]">
    <aside class="bg-muted border-b lg:border-b-0 lg:border-r border-default px-4 py-8">
      <div class="px-2 pb-8">
        <VouchWordmark
          :mark="22"
          :text="19"
        />
      </div>
      <div class="text-meta text-muted px-2 pb-3">
        {{ issuerDomain }}
      </div>

      <nav class="flex flex-col gap-0.5">
        <UButton
          v-for="item in nav"
          :key="item.to"
          :to="item.to"
          :label="item.label"
          color="neutral"
          variant="ghost"
          :active="isActive(item.to)"
          active-color="neutral"
          active-variant="soft"
          active-class="text-highlighted"
          :ui="{ base: 'justify-start rounded-md px-2 py-2.5 text-[14px] font-medium' }"
        />
      </nav>

      <div class="mt-8 px-2">
        <UColorModeButton :ui="{ base: 'rounded-full p-2', leadingIcon: 'size-[18px]' }" />
      </div>
    </aside>

    <main class="p-6 lg:p-12 max-w-(--ui-container)">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()

const nav = [
  { label: 'Batches', to: '/dashboard' },
  { label: 'Credentials', to: '/dashboard/credentials' },
  { label: 'Revocations', to: '/dashboard/revocations' },
  { label: 'Domain', to: '/dashboard/domain' },
  { label: 'Keys', to: '/dashboard/keys' }
]

/* "Issue a batch" lives under Batches, so it keeps that item lit. */
function isActive(to: string) {
  if (to === '/dashboard') {
    return route.path === '/dashboard' || route.path === '/dashboard/issue'
  }
  return route.path.startsWith(to)
}
</script>
