<template>
  <div>
    <section class="relative overflow-hidden border-b border-default">
      <div class="grid-bg pointer-events-none absolute inset-0" />
      <UContainer class="relative py-14 lg:py-20">
        <NuxtLink
          to="/"
          class="inline-flex items-center gap-1.5 text-[13px] text-muted transition-colors hover:text-highlighted"
        >
          <UIcon
            name="i-lucide-arrow-left"
            class="size-3.5"
          />
          Back to overview
        </NuxtLink>

        <div class="mt-8 max-w-[760px]">
          <SectionLabel>Issuer reserve proof</SectionLabel>
          <h1 class="mt-4 font-display text-[40px] leading-[1.02] text-highlighted sm:text-[56px]">
            Turn private custody evidence into a public proof
          </h1>
          <p class="mt-5 text-[16px] leading-[1.65] text-toned">
            Documents are evidence, not truth. The agent reads them, verifies the signed quantities,
            reconciles the custodian statements, and only then produces the witness that can be proven on-chain.
          </p>
        </div>
      </UContainer>
    </section>

    <UContainer class="py-12 lg:py-16">
      <div class="mb-6 flex items-center gap-2 rounded-panel bg-stale-50 p-4 text-[13px] text-stale-800 ring-1 ring-stale-200">
        <UIcon
          name="i-lucide-info"
          class="size-4 shrink-0"
        />
        Live agent demo — the API reads the PDFs and generates a locally verified Groth16 proof. On-chain submission is shown separately.
      </div>

      <div class="grid gap-6 lg:grid-cols-[1.25fr_0.95fr]">
        <div class="rounded-panel bg-card p-5 ring-1 ring-default lg:p-6">
          <div class="flex items-center justify-between gap-4">
            <div>
              <div class="text-[12px] uppercase tracking-[0.08em] text-muted">
                Upload statements
              </div>
              <h2 class="mt-2 font-display text-[30px] leading-[1.08] text-highlighted">
                Custodian evidence
              </h2>
            </div>
            <span class="rounded-full bg-muted px-2.5 py-1 font-data text-[12px] text-toned">{{ documents.length }} documents</span>
          </div>

          <div class="mt-6 rounded-panel border border-dashed border-default bg-muted/40 p-6">
            <div class="flex items-center justify-between gap-3">
              <div>
                <div class="font-medium text-highlighted">
                  Choose the bundled custodian evidence
                </div>
                <div class="mt-1 text-[13px] text-muted">
                  No manual upload is required for the video. “Healthy set” proves 4,180 kg; “Under-backed set” proves the failure path.
                </div>
              </div>
              <div class="flex flex-wrap justify-end gap-2">
                <UButton
                  label="Healthy set"
                  size="sm"
                  :disabled="running"
                  @click="runDemo('healthy')"
                />
                <UButton
                  label="Under-backed set"
                  color="neutral"
                  variant="outline"
                  size="sm"
                  :disabled="running"
                  @click="runDemo('failed')"
                />
              </div>
            </div>
          </div>

          <div class="mt-6 grid gap-3 sm:grid-cols-3">
            <div
              v-for="doc in documents"
              :key="doc.file"
              class="rounded-panel bg-muted p-4 ring-1 ring-default"
            >
              <div class="flex items-center justify-between gap-3">
                <span class="font-data text-[12px] text-highlighted">{{ doc.title }}</span>
                <span
                  class="rounded-full px-2 py-0.5 text-[10px] font-medium"
                  :class="currentStage >= 1 ? 'bg-covered-50 text-covered-700 ring-1 ring-covered-200' : 'bg-stale-50 text-stale-700 ring-1 ring-stale-200'"
                >
                  {{ currentStage >= 1 ? 'Extracted' : 'Queued' }}
                </span>
              </div>
              <div class="mt-3 space-y-2 text-[12px] text-toned">
                <div>Asset: <span class="font-data text-highlighted">{{ doc.asset }}</span></div>
                <div>Quantity: <span class="font-data text-highlighted">{{ doc.quantity }}</span></div>
                <div>As of: <span class="font-data text-highlighted">{{ doc.asOf }}</span></div>
                <div>Account: <span class="font-data text-highlighted">{{ doc.account }}</span></div>
                <div>Confidence: <span class="font-data text-highlighted">{{ doc.confidence }}</span></div>
              </div>
              <div
                class="mt-3 truncate font-data text-[10px] text-muted"
                :title="doc.file"
              >
                {{ doc.file }}
              </div>
            </div>
          </div>
        </div>

        <div class="rounded-panel bg-band p-6 text-white lg:p-7">
          <div class="text-[12px] uppercase tracking-[0.08em] text-white/40">
            AI findings
          </div>
          <ul class="mt-5 space-y-3.5 text-[14px] leading-[1.6] text-white/80">
            <li
              v-for="finding in findings"
              :key="finding"
              class="flex gap-2.5"
            >
              <span class="mt-[7px] size-1.5 shrink-0 rounded-full bg-covered-300" />
              <span>{{ finding }}</span>
            </li>
          </ul>
          <div class="mt-6 rounded-panel bg-white/5 p-4 ring-1 ring-white/10">
            <div class="text-[12px] uppercase tracking-[0.08em] text-white/50">
              Confidence
            </div>
            <div class="mt-2 font-display text-[36px] leading-none text-white">
              99%
            </div>
          </div>
        </div>
      </div>

      <div class="mt-10 rounded-panel bg-card p-5 ring-1 ring-default lg:p-7">
        <div class="flex flex-wrap items-end justify-between gap-4">
          <div>
            <SectionLabel>Pipeline</SectionLabel>
            <h2 class="mt-3 font-display text-[30px] leading-[1.08] text-highlighted">
              Evidence to proof
            </h2>
          </div>
          <div class="rounded-full bg-muted px-3 py-1.5 font-data text-[12px] text-toned">
            {{ currentStage < 0 ? 'Awaiting upload' : `Stage ${currentStage + 1} / ${stages.length}` }}
          </div>
        </div>

        <div class="mt-7 grid gap-3 md:grid-cols-2 xl:grid-cols-7">
          <div
            v-for="(stage, index) in stages"
            :key="stage.label"
            class="rounded-panel p-4 ring-1 transition-all duration-300"
            :class="index <= currentStage ? 'bg-ink-950 text-white ring-transparent' : 'bg-muted text-toned ring-default'"
          >
            <div
              class="font-data text-[11px] uppercase tracking-[0.08em]"
              :class="index <= currentStage ? 'text-white/60' : 'text-muted'"
            >
              {{ index < currentStage ? 'DONE' : index === currentStage ? 'ACTIVE' : String(index + 1).padStart(2, '0') }}
            </div>
            <div
              class="mt-3 font-display text-[18px] leading-[1.1]"
              :class="index <= currentStage ? 'text-white' : 'text-highlighted'"
            >
              {{ stage.label }}
            </div>
            <p
              class="mt-2 text-[12px] leading-[1.6]"
              :class="index <= currentStage ? 'text-white/70' : 'text-toned'"
            >
              {{ stage.detail }}
            </p>
          </div>
        </div>
      </div>

      <div class="mt-10 grid gap-6 lg:grid-cols-2">
        <div class="rounded-panel bg-card p-6 ring-1 ring-default">
          <div class="text-[12px] uppercase tracking-[0.08em] text-muted">
            Reconciliation
          </div>
          <h3 class="mt-3 font-display text-[30px] leading-[1.08] text-highlighted">
            Cross-document result
          </h3>
          <div class="mt-5 rounded-panel bg-muted p-4 ring-1 ring-default">
            <div class="flex items-center justify-between gap-4">
              <span class="text-[13px] text-muted">Signed quantities</span>
              <span class="font-data text-[15px] text-highlighted">{{ equation }}</span>
            </div>
            <div class="mt-3 flex items-center justify-between gap-4">
              <span class="text-[13px] text-muted">Coverage</span>
              <span
                class="font-data text-[15px]"
                :class="scenario === 'healthy' ? 'text-covered-700' : 'text-failed-700'"
              >
                {{ coverageLabel }}
              </span>
            </div>
          </div>
        </div>

        <div class="rounded-panel bg-card p-6 ring-1 ring-default">
          <div class="text-[12px] uppercase tracking-[0.08em] text-muted">
            Public proof
          </div>
          <h3 class="mt-3 font-display text-[30px] leading-[1.08] text-highlighted">
            What the chain sees
          </h3>
          <dl class="mt-5 space-y-3 text-[14px]">
            <div class="flex items-center justify-between gap-4 border-b border-default pb-2.5">
              <dt class="text-muted">
                Asset
              </dt>
              <dd class="font-data text-highlighted">
                SILVER-001
              </dd>
            </div>
            <div class="flex items-center justify-between gap-4 border-b border-default pb-2.5">
              <dt class="text-muted">
                Supply
              </dt>
              <dd class="font-data text-highlighted">
                4,000 kg
              </dd>
            </div>
            <div class="flex items-center justify-between gap-4 border-b border-default pb-2.5">
              <dt class="text-muted">
                Coverage
              </dt>
              <dd
                class="font-data"
                :class="scenario === 'healthy' ? 'text-covered-700' : 'text-failed-700'"
              >
                {{ scenario === 'healthy' ? 'TRUE' : 'FALSE' }}
              </dd>
            </div>
            <div class="flex items-center justify-between gap-4 border-b border-default pb-2.5">
              <dt class="text-muted">
                As-of
              </dt>
              <dd class="font-data text-highlighted">
                2026-08-27
              </dd>
            </div>
            <div class="flex items-center justify-between gap-4 border-b border-default pb-2.5">
              <dt class="text-muted">
                Proof hash
              </dt>
              <dd class="font-data text-highlighted">
                {{ currentStage >= 5 ? '0x2fa7c31d…' : 'Pending' }}
              </dd>
            </div>
            <div class="flex items-center justify-between gap-4">
              <dt class="text-muted">
                Custodian root
              </dt>
              <dd class="font-data text-highlighted">
                0xAF9D…5F1A
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div class="mt-10 rounded-panel bg-muted p-6 ring-1 ring-default lg:p-7">
        <div class="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <div class="text-[12px] uppercase tracking-[0.08em] text-muted">
              Private evidence
            </div>
            <h3 class="mt-3 font-display text-[28px] leading-[1.08] text-highlighted">
              What stays off-chain
            </h3>
            <ul class="mt-5 space-y-3 text-[14px] leading-[1.6] text-toned">
              <li>Custodian A: 1,850 kg</li>
              <li>Custodian B: 920 kg</li>
              <li>Custodian C: {{ scenario === 'healthy' ? '1,410' : '830' }} kg</li>
              <li>Account refs: PRIVATE</li>
              <li>Signatures: PRIVATE</li>
              <li>Source PDFs: PRIVATE</li>
            </ul>
          </div>

          <div class="rounded-panel bg-card p-5 ring-1 ring-default">
            <div class="text-[12px] uppercase tracking-[0.08em] text-muted">
              On-chain claim
            </div>
            <p class="mt-4 text-[15px] leading-[1.65] text-toned">
              The chain receives a claim and a proof. It does not receive the underlying reserve book,
              the individual custodian account references, or the private state that generated the witness.
              That boundary is the product.
            </p>
            <div
              class="mt-5 rounded-panel p-4 ring-1"
              :class="scenario === 'healthy' ? 'bg-covered-50 ring-covered-200' : 'bg-failed-50 ring-failed-200'"
            >
              <div
                class="font-data text-[13px]"
                :class="scenario === 'healthy' ? 'text-covered-700' : 'text-failed-700'"
              >
                Agent result
              </div>
              <div class="mt-2 font-display text-[26px] leading-none text-highlighted">
                {{ currentStage >= 6 ? (submitted ? 'Proof accepted on-chain' : 'Proof verified locally') : 'Not generated' }}
              </div>
              <div
                v-if="currentStage >= 6 && scenario === 'failed'"
                class="mt-3 font-data text-[12px] text-failed-700"
              >
                AssayCompliance.ReserveNotCovered()
              </div>
            </div>
            <p
              v-if="agentError"
              class="mt-3 text-[12px] text-failed-700"
            >
              {{ agentError }}
            </p>
            <UButton
              v-if="currentStage >= 6"
              class="mt-4"
              :to="`/issuer/mint?state=${scenario}`"
              :label="scenario === 'healthy' ? 'Continue to mint' : 'Try blocked mint'"
              size="sm"
            />
          </div>
        </div>
      </div>
    </UContainer>
  </div>
</template>

<script setup lang="ts">
import { agentApiUrl } from '~/utils/contracts'

const stages = [
  { label: 'Documents received', detail: 'Three custody statements are ingested and indexed.' },
  { label: 'AI extraction', detail: 'Structured facts are read from the PDFs and reconciled to expected fields.' },
  { label: 'Evidence validation', detail: 'Account metadata, quantity logic, and timestamps are checked for consistency.' },
  { label: 'Cross-document reconciliation', detail: 'Balances are summed and compared against the issued token supply.' },
  { label: 'Witness construction', detail: 'The private inputs are normalized, hashed, and prepared for circuit proofing.' },
  { label: 'ZK proof generation', detail: 'The reserve ratio and coverage condition are proven without exposing the witness.' },
  { label: 'On-chain verification', detail: 'The registry records coverage and the compliance hook reads it.' }
]

type Scenario = 'healthy' | 'failed'
const scenario = ref<Scenario>('healthy')
const currentStage = ref(-1)
const running = ref(false)
const submitted = ref(false)
const agentError = ref('')

const documents = computed(() => [
  { title: 'Custodian Statement A', file: 'custodian_a_healthy.pdf', asset: 'SILVER-001', quantity: '1,850 kg', asOf: 'Aug 27, 2026', account: 'VAULT-001', confidence: '99%' },
  { title: 'Custodian Statement B', file: 'custodian_b_healthy.pdf', asset: 'SILVER-001', quantity: '920 kg', asOf: 'Aug 27, 2026', account: 'VAULT-002', confidence: '99%' },
  { title: 'Custodian Statement C', file: scenario.value === 'healthy' ? 'custodian_c_healthy.pdf' : 'custodian_c_underbacked.pdf', asset: 'SILVER-001', quantity: scenario.value === 'healthy' ? '1,410 kg' : '830 kg', asOf: 'Aug 27, 2026', account: 'VAULT-003', confidence: '98%' }
])

const findings = computed(() => [
  'Account IDs and signatures match the registered custodian set.',
  scenario.value === 'healthy'
    ? 'The attested quantities produce 4,180 kg of proven reserve coverage.'
    : 'The attested quantities total 3,600 kg and do not cover 4,000 kg supply.',
  'No holder identity leaks are exposed outside the witness circuit.'
])

const equation = computed(() => scenario.value === 'healthy'
  ? '1,850 + 920 + 1,410 = 4,180 kg'
  : '1,850 + 920 + 830 = 3,600 kg')

const coverageLabel = computed(() => scenario.value === 'healthy' ? '104.5% ✓' : '90.0% FAILED')

async function runDemo(next: Scenario) {
  if (running.value) return
  scenario.value = next
  currentStage.value = 0
  running.value = true
  submitted.value = false
  agentError.value = ''
  try {
    const request = $fetch<{ ok: boolean, submitted: boolean }>(`${agentApiUrl}/demo/proof`, {
      method: 'POST',
      body: { scenario: next }
    })
    for (let index = 1; index < stages.length; index++) {
      await new Promise(resolve => setTimeout(resolve, 600))
      currentStage.value = index
    }
    const response = await request
    submitted.value = response.submitted
  } catch (error) {
    agentError.value = error instanceof Error ? error.message : 'The agent API could not generate the proof.'
    currentStage.value = 4
  } finally {
    running.value = false
  }
}
</script>
