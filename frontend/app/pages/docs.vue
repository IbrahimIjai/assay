<!--
  Two-column: sticky sidebar nav, content column at 720px. Code blocks on
  --bg-inset with no syntax-highlighting rainbow — comments muted, everything
  else ink.
-->
<template>
  <UContainer class="py-28">
    <div class="lg:grid lg:grid-cols-[220px_1fr] lg:gap-12">
      <aside class="hidden lg:block">
        <nav class="sticky top-12 flex flex-col gap-0.5">
          <a
            v-for="section in sections"
            :key="section.id"
            :href="`#${section.id}`"
            class="rounded-md px-2 py-2 text-[14px] font-medium text-toned hover:bg-elevated hover:text-highlighted transition-colors duration-[160ms] ease-out"
          >{{ section.title }}</a>
        </nav>
      </aside>

      <div class="max-w-[720px]">
        <h1 class="font-display text-section">
          Docs
        </h1>
        <p class="text-body text-toned mt-4">
          Everything needed to issue a batch or verify a credential without going through
          Vouch. The manifest format and the contract are the contract; this page describes
          them.
        </p>

        <section
          v-for="section in sections"
          :id="section.id"
          :key="section.id"
          class="mt-12 scroll-mt-8"
        >
          <h2 class="text-card font-medium text-highlighted">
            {{ section.title }}
          </h2>
          <p
            v-for="paragraph in section.body"
            :key="paragraph"
            class="text-body text-toned mt-3 leading-[1.7]"
          >
            {{ paragraph }}
          </p>
          <pre
            v-if="section.code"
            class="bg-elevated rounded-md p-4 mt-4 overflow-x-auto font-mono text-meta text-highlighted"
          ><code>{{ section.code }}</code></pre>
        </section>
      </div>
    </div>
  </UContainer>
</template>

<script setup lang="ts">
useSeoMeta({ title: 'Docs · Vouch' })

const sections = [
  {
    id: 'quickstart',
    title: 'Quickstart',
    body: [
      'Verify a credential from the command line. No key, no account, no rate limit — the check runs against Swarm and the anchor contract directly.'
    ],
    code: 'npx vouch verify https://vouch.id/v/4f2a91d029c1b\n\n# verified   unilag.edu.ng\n# issued     02 August 2026\n# root       0x7b30…e4c9  (anchored in 0x1d8f…a072)'
  },
  {
    id: 'issuing',
    title: 'Issuing',
    body: [
      'An issuer uploads a CSV, maps its columns to credential fields, chooses visibility, and signs. Documents are rendered and uploaded to Swarm before anything touches the chain; the signature covers the Merkle root of the batch manifest, so one transaction anchors the whole class.',
      'Rows that fail validation are skipped, never silently corrected. The batch that gets signed is the batch you reviewed.'
    ]
  },
  {
    id: 'verifying',
    title: 'Verifying',
    body: [
      'A verifier fetches the document and its inclusion proof from Swarm, recomputes the leaf hash, walks the proof to the root, and compares that root against the one anchored on-chain. It then resolves the issuer\'s DNS TXT record to confirm the signing key belongs to the domain.',
      'Nothing in that sequence contacts Vouch. An issuer can disappear entirely and its credentials still verify.'
    ]
  },
  {
    id: 'manifest',
    title: 'The manifest format',
    body: [
      'A batch manifest is newline-delimited JSON. Each line is one credential; the file\'s Merkle root is what gets anchored.'
    ],
    code: '{\n  "holder": "Adaeze Nwankwo",\n  "award": "B.Sc. Computer Science",\n  "class": "second class upper",\n  "issued": "2026-08-02",\n  "document": "4f2a91d0c7e3b8a5f61d29c1b"\n}'
  },
  {
    id: 'domain',
    title: 'Domain verification',
    body: [
      'Add one TXT record and keep it in place. Removing it does not invalidate credentials already issued — it unregisters the domain for new batches.'
    ],
    code: '_vouch.unilag.edu.ng.  IN  TXT  "vouch-site-verification=4f2a91d0c7e3"'
  },
  {
    id: 'revocation',
    title: 'Revocation',
    body: [
      'Revocation is recorded on-chain against the credential\'s leaf hash. A revoked credential still resolves and still shows its document — verifiers see the revocation and the date it was recorded, because hiding it would tell them less, not more.'
    ]
  },
  {
    id: 'storage',
    title: 'Storage and stamps',
    body: [
      'Swarm storage is paid for in advance with a postage stamp. The issuer buys a stamp batch with a depth and a time-to-live; Vouch reports the date storage runs to on the review screen before signing, and again on every batch afterwards.',
      'Storage must be maintained. If a stamp expires, the documents can be re-uploaded — the content hashes and therefore the proofs are unchanged.'
    ]
  },
  {
    id: 'contract',
    title: 'Contract reference',
    body: [
      'The anchor contract holds one mapping from batch root to issuer, plus a revocation set. It has no owner, no upgrade path, and no pause.'
    ],
    code: 'function anchor(bytes32 root, uint32 size) external;\nfunction revoke(bytes32 root, bytes32 leaf) external;\nfunction issuerOf(bytes32 root) external view returns (address);\nfunction isRevoked(bytes32 root, bytes32 leaf) external view returns (bool);'
  }
]
</script>
