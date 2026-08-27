<template>
  <div>
    <!-- ─────────────────────────────────────────────── hero
      The inspiration floats decorative service labels around its headline. Here
      the same device carries the live coverage state of tracked assets, so the
      ornament is the product's actual signal rather than a garnish.
    -->
    <section class="relative overflow-hidden border-b border-default">
      <div class="grid-bg pointer-events-none absolute inset-0" />
      <div class="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-ground" />

      <UContainer class="relative py-20 lg:py-28">
        <div
          v-for="(pill, i) in floatingPills"
          :key="pill.symbol"
          class="rise absolute hidden xl:block"
          :class="pill.position"
          :style="{ '--i': 6 + i }"
        >
          <div class="flex items-center gap-2.5 rounded-full bg-card px-4 py-2.5 shadow-soft ring-1 ring-default">
            <span
              class="size-2 rounded-full"
              :class="statusMeta[pill.status].dot"
            />
            <span class="font-data text-[13px] font-medium text-highlighted">{{ pill.symbol }}</span>
            <span
              class="text-[13px]"
              :class="statusMeta[pill.status].text"
            >{{ statusMeta[pill.status].label }}</span>
          </div>
        </div>

        <div class="mx-auto max-w-[900px] text-center">
          <div
            class="rise inline-flex items-center gap-2 rounded-full bg-card px-3.5 py-1.5 text-[13px] ring-1 ring-default"
            :style="{ '--i': 0 }"
          >
            <span class="size-1.5 animate-pulse rounded-full bg-covered-500" />
            <span class="text-toned">
              {{ coveredCount }} of {{ assets.length }} assets covered right now
            </span>
          </div>

          <h1 class="mt-8 font-display text-[46px] leading-[0.95] text-highlighted sm:text-[68px] lg:text-[88px]">
            <span
              class="rise block"
              :style="{ '--i': 1 }"
            >Prove an RWA is backed</span>
            <span
              class="rise block"
              :style="{ '--i': 2 }"
            >without exposing what backs it.</span>
          </h1>

          <p
            class="rise mx-auto mt-8 max-w-[620px] text-[17px] leading-[1.65] text-toned sm:text-[19px]"
            :style="{ '--i': 4 }"
          >
            AI agents turn private custodian records into verifiable reserve proofs.
            HashKey Chain enforces the result, so the public proof can say coverage is
            true without revealing the underlying reserve book.
          </p>

          <div
            class="rise mt-9 flex flex-wrap items-center justify-center gap-3"
            :style="{ '--i': 5 }"
          >
            <UButton
              to="/asset/silver-001"
              label="View Verified Assets"
              size="lg"
              trailing-icon="i-lucide-arrow-right"
            />
            <UButton
              to="/issuer/proof"
              label="Run Demo"
              color="neutral"
              variant="outline"
              size="lg"
            />
          </div>
        </div>
      </UContainer>
    </section>

    <!-- ─────────────────────────────────────────── figures band -->
    <section class="bg-band text-white">
      <UContainer class="py-14 lg:py-16">
        <div class="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div
            v-for="stat in stats"
            :key="stat.label"
            class="lg:border-r lg:border-white/12 lg:pr-8 lg:last:border-r-0"
          >
            <div class="font-display text-[42px] leading-none text-white lg:text-[48px]">
              {{ stat.value }}
            </div>
            <div class="mt-2.5 text-[14px] text-white/55">
              {{ stat.label }}
            </div>
          </div>
        </div>
      </UContainer>
    </section>

    <!-- ─────────────────────────────────────────── tracked assets -->
    <section
      id="assets"
      class="scroll-mt-24 py-20 lg:py-28"
    >
      <UContainer>
        <div class="flex flex-wrap items-end justify-between gap-6">
          <div class="max-w-[620px]">
            <SectionLabel>Tracked assets</SectionLabel>
            <h2 class="mt-4 font-display text-[38px] leading-[1.03] text-highlighted sm:text-[52px]">
              Every asset, every round, in the open
            </h2>
            <p class="mt-5 text-[16px] leading-[1.65] text-toned">
              Coverage state is read from <span class="font-data text-[15px] text-highlighted">ReserveRegistry</span>
              — the same contract the compliance module reads before it will allow a mint.
              Custodian counts are public; custodian identities are not.
            </p>
          </div>
          <UButton
            to="/proofs"
            label="All proof rounds"
            color="neutral"
            variant="outline"
            trailing-icon="i-lucide-arrow-up-right"
          />
        </div>

        <div class="mt-12 grid gap-5 md:grid-cols-2">
          <AssetCard
            v-for="asset in assets"
            :key="asset.id"
            :asset="asset"
          />
        </div>
      </UContainer>
    </section>

    <!-- ─────────────────────────────────────────── the pipeline -->
    <section
      id="how"
      class="scroll-mt-24 border-y border-default bg-muted py-20 lg:py-28"
    >
      <UContainer>
        <div class="max-w-[680px]">
          <SectionLabel>The round</SectionLabel>
          <h2 class="mt-4 font-display text-[38px] leading-[1.03] text-highlighted sm:text-[52px]">
            From a vault statement to a constraint on the token
          </h2>
          <p class="mt-5 text-[16px] leading-[1.65] text-toned">
            Five steps, repeated on a cadence the issuer configures. Nothing in the
            chain requires trusting the software that reads the documents.
          </p>
        </div>

        <ol class="mt-14 grid gap-px overflow-hidden rounded-panel bg-default ring-1 ring-default lg:grid-cols-5">
          <li
            v-for="(step, i) in pipeline"
            :key="step.title"
            class="flex flex-col bg-card p-6"
          >
            <div class="font-data text-[13px] text-dimmed">
              {{ String(i + 1).padStart(2, '0') }}
            </div>
            <h3 class="mt-4 font-display text-[20px] leading-[1.2] text-highlighted">
              {{ step.title }}
            </h3>
            <p class="mt-3 text-[14px] leading-[1.6] text-toned">
              {{ step.body }}
            </p>
          </li>
        </ol>
      </UContainer>
    </section>

    <!-- ─────────────────────────────────────────── public vs private
      §5 of the spec, rendered as the split it actually is. This is the section
      that answers the first question any institutional reader asks.
    -->
    <section class="py-20 lg:py-28">
      <UContainer>
        <div class="grid gap-14 lg:grid-cols-[1fr_1.15fr] lg:gap-20">
          <div>
            <SectionLabel>The witness</SectionLabel>
            <h2 class="mt-4 font-display text-[38px] leading-[1.03] text-highlighted sm:text-[48px]">
              What the proof shows, and what it never does
            </h2>
            <p class="mt-5 text-[16px] leading-[1.65] text-toned">
              The witness is the circuit's private input. It is not a disclosure.
              A verifier learns that coverage holds and nothing about the book that
              produces it.
            </p>

            <div class="mt-8 rounded-panel bg-band p-6 text-white lg:p-7">
              <div class="text-[12px] uppercase tracking-[0.09em] text-white/40">
                Why the agent cannot lie
              </div>
              <p class="mt-3 text-[15px] leading-[1.65] text-white/80">
                Every quantity in the witness must be bound to a signature from a key
                in the registered custodian set. The agent holds no signing key, so it
                cannot invent reserves. It can only <em class="text-white">omit</em> an
                attestation — which makes coverage look worse, never better. The failure
                mode is asymmetric, and it is slashable.
              </p>
            </div>
          </div>

          <div class="grid gap-5 sm:grid-cols-2">
            <div
              v-for="group in disclosure"
              :key="group.title"
              class="rounded-panel p-6 ring-1"
              :class="group.public ? 'bg-card ring-default' : 'bg-ink-950 text-white ring-transparent'"
            >
              <div class="flex items-center gap-2">
                <UIcon
                  :name="group.public ? 'i-lucide-eye' : 'i-lucide-eye-off'"
                  class="size-4"
                  :class="group.public ? 'text-muted' : 'text-white/50'"
                />
                <span
                  class="text-[12px] uppercase tracking-[0.09em]"
                  :class="group.public ? 'text-muted' : 'text-white/50'"
                >{{ group.title }}</span>
              </div>
              <ul class="mt-5 space-y-3.5">
                <li
                  v-for="item in group.items"
                  :key="item"
                  class="flex gap-2.5 text-[14px] leading-[1.55]"
                  :class="group.public ? 'text-toned' : 'text-white/80'"
                >
                  <span
                    class="mt-[7px] size-1 shrink-0 rounded-full"
                    :class="group.public ? 'bg-ink-400' : 'bg-white/40'"
                  />
                  {{ item }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </UContainer>
    </section>

    <!-- ─────────────────────────────────────────── three layers -->
    <section
      id="architecture"
      class="scroll-mt-24 border-y border-default bg-muted py-20 lg:py-28"
    >
      <UContainer>
        <div class="max-w-[680px]">
          <SectionLabel>Architecture</SectionLabel>
          <h2 class="mt-4 font-display text-[38px] leading-[1.03] text-highlighted sm:text-[52px]">
            Three layers. Each useful alone.
          </h2>
          <p class="mt-5 text-[16px] leading-[1.65] text-toned">
            Make backing provable, then make that proof composable. Any lending
            market, DEX or wallet on HashKey can read the registry without
            permission and without paying us.
          </p>
        </div>

        <div class="mt-14 grid gap-5 lg:grid-cols-3">
          <article
            v-for="(layer, i) in layers"
            :key="layer.title"
            class="flex flex-col rounded-panel bg-card p-7 ring-1 ring-default"
          >
            <div class="flex items-center gap-3">
              <span class="flex size-9 items-center justify-center rounded-full bg-ink-950 font-data text-[13px] text-white">
                {{ i + 1 }}
              </span>
              <span class="text-[13px] font-medium text-muted">{{ layer.kicker }}</span>
            </div>

            <h3 class="mt-6 font-display text-[27px] leading-[1.12] text-highlighted">
              {{ layer.title }}
            </h3>
            <p class="mt-4 flex-1 text-[15px] leading-[1.65] text-toned">
              {{ layer.body }}
            </p>

            <div class="mt-7 flex flex-wrap gap-2 border-t border-default pt-6">
              <span
                v-for="tag in layer.tags"
                :key="tag"
                class="rounded-full bg-muted px-2.5 py-1 font-data text-[12px] text-toned"
              >{{ tag }}</span>
            </div>
          </article>
        </div>
      </UContainer>
    </section>

    <!-- ─────────────────────────────────────────── limitations
      Stated before anyone asks, per §13. On the darkest ground in the product,
      because burying it would undercut the entire argument.
    -->
    <section
      id="limits"
      class="scroll-mt-24 bg-band py-20 text-white lg:py-28"
    >
      <UContainer>
        <div class="grid gap-14 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
          <div>
            <div class="text-[12px] uppercase tracking-[0.09em] text-white/40">
              Known limitations
            </div>
            <h2 class="mt-4 font-display text-[38px] leading-[1.03] sm:text-[46px]">
              What this does not fix
            </h2>
            <p class="mt-5 text-[16px] leading-[1.65] text-white/55">
              Zero knowledge gives consistency, not physical truth. The oracle
              problem survives. Stated here rather than left for a reader to find.
            </p>
          </div>

          <dl class="grid gap-px overflow-hidden rounded-panel bg-white/10 ring-1 ring-white/10 sm:grid-cols-2">
            <div
              v-for="limit in limitations"
              :key="limit.title"
              class="bg-band p-6"
            >
              <dt class="font-display text-[19px] text-white">
                {{ limit.title }}
              </dt>
              <dd class="mt-3 text-[14px] leading-[1.6] text-white/60">
                {{ limit.body }}
              </dd>
            </div>
          </dl>
        </div>
      </UContainer>
    </section>

    <!-- ─────────────────────────────────────────── closing -->
    <section class="py-20 lg:py-28">
      <UContainer>
        <div class="mx-auto max-w-[640px] text-center">
          <h2 class="font-display text-[38px] leading-[1.03] text-highlighted sm:text-[48px]">
            The registry is a public good
          </h2>
          <p class="mt-5 text-[17px] leading-[1.65] text-toned">
            Read it, build on it, or watch a round land. Coverage for every tracked
            asset is verifiable right now.
          </p>
          <div class="mt-9 flex flex-wrap justify-center gap-3">
            <UButton
              to="/proofs"
              label="Open the proof explorer"
              size="lg"
              trailing-icon="i-lucide-arrow-right"
            />
            <UButton
              to="/asset/silver-001"
              label="Inspect Verified Silver"
              color="neutral"
              variant="outline"
              size="lg"
            />
          </div>
        </div>
      </UContainer>
    </section>
  </div>
</template>

<script setup lang="ts">
import {
  assets,
  coveredCount,
  formatUsd,
  statusMeta,
  totalValueSecured
} from '~/utils/assay'

const floatingPills = [
  { symbol: 'SILVER-001', status: 'covered' as const, position: 'left-0 top-40' }
]

const stats = [
  { value: formatUsd(totalValueSecured), label: 'Reserve value under proof' },
  { value: String(assets.length), label: 'Assets tracked on HashKey' },
  { value: '24h', label: 'Freshness window before mint blocks' },
  { value: '~250k', label: 'Gas to verify a round on-chain' }
]

const pipeline = [
  {
    title: 'Custodians sign',
    body: 'Vault operators and banks sign structured payloads — asset, quantity, account reference, timestamp — with EdDSA keys registered on-chain.'
  },
  {
    title: 'Agents ingest',
    body: 'Independent staked operators normalise statements and portal exports into those payloads. They must agree within tolerance or the round fails loudly.'
  },
  {
    title: 'The circuit proves',
    body: 'Every quantity is bound to a valid custodian signature, checked for freshness, and summed. The proof asserts reserves ≥ supply and reveals nothing else.'
  },
  {
    title: 'The registry records',
    body: 'ReserveVerifier checks the proof on-chain and ReserveRegistry stores coverage, timestamp, supply at proof, and proof hash.'
  },
  {
    title: 'Compliance enforces',
    body: 'AssayCompliance reads the registry inside the ERC-3643 hook. Stale or failed coverage means the mint reverts. Not a dashboard — a constraint.'
  }
]

const disclosure = [
  {
    title: 'Public',
    public: true,
    items: [
      'The proof itself',
      'Token supply at proof time',
      'The custodian set root',
      'The freshness time bound',
      'A single coverage boolean'
    ]
  },
  {
    title: 'Private',
    public: false,
    items: [
      'Individual custodian quantities',
      'Account references',
      'Which custodians signed',
      'The split across vaults',
      'Every holder position downstream'
    ]
  }
]

const layers = [
  {
    kicker: 'Proof of reserve',
    title: 'Attestations become a proof',
    body: 'Agents ingest custodian documents, a Groth16 circuit proves reserves cover supply without revealing the underlying book, and the result is written to an on-chain registry.',
    tags: ['Circom', 'Groth16', 'EdDSA', 'Poseidon']
  },
  {
    kicker: 'Enforcement',
    title: 'The proof binds the token',
    body: 'The registry is wired into the ERC-3643 compliance module. A stale or failed proof means minting reverts at the contract level — the issuer cannot outrun their own reserves.',
    tags: ['ERC-3643', 'Compliance hook', 'Freshness']
  },
  {
    kicker: 'Private lending',
    title: 'Collateral without disclosure',
    body: 'A shielded vault holds RWA collateral as a single eligible holder. Borrowers prove note ownership and investor eligibility in zero knowledge, then draw stablecoins to a stealth address.',
    tags: ['Shielded vault', 'Nullifiers', 'Stealth payout', 'Fixed term']
  }
]

const limitations = [
  {
    title: 'Custodian trust',
    body: 'A custodian that signs false data yields a valid proof of a lie. We prove consistency between attestations and supply, never physical truth.'
  },
  {
    title: 'Document extraction',
    body: 'Ideally custodians sign structured payloads and the agents disappear. Reality is PDFs and portal exports, so extraction needs redundancy plus stake rather than trust.'
  },
  {
    title: 'Trusted setup',
    body: 'Groth16 requires a per-circuit ceremony. Acceptable for a demo; production needs a real ceremony or a migration to a universal-setup system.'
  },
  {
    title: 'Oracle dependency',
    body: 'Collateral valuation reads a public price oracle, with every assumption that carries.'
  },
  {
    title: 'Fixed-term loans only',
    body: 'Hidden positions mean nobody knows when to liquidate, so v1 ships fixed-term and over-collateralized with no ongoing liquidation. Deliberate, not an oversight.'
  },
  {
    title: 'Single operator today',
    body: 'Multi-operator agreement, staking and the challenge manager are specified and next in the build order. Today one operator submits rounds.'
  }
]
</script>
