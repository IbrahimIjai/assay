<template>
  <footer class="bg-[#111111] text-white">
    <UContainer class="py-14 lg:py-18">
      <div class="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
        <div class="flex items-center gap-3">
          <span class="flex size-7 items-center justify-center rounded-[7px] border border-white/60 bg-white text-[11px] font-black text-[#111111]">A</span>
          <span class="font-display text-[18px] font-medium tracking-[-0.04em]">Assay Protocol</span>
        </div>

        <div class="grid gap-10 md:grid-cols-3 lg:grid-cols-4">
          <div v-for="column in columns" :key="column.title" class="space-y-4">
            <div class="text-[14px] text-white/60">{{ column.title }}</div>
            <ul class="space-y-2 text-[14px] text-white/85">
              <li v-for="link in column.links" :key="link.label">
                <NuxtLink :to="link.to" class="transition-colors hover:text-white">{{ link.label }}</NuxtLink>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div class="mt-10 border-t border-white/10 pt-6 text-[14px] text-white/60">
        Automated client systems for Nigerian service businesses.
      </div>
    </UContainer>
  </footer>
</template>

<script setup lang="ts">
const columns = [
  {
    title: 'Quick Links',
    links: [
      { label: 'Home', to: '/' },
      { label: 'Case Studies', to: '#work' },
      { label: 'Pricing', to: '#pricing' },
      { label: 'Book a Call', to: '#contact' }
    ]
  },
  {
    title: 'Support',
    links: [
      { label: 'Email', to: 'mailto:hello@assayprotocol.com' },
      { label: 'Response time', to: '#contact' },
      { label: 'Status', to: '#services' }
    ]
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy', to: '#privacy' },
      { label: 'Terms', to: '#terms' },
      { label: 'Nigeria', to: '#contact' }
    ]
  },
  {
    title: 'Company',
    links: [
      { label: 'Our process', to: '#services' },
      { label: 'Work', to: '#work' },
      { label: 'Contact', to: '#contact' }
    ]
  }
]
</script>
