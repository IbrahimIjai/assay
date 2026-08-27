/**
 * Demo data for the Vouch prototype. Every figure here is the one the design
 * carries — the brief is explicit that numbers are real or absent, so nothing
 * is generated at render time.
 */

export type VerificationState = 'verified' | 'revoked' | 'unknown' | 'notfound'

export interface Credential {
  id: string
  state: VerificationState
  title: string
  holder: string
  issuer: string
  issuerName: string
  dateIssued: string
  swarmRef: string
  merkleRoot: string
  anchorTx: string
  batchSize: string
  document: {
    filename: string
    pages: number
    size: string
    body: string
  }
  revokedOn?: string
  signer?: string
}

const unilagDocument = {
  filename: 'certificate.pdf',
  pages: 1,
  size: '184 KB',
  body: 'has been admitted to the degree of Bachelor of Science in Computer Science, second class upper division.'
}

export const credentials: Record<string, Credential> = {
  '4f2a91d029c1b': {
    id: '4f2a91d029c1b',
    state: 'verified',
    title: 'B.Sc. Computer Science, second class upper',
    holder: 'Adaeze Nwankwo',
    issuer: 'unilag.edu.ng',
    issuerName: 'University of Lagos',
    dateIssued: '02 August 2026',
    swarmRef: '4f2a91…29c1b',
    merkleRoot: '0x7b30…e4c9',
    anchorTx: '0x1d8f…a072',
    batchSize: '2,940 credentials',
    document: unilagDocument
  },
  'a71c04b3d3e8': {
    id: 'a71c04b3d3e8',
    state: 'revoked',
    title: 'B.Sc. Computer Science, second class upper',
    holder: 'Tunde Salami',
    issuer: 'unilag.edu.ng',
    issuerName: 'University of Lagos',
    dateIssued: '02 August 2026',
    revokedOn: '14 May 2026',
    swarmRef: 'a71c04…d3e8',
    merkleRoot: '0x7b30…e4c9',
    anchorTx: '0x1d8f…a072',
    batchSize: '2,940 credentials',
    document: unilagDocument
  },
  '0b93fe7a26': {
    id: '0b93fe7a26',
    state: 'unknown',
    title: 'B.Sc. Computer Science, second class upper',
    holder: 'Adaeze Nwankwo',
    issuer: 'unilag.edu.ng',
    issuerName: 'University of Lagos',
    dateIssued: '02 August 2026',
    signer: '0x9c4e…21af',
    swarmRef: '0b93fe…7a26',
    merkleRoot: '0x7b30…e4c9',
    anchorTx: '0x1d8f…a072',
    batchSize: '2,940 credentials',
    document: unilagDocument
  }
}

/** The demo credential the landing page's "Try an example" link fills in. */
export const exampleCredentialLink = 'https://vouch.id/v/4f2a91d029c1b'

export const stateLabels: Record<VerificationState, string> = {
  verified: 'Verified',
  revoked: 'Revoked',
  unknown: 'Issuer unknown',
  notfound: 'Not found'
}

/** Demo ids behind the result-state switcher shown in the design. */
export const stateRoutes: Record<VerificationState, string> = {
  verified: '/v/4f2a91d029c1b',
  revoked: '/v/a71c04b3d3e8',
  unknown: '/v/0b93fe7a26',
  notfound: '/v/not-a-real-reference'
}

export const networkStat = {
  headline: '18,400 credentials anchored by 12 issuers.',
  detail: 'Network total, updated every block.'
}

export const issuers = [
  { domain: 'altschool.africa', issued: '4,102', first: '12 Mar 2025', last: '18 Aug 2026' },
  { domain: 'web3bridge.com', issued: '3,318', first: '04 Feb 2025', last: '11 Aug 2026' },
  { domain: 'unilag.edu.ng', issued: '2,940', first: '27 Jun 2025', last: '02 Aug 2026' },
  { domain: 'nysc.gov.ng', issued: '2,655', first: '09 Sep 2025', last: '21 Jul 2026' },
  { domain: 'ui.edu.ng', issued: '1,884', first: '15 Jan 2026', last: '30 Jun 2026' },
  { domain: 'moringaschool.com', issued: '1,207', first: '02 Apr 2026', last: '14 Jun 2026' }
]

export const issuersAll = [
  ...issuers,
  { domain: 'coursera.org', issued: '984', first: '11 Apr 2026', last: '09 Jun 2026' },
  { domain: 'lasu.edu.ng', issued: '772', first: '23 Apr 2026', last: '02 Jun 2026' },
  { domain: 'decagonhq.com', issued: '640', first: '05 May 2026', last: '28 May 2026' },
  { domain: 'utme.jamb.gov.ng', issued: '418', first: '19 May 2026', last: '21 May 2026' },
  { domain: 'semicolon.africa', issued: '312', first: '02 Jun 2026', last: '16 Jun 2026' },
  { domain: 'ashesi.edu.gh', issued: '188', first: '14 Jun 2026', last: '30 Jun 2026' }
]

export const howItWorks = [
  {
    step: '01',
    title: 'The institution signs a batch.',
    body: 'One transaction covers an entire graduating class — 40 credentials or 40,000, same cost.'
  },
  {
    step: '02',
    title: 'Documents go to Swarm.',
    body: 'Each credential and the batch manifest are stored on decentralized storage, addressed by content hash.'
  },
  {
    step: '03',
    title: 'Anyone verifies, forever.',
    body: 'The verifier fetches the document and its proof, checks the Merkle root on-chain, and confirms the issuer\'s domain. Nothing routes through us.'
  }
]

export const flowPaths = [
  {
    label: 'Issue path',
    steps: ['CSV of recipients', 'Documents rendered', 'Uploaded to Swarm', 'Merkle root anchored on-chain']
  },
  {
    label: 'Verify path',
    steps: ['Credential link', 'Document fetched from Swarm', 'Proof checked against root', 'Issuer domain confirmed']
  }
]

export const institutionClaims = [
  'Upload a CSV of recipients. Vouch renders each document and checks every row before anything is signed.',
  'Verify your domain by adding one DNS TXT record. Verifiers see your domain, not a wallet address.',
  'Publish the batch in one transaction. Claim links go out by email; credentials verify without your servers.'
]

/* ------------------------------------------------------------------ issuer */

export const issuerDomain = 'unilag.edu.ng'

export const batches = [
  { name: 'Class of 2026 — undergraduate', credentials: '2,940', issued: '02 Aug 2026', tx: '0x1d8f…a072', status: 'Anchored' },
  { name: 'Postgraduate diplomas, spring', credentials: '318', issued: '14 May 2026', tx: '0x8ac1…39be', status: 'Anchored' },
  { name: 'Certificates in data science', credentials: '642', issued: '09 Feb 2026', tx: '0x44d2…c7f1', status: 'Anchored' },
  { name: 'Class of 2027 — draft', credentials: '4,102', issued: '—', tx: '—', status: 'Unsigned' }
]

export const issuedCredentials = [
  { holder: 'Adaeze Nwankwo', credential: 'B.Sc. Computer Science', batch: 'Class of 2026', reference: '4f2a91…29c1b', claimed: '04 Aug 2026' },
  { holder: 'Ibrahim Bello', credential: 'B.Sc. Economics', batch: 'Class of 2026', reference: 'a71c04…d3e8', claimed: '03 Aug 2026' },
  { holder: 'Chidera Okafor', credential: 'B.A. History', batch: 'Class of 2026', reference: '0b93fe…7a26', claimed: 'Not yet' },
  { holder: 'Funmi Adeyemi', credential: 'M.Sc. Statistics', batch: 'Postgraduate diplomas', reference: 'c520ab…f194', claimed: '19 May 2026' }
]

export const revocations = [
  { holder: 'Tunde Salami', credential: 'B.Sc. Computer Science', revoked: '14 May 2026', by: 'registrar@unilag.edu.ng', reason: 'Issued to the wrong recipient' },
  { holder: 'Blessing Eze', credential: 'Certificate in data science', revoked: '28 Mar 2026', by: 'registrar@unilag.edu.ng', reason: 'Superseded by a corrected record' }
]

export const signingKeys = [
  { key: '0x9c4e…21af', from: '09 Feb 2026', retired: 'In use', batches: '3' },
  { key: '0x30b7…8d15', from: '27 Jun 2025', retired: '09 Feb 2026', batches: '2' }
]

export const currentKey = '0x9c4e2f88b1a3d0764cfe5b02a913ee7c21af'

export const domainRecord = {
  domain: 'unilag.edu.ng',
  host: '_vouch.unilag.edu.ng',
  value: 'vouch-site-verification=4f2a91d0c7e3',
  verifiedOn: '27 June 2025',
  lastChecked: '24 August 2026, 09:12 UTC',
  second: {
    label: 'Second domain',
    host: '_vouch.alumni.unilag.edu.ng'
  }
}

/* ------------------------------------------------------------- issue a batch */

export const uploadedFile = {
  name: 'class-of-2026.csv',
  detail: '4,102 rows parsed · 2 rows need attention'
}

export const csvRows = [
  { row: '211', recipient: 'Adaeze Nwankwo', email: 'adaeze.n@example.com', award: 'B.Sc. Computer Science', validation: 'Ready', error: false },
  { row: '212', recipient: 'Ibrahim Bello', email: 'i.bello@example.com', award: 'B.Sc. Economics', validation: 'Ready', error: false },
  { row: '214', recipient: 'Chidera Okafor', email: '—', award: 'B.A. History', validation: 'Row 214: missing recipient email.', error: true },
  { row: '215', recipient: 'Funmi Adeyemi', email: 'funmi.a@example.com', award: 'M.Sc. Statistics', validation: 'Ready', error: false },
  { row: '217', recipient: 'Samuel Idowu', email: 's.idowu@example.com', award: '—', validation: 'Row 217: award field is empty.', error: true }
]

export const columnMappings = [
  { column: 'full_name', options: ['Holder name', 'Holder email', 'Award title'] },
  { column: 'email_address', options: ['Holder email', 'Holder name', 'Ignore'] },
  { column: 'award', options: ['Award title', 'Award class', 'Ignore'] },
  { column: 'matric_no', options: ['Internal reference', 'Ignore'] }
]

export const visibilityOptions = [
  {
    value: 'public',
    label: 'Public',
    description: 'Anyone with the link reads the document. Best for degrees and certificates a graduate wants to share openly.'
  },
  {
    value: 'private',
    label: 'Private',
    description: 'The document is encrypted; the holder grants access to one verifier at a time. Best for transcripts and records with personal data.'
  }
]

export const batchReview = {
  headline: '4,102 credentials. One transaction.',
  detail: 'Storage paid through August 2036. Documents upload to Swarm first; the Merkle root is anchored when you sign.',
  rows: [
    ['Batch name', 'Class of 2027 — undergraduate'],
    ['Visibility', 'Public'],
    ['Skipped rows', '2 — missing email, empty award'],
    ['Signing key', '0x9c4e…21af']
  ]
}

export const publishedBatch = {
  count: '4,102',
  tx: '0x1d8f…a072',
  link: 'https://vouch.id/b/7b30fe41e4c9'
}
