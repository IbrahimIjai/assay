<template>
  <footer class="bg-band text-white">
    <UContainer class="py-16 lg:py-20">
      <div class="grid gap-12 lg:grid-cols-[1.4fr_2fr]">
        <div>
          <div class="flex items-center gap-2.5">
            <AssayMark :size="22" />
            <span class="font-display text-[19px] font-medium">Assay</span>
          </div>
          <p class="mt-4 max-w-[340px] text-[14px] leading-[1.65] text-white/55">
            Verified reserves and private credit for tokenized real-world assets on
            HashKey Chain. <span class="text-white/75">Assay</span> — the test of a
            precious metal to determine its purity.
          </p>
        </div>

        <div class="grid gap-10 sm:grid-cols-3">
          <div
            v-for="column in columns"
            :key="column.title"
            class="space-y-4"
          >
            <div class="text-[12px] uppercase tracking-[0.09em] text-white/40">
              {{ column.title }}
            </div>
            <ul class="space-y-2.5">
              <li
                v-for="link in column.links"
                :key="link.label"
              >
                <NuxtLink
                  :to="link.to"
                  class="text-[14px] text-white/75 transition-colors hover:text-white"
                >
                  {{ link.label }}
                </NuxtLink>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div class="mt-14 flex flex-col gap-3 border-t border-white/10 pt-7 text-[13px] text-white/45 sm:flex-row sm:items-center sm:justify-between">
        <span>
          Assay proves consistency between custodian attestations and token supply.
          It does not prove physical truth.
        </span>
        <span class="font-data">HashKey Chain &middot; testnet</span>
      </div>
    </UContainer>
  </footer>
</template>

<script setup lang="ts">
const columns = [
  {
    title: 'Protocol',
    links: [
      { label: 'Tracked assets', to: '/#assets' },
      { label: 'Proof explorer', to: '/proofs' },
      { label: 'How it works', to: '/#how' },
      { label: 'Architecture', to: '/#architecture' }
    ]
  },
  {
    title: 'Build',
    links: [
      { label: 'Reserve registry', to: '/#architecture' },
      { label: 'Compliance module', to: '/#architecture' },
      { label: 'Shielded vault', to: '/#architecture' },
      { label: 'Run an operator', to: '/#architecture' }
    ]
  },
  {
    title: 'Honesty',
    links: [
      { label: 'Known limitations', to: '/#limits' },
      { label: 'Custodian trust', to: '/#limits' },
      { label: 'Trusted setup', to: '/#limits' },
      { label: 'Roadmap', to: '/#limits' }
    ]
  }
]
</script>
