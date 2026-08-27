<template>
  <div class="bg-[var(--color-ivory)] text-[var(--color-ink)]">
    <section class="relative overflow-hidden border-b border-[var(--color-border-soft)]">
      <div class="grid-bg absolute inset-0 opacity-90" />

      <UContainer class="relative py-8 sm:py-10">
        <div class="flex items-center justify-center">
          <div class="flex items-center gap-8 text-[14px] font-medium text-[var(--color-ink)]/70">
            <span class="inline-flex items-center gap-2 rounded-[8px] bg-[var(--color-brand-soft)] px-3 py-1.5 text-[12px] font-semibold text-[var(--color-ink)]">
              <span class="size-2 rounded-sm bg-[var(--color-brand)]" />
              Service Blocks
            </span>
            <a href="#services" class="hover:text-[var(--color-ink)]">Our Services</a>
            <a href="#work" class="hover:text-[var(--color-ink)]">Work</a>
            <a href="#pricing" class="hover:text-[var(--color-ink)]">Pricing</a>
            <a href="#blog" class="hover:text-[var(--color-ink)]">Blog</a>
          </div>
          <div class="ml-auto hidden sm:block">
            <UButton label="Book strategy call" class="rounded-[10px] bg-[var(--color-brand)] text-white shadow-[0_4px_0_0_rgba(17,17,17,0.08)] hover:bg-[var(--color-brand-deep)]" />
          </div>
        </div>

        <div class="relative mt-12 pb-8 text-center sm:mt-16">
          <div class="absolute left-0 top-12 hidden xl:block">
            <span class="inline-flex items-center gap-2 rounded-[10px] bg-[var(--color-blue)] px-3 py-2 text-[13px] font-semibold text-white shadow-soft">Mobile App Development</span>
            <span class="mt-3 block h-0 w-0 border-l-[8px] border-r-[8px] border-b-[12px] border-l-transparent border-r-transparent border-b-[var(--color-blue)]" />
          </div>

          <div class="absolute right-0 top-12 hidden xl:block">
            <span class="inline-flex items-center gap-2 rounded-[10px] bg-[var(--color-cyan)] px-3 py-2 text-[13px] font-semibold text-white shadow-soft">Website Design &amp; Development</span>
            <span class="mt-3 block h-0 w-0 border-l-[8px] border-r-[8px] border-b-[12px] border-l-transparent border-r-transparent border-b-[var(--color-cyan)]" />
          </div>

          <h1 class="mx-auto max-w-[980px] font-display text-[44px] leading-[0.98] tracking-[-0.06em] text-[var(--color-ink)] sm:text-[64px] lg:text-[86px] xl:text-[100px]">
            Proof of reserve.<br>
            <span class="text-[var(--color-brand)]">Private credit.</span><br>
            Composable RWA infrastructure.
          </h1>

          <p class="mx-auto mt-7 max-w-[700px] text-[18px] text-[var(--color-ink-soft)]">
            Assay turns custodial attestations into cryptographic proof that tokenized real-world assets stay backed — then makes that proof usable for compliant private lending.
          </p>

          <div class="mt-8 flex items-center justify-center gap-4">
            <UButton label="Book a strategy call" class="rounded-[14px] bg-[var(--color-brand)] px-7 py-3 text-base font-semibold text-white shadow-[0_4px_0_0_rgba(17,17,17,0.08)] hover:bg-[var(--color-brand-deep)]" />
          </div>

          <div class="mt-10 flex items-center justify-center gap-3 text-[12px] text-[var(--color-ink-soft)]">
            <span class="rounded-[8px] bg-[var(--color-yellow)] px-2 py-1 font-semibold text-[var(--color-ink)]">AI Agents &amp; Automation</span>
            <span class="rounded-[8px] bg-[var(--color-cyan)] px-2 py-1 font-semibold text-white">Tokenized RWA</span>
            <span class="rounded-[8px] bg-[var(--color-brand-soft)] px-2 py-1 font-semibold text-[var(--color-ink)]">Compliance-by-proof</span>
          </div>
        </div>
      </UContainer>
    </section>

    <section class="bg-[var(--color-brand)] text-white">
      <UContainer class="py-12 md:py-20">
        <div class="grid items-center gap-8 md:grid-cols-4">
          <div v-for="stat in stats" :key="stat.label" class="flex items-center gap-5 border-r border-white/15 last:border-r-0">
            <div class="text-[52px] font-display leading-none tracking-[-0.05em]">{{ stat.value }}</div>
            <div class="text-[14px] text-white/85">{{ stat.label }}</div>
          </div>
        </div>
      </UContainer>
    </section>

    <section id="work" class="bg-[var(--color-ivory-strong)] py-16 md:py-20">
      <UContainer>
        <h2 class="font-display text-[44px] leading-none tracking-[-0.05em] text-[var(--color-ink)] md:text-[64px]">
          Proof-first infrastructure for real-world assets
        </h2>

        <div class="mt-10 grid gap-5 lg:grid-cols-3">
          <article v-for="caseStudy in caseStudies" :key="caseStudy.title" class="rounded-[24px] border border-[var(--color-border-soft)] bg-white p-5 shadow-soft">
            <div class="mb-5 inline-flex rounded-full bg-[var(--color-brand-soft)] px-3 py-1 text-[12px] font-semibold text-[var(--color-ink)]">{{ caseStudy.tag }}</div>
            <h3 class="font-display text-[32px] leading-[1.08] tracking-[-0.05em] text-[var(--color-ink)]">{{ caseStudy.title }}</h3>
            <p class="mt-4 text-[15px] text-[var(--color-ink-soft)]">{{ caseStudy.body }}</p>
          </article>
        </div>
      </UContainer>
    </section>

    <section id="services" class="py-16 md:py-20">
      <UContainer>
        <h2 class="text-center font-display text-[44px] leading-none tracking-[-0.05em] text-[var(--color-ink)] md:text-[64px]">
          Where first-time founders get started right
        </h2>
        <p class="mx-auto mt-4 max-w-[860px] text-center text-[18px] text-[var(--color-ink-soft)]">
          We design, build, and ship systems that make private RWA compliance, reserve proof, and stablecoin borrowing intelligible to the market.
        </p>

        <div class="mt-12 grid gap-8 md:grid-cols-3">
          <div v-for="feature in features" :key="feature.title" class="rounded-[20px] border border-[var(--color-border-soft)] bg-white p-7 shadow-soft">
            <div class="mb-6 flex size-12 items-center justify-center rounded-full bg-[var(--color-brand)] text-[22px] text-white">{{ feature.icon }}</div>
            <h3 class="font-display text-[28px] leading-[1.1] tracking-[-0.04em] text-[var(--color-ink)]">{{ feature.title }}</h3>
            <p class="mt-4 text-[15px] text-[var(--color-ink-soft)]">{{ feature.body }}</p>
          </div>
        </div>
      </UContainer>
    </section>

    <section id="pricing" class="bg-[#101010] py-16 text-white md:py-20">
      <UContainer class="text-center">
        <p class="text-[19px] text-white/80">Tell us your idea. We'll help you bring it to life.</p>
        <div class="mt-6 flex justify-center">
          <UButton label="Shoot us an email" class="rounded-[14px] border border-white/15 bg-white px-6 py-3 text-[14px] font-semibold text-[#111111] hover:bg-[var(--color-brand-soft)]" />
        </div>
      </UContainer>
    </section>
  </div>
</template>

<script setup lang="ts">
const stats = [
  { value: '3+', label: 'Years of experience' },
  { value: '12+', label: 'Startups served' },
  { value: '4.8', label: 'Star ratings' },
  { value: '30+', label: 'Projects completed' }
]

const caseStudies = [
  {
    tag: 'RWA infrastructure',
    title: 'Proof of reserve for tokenized silver',
    body: 'We designed a reserve-attestation stack that turns custodian PDFs into cryptographic coverage proofs without exposing underlying identity or holdings.'
  },
  {
    tag: 'Compliance',
    title: 'Private lending with eligibility proofs',
    body: 'Borrowers can prove note ownership and investor compliance in zero knowledge, while lenders verify solvency without reading private position data.'
  },
  {
    tag: 'Token design',
    title: 'Auditable collateral rails',
    body: 'From the issuer registry to the reserve verifier and challenge manager, we mapped the full proving flow to a clean on-chain architecture.'
  }
]

const features = [
  {
    icon: '↗',
    title: 'We make it simple',
    body: 'No stress. No guesswork. Just a sharp product strategy, a clear technical path, and a design system that keeps your roadmap moving.'
  },
  {
    icon: '◎',
    title: 'Built to grow with you',
    body: 'We build for today while staying ready for the next financing round, new compliance rules, and the next version of your market.'
  },
  {
    icon: '✦',
    title: 'Support that doesn’t disappear',
    body: 'From early architecture decisions to launch support, we stay close to the product so the roadmap keeps working in the real world.'
  }
]
</script>
