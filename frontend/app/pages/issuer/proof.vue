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
        Live agent demo — upload three formatted custodian PDFs or use the bundled set. Files are processed locally, deleted after proving, and never published on-chain.
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
            <input
              ref="uploadInput"
              type="file"
              accept="application/pdf,.pdf"
              multiple
              class="hidden"
              @change="selectUploadedFiles"
            >
            <div class="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div class="font-medium text-highlighted">
                  Upload three custodian statements
                </div>
                <div class="mt-1 text-[13px] text-muted">
                  PDF only, maximum 5 MB each. Statements must contain Asset identifier, Vault/account reference, Quantity held, and As of fields.
                </div>
              </div>
              <div class="flex flex-wrap justify-end gap-2">
                <UButton
                  :label="uploadedFiles.length ? `${uploadedFiles.length} PDFs selected` : 'Choose PDFs'"
                  size="sm"
                  color="neutral"
                  variant="outline"
                  :disabled="running"
                  @click="openUploadPicker"
                />
                <UButton
                  label="Prove uploaded PDFs"
                  size="sm"
                  :disabled="running || uploadedFiles.length !== 3"
                  @click="runUploadedProof"
                />
              </div>
            </div>
            <p
              v-if="uploadValidationError"
              class="mt-3 text-[12px] text-failed-700"
            >
              {{ uploadValidationError }}
            </p>
            <div class="my-5 border-t border-default" />
            <div class="flex flex-wrap items-center justify-between gap-3">
              <span class="text-[12px] uppercase tracking-[0.08em] text-muted">Or use bundled demo evidence</span>
              <div class="flex flex-wrap gap-2">
                <UButton
                  label="Healthy set — 4,180 kg"
                  size="sm"
                  :disabled="running"
                  @click="runDemo('healthy')"
                />
                <UButton
                  label="Under-backed set — 3,600 kg"
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
                :class="coverageKnown ? (isCovered ? 'text-covered-700' : 'text-failed-700') : 'text-muted'"
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
                :class="coverageKnown ? (isCovered ? 'text-covered-700' : 'text-failed-700') : 'text-muted'"
              >
                {{ publicCoverageLabel }}
              </dd>
            </div>
            <div class="flex items-center justify-between gap-4 border-b border-default pb-2.5">
              <dt class="text-muted">
                As-of
              </dt>
              <dd class="font-data text-highlighted">
                {{ proofAsOf }}
              </dd>
            </div>
            <div class="flex items-center justify-between gap-4 border-b border-default pb-2.5">
              <dt class="text-muted">
                Submission
              </dt>
              <dd class="font-data text-highlighted">
                {{ submissionLabel }}
              </dd>
            </div>
            <div class="flex items-center justify-between gap-4">
              <dt class="text-muted">
                Custodian root
              </dt>
              <dd class="font-data text-highlighted">
                {{ custodianRootLabel }}
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
              <li
                v-for="item in privateEvidence"
                :key="item"
              >
                {{ item }}
              </li>
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
              :class="coverageKnown && isCovered ? 'bg-covered-50 ring-covered-200' : coverageKnown ? 'bg-failed-50 ring-failed-200' : 'bg-muted ring-default'"
            >
              <div
                class="font-data text-[13px]"
                :class="coverageKnown && isCovered ? 'text-covered-700' : coverageKnown ? 'text-failed-700' : 'text-muted'"
              >
                Agent result
              </div>
              <div class="mt-2 font-display text-[26px] leading-none text-highlighted">
                {{ currentStage >= 6 ? (submitted ? 'Proof accepted on-chain' : 'Proof verified locally') : 'Not generated' }}
              </div>
              <div
                v-if="currentStage >= 6 && coverageKnown && !isCovered"
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
              :to="`/issuer/mint?state=${isCovered ? 'healthy' : 'failed'}`"
              :label="isCovered ? 'Continue to mint' : 'Try blocked mint'"
              size="sm"
            />
          </div>
        </div>
      </div>
    </UContainer>
  </div>
</template>

<script setup lang="ts">
import { formatUnits } from 'viem'
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
interface ProofSummary {
  assetId: string
  custodianRoot: `0x${string}`
  tokenSupply: string
  reserveQuantity: string
  covered: boolean
  timeBound: string
  locallyVerified: boolean
  transactionHash?: `0x${string}`
  blockNumber?: string
}

interface ProofResponse {
  ok: boolean
  submitted: boolean
  proof?: ProofSummary
}

const scenario = ref<Scenario>('healthy')
const currentStage = ref(-1)
const running = ref(false)
const submitted = ref(false)
const agentError = ref('')
const uploadInput = ref<HTMLInputElement | null>(null)
const uploadedFiles = ref<File[]>([])
const uploadedMode = ref(false)
const uploadValidationError = ref('')
const proofSummary = ref<ProofSummary | null>(null)

const documents = computed(() => uploadedMode.value
  ? uploadedFiles.value.map((file, index) => ({
      title: `Uploaded Statement ${String.fromCharCode(65 + index)}`,
      file: file.name,
      asset: currentStage.value >= 1 ? 'SILVER-001' : 'Pending',
      quantity: currentStage.value >= 3 ? 'Private input' : 'Pending',
      asOf: currentStage.value >= 1 ? 'Extracted privately' : 'Pending',
      account: currentStage.value >= 1 ? 'PRIVATE' : 'Pending',
      confidence: currentStage.value >= 1 ? 'Validated' : 'Pending'
    }))
  : [
      { title: 'Custodian Statement A', file: 'custodian_a_healthy.pdf', asset: 'SILVER-001', quantity: '1,850 kg', asOf: 'Aug 27, 2026', account: 'VAULT-001', confidence: '99%' },
      { title: 'Custodian Statement B', file: 'custodian_b_healthy.pdf', asset: 'SILVER-001', quantity: '920 kg', asOf: 'Aug 27, 2026', account: 'VAULT-002', confidence: '99%' },
      { title: 'Custodian Statement C', file: scenario.value === 'healthy' ? 'custodian_c_healthy.pdf' : 'custodian_c_underbacked.pdf', asset: 'SILVER-001', quantity: scenario.value === 'healthy' ? '1,410 kg' : '830 kg', asOf: 'Aug 27, 2026', account: 'VAULT-003', confidence: '98%' }
    ])

const coverageKnown = computed(() => !uploadedMode.value || Boolean(proofSummary.value))
const isCovered = computed(() => uploadedMode.value
  ? proofSummary.value?.covered === true
  : scenario.value === 'healthy')
const reserveQuantity = computed(() => proofSummary.value
  ? formatUnits(BigInt(proofSummary.value.reserveQuantity), 18)
  : scenario.value === 'healthy' ? '4180' : '3600')

const findings = computed(() => [
  uploadedMode.value ? 'Three uploaded PDFs passed local file validation.' : 'Account IDs and signatures match the registered custodian set.',
  coverageKnown.value
    ? `The agent reconciled ${Number(reserveQuantity.value).toLocaleString()} kg against the 4,000 kg issuance cap.`
    : 'The agent will extract and reconcile quantities without publishing the documents.',
  'No holder identity leaks are exposed outside the witness circuit.'
])

const equation = computed(() => uploadedMode.value
  ? proofSummary.value ? `${Number(reserveQuantity.value).toLocaleString()} kg total; individual balances private` : 'Pending private extraction'
  : scenario.value === 'healthy' ? '1,850 + 920 + 1,410 = 4,180 kg' : '1,850 + 920 + 830 = 3,600 kg')

const coverageLabel = computed(() => {
  if (!coverageKnown.value) return 'PENDING'
  const ratio = (Number(reserveQuantity.value) / 4000) * 100
  return `${ratio.toFixed(1)}% ${isCovered.value ? '✓' : 'FAILED'}`
})
const publicCoverageLabel = computed(() => coverageKnown.value ? (isCovered.value ? 'TRUE' : 'FALSE') : 'PENDING')
const proofAsOf = computed(() => proofSummary.value
  ? new Date(Number(proofSummary.value.timeBound) * 1000).toISOString().slice(0, 10)
  : 'Pending')
const submissionLabel = computed(() => {
  if (currentStage.value < 5) return 'Pending'
  if (proofSummary.value?.transactionHash) return `${proofSummary.value.transactionHash.slice(0, 10)}…`
  return proofSummary.value?.locallyVerified ? 'Verified locally' : 'Generating'
})
const custodianRootLabel = computed(() => proofSummary.value
  ? `${proofSummary.value.custodianRoot.slice(0, 8)}…${proofSummary.value.custodianRoot.slice(-6)}`
  : 'Pending')
const privateEvidence = computed(() => uploadedMode.value
  ? [
      'Individual custodian quantities: PRIVATE',
      'Account references: PRIVATE',
      'Signatures: PRIVATE',
      'Uploaded source PDFs: TEMPORARY, THEN DELETED'
    ]
  : [
      'Custodian A: 1,850 kg',
      'Custodian B: 920 kg',
      `Custodian C: ${scenario.value === 'healthy' ? '1,410' : '830'} kg`,
      'Account refs: PRIVATE',
      'Signatures: PRIVATE',
      'Source PDFs: PRIVATE'
    ])

function openUploadPicker() {
  uploadInput.value?.click()
}

function selectUploadedFiles(event: Event) {
  const input = event.target as HTMLInputElement
  const files = Array.from(input.files ?? [])
  uploadValidationError.value = ''
  if (files.length !== 3) {
    uploadedFiles.value = []
    uploadValidationError.value = `Select exactly three PDFs; you selected ${files.length}.`
    return
  }
  const invalid = files.find(file => !file.name.toLowerCase().endsWith('.pdf') || file.size === 0 || file.size > 5 * 1024 * 1024)
  if (invalid) {
    uploadedFiles.value = []
    uploadValidationError.value = `${invalid.name} must be a non-empty PDF no larger than 5 MB.`
    return
  }
  uploadedFiles.value = files
  uploadedMode.value = true
  proofSummary.value = null
  currentStage.value = -1
  submitted.value = false
  agentError.value = ''
}

async function finishProof(request: Promise<ProofResponse>) {
  for (let index = 1; index < stages.length - 1; index++) {
    await new Promise(resolve => setTimeout(resolve, 600))
    currentStage.value = index
  }
  const response = await request
  if (!response.proof?.locallyVerified) {
    if (response.submitted) {
      submitted.value = true
      currentStage.value = stages.length - 1
      return
    }
    throw new Error('The agent did not return a locally verified proof summary.')
  }
  proofSummary.value = response.proof
  scenario.value = response.proof.covered ? 'healthy' : 'failed'
  submitted.value = response.submitted
  currentStage.value = stages.length - 1
}

async function runUploadedProof() {
  if (running.value || uploadedFiles.value.length !== 3) return
  uploadedMode.value = true
  proofSummary.value = null
  currentStage.value = 0
  running.value = true
  submitted.value = false
  agentError.value = ''
  const form = new FormData()
  for (const file of uploadedFiles.value) form.append('documents', file, file.name)
  try {
    await finishProof($fetch<ProofResponse>(`${agentApiUrl}/proof/upload`, {
      method: 'POST',
      body: form
    }))
  } catch (error) {
    const apiError = (error as { data?: { error?: string } }).data?.error
    agentError.value = apiError || (error instanceof Error ? error.message : 'The agent API could not process the uploaded PDFs.')
    currentStage.value = Math.min(currentStage.value, 4)
  } finally {
    running.value = false
  }
}

async function runDemo(next: Scenario) {
  if (running.value) return
  uploadedMode.value = false
  scenario.value = next
  proofSummary.value = null
  currentStage.value = 0
  running.value = true
  submitted.value = false
  agentError.value = ''
  try {
    await finishProof($fetch<ProofResponse>(`${agentApiUrl}/demo/proof`, {
      method: 'POST',
      body: { scenario: next }
    }))
  } catch (error) {
    const apiError = (error as { data?: { error?: string } }).data?.error
    agentError.value = apiError || (error instanceof Error ? error.message : 'The agent API could not generate the proof.')
    currentStage.value = Math.min(currentStage.value, 4)
  } finally {
    running.value = false
  }
}
</script>
