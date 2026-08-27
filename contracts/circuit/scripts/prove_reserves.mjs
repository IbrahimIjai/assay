#!/usr/bin/env node

import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { buildEddsa, buildPoseidon } from 'circomlibjs'
import { groth16 } from 'snarkjs'
import {
  createPublicClient,
  createWalletClient,
  http,
  keccak256,
  parseAbi,
  toBytes
} from 'viem'
import { privateKeyToAccount } from 'viem/accounts'

const FIELD = 21888242871839275222246405745257275088548364400416034343698204186575808495617n
function argument(name) {
  const index = process.argv.indexOf(name)
  return index === -1 ? undefined : process.argv[index + 1]
}

function fieldHash(value) {
  return BigInt(keccak256(toBytes(value))) % FIELD
}

function demoPrivateKey(index) {
  return createHash('sha256').update(`assay-mainnet-demo-custodian-${index}`).digest()
}

function stringify(_key, value) {
  return typeof value === 'bigint' ? value.toString() : value
}

async function loadAttestations() {
  const inputPath = argument('--input')
  if (inputPath) return JSON.parse(await readFile(resolve(inputPath), 'utf8'))

  const scenario = argument('--scenario') || 'healthy'
  const quantities = scenario === 'failed' ? ['1850', '920', '830'] : ['1850', '920', '1410']
  const timestamp = Math.floor(Date.now() / 1000) - 60
  return quantities.map((quantity, index) => ({
    asset_id: 'SILVER-001',
    quantity,
    unit: 'kg',
    account_ref: `VAULT-DEMO-${index + 1}`,
    as_of: timestamp
  }))
}

async function main() {
  const attestations = await loadAttestations()
  if (attestations.length === 0 || attestations.length > 4) {
    throw new Error('the reserve circuit supports between one and four attestations')
  }

  const assetId = argument('--asset') || attestations[0].asset_id || 'SILVER-001'
  const tokenSupply = BigInt(argument('--supply') || '4000') * 10n ** 18n
  const assetField = fieldHash(assetId)
  const poseidon = await buildPoseidon()
  const eddsa = await buildEddsa()
  const F = poseidon.F

  const privateKeys = Array.from({ length: 4 }, (_, index) => demoPrivateKey(index))
  const publicKeys = privateKeys.map(key => eddsa.prv2pub(key))
  const leaves = publicKeys.map(([x, y]) => F.toObject(poseidon([x, y])))
  while (leaves.length < 16) leaves.push(0n)

  const levels = [leaves]
  for (let depth = 0; depth < 4; depth++) {
    const previous = levels[depth]
    const next = []
    for (let index = 0; index < previous.length; index += 2) {
      next.push(F.toObject(poseidon([previous[index], previous[index + 1]])))
    }
    levels.push(next)
  }
  const custodianRoot = levels[4][0]

  const paths = publicKeys.map((_, leafIndex) => {
    const elements = []
    const indices = []
    let index = leafIndex
    for (let depth = 0; depth < 4; depth++) {
      elements.push(levels[depth][index ^ 1])
      indices.push(index & 1)
      index = Math.floor(index / 2)
    }
    return { elements, indices }
  })

  const normalized = Array.from({ length: 4 }, (_, index) => {
    const attestation = attestations[index]
    if (!attestation) {
      return {
        active: 0n,
        quantity: 0n,
        accountRef: fieldHash(`ASSAY-PADDING-${index}`),
        asOf: BigInt(Math.floor(Date.now() / 1000) - 60)
      }
    }
    if (attestation.asset_id !== assetId) throw new Error(`asset mismatch at attestation ${index}`)
    if (attestation.unit !== 'kg') throw new Error(`unit mismatch at attestation ${index}`)
    const rawTimestamp = typeof attestation.as_of === 'number'
      ? attestation.as_of
      : Math.floor(new Date(attestation.as_of).getTime() / 1000)
    if (!Number.isFinite(rawTimestamp)) throw new Error(`invalid timestamp at attestation ${index}`)
    return {
      active: 1n,
      quantity: BigInt(String(attestation.quantity).replaceAll(',', '').trim()) * 10n ** 18n,
      accountRef: fieldHash(attestation.account_ref),
      asOf: BigInt(rawTimestamp)
    }
  })

  const activeAttestations = normalized.filter(item => item.active === 1n)
  const timeBound = activeAttestations.reduce(
    (oldest, item) => item.asOf < oldest ? item.asOf : oldest,
    activeAttestations[0].asOf
  )
  const total = activeAttestations.reduce((sum, item) => sum + item.quantity, 0n)
  const covered = total >= tokenSupply ? 1n : 0n

  const signatures = normalized.map((item, index) => {
    const message = poseidon([assetField, item.quantity, item.accountRef, item.asOf])
    return eddsa.signPoseidon(privateKeys[index], message)
  })

  const circuitInput = {
    assetId: assetField,
    custodianRoot,
    tokenSupply,
    timeBound,
    covered,
    active: normalized.map(item => item.active),
    quantity: normalized.map(item => item.quantity),
    accountRef: normalized.map(item => item.accountRef),
    asOf: normalized.map(item => item.asOf),
    pubKeyX: publicKeys.map(key => F.toObject(key[0])),
    pubKeyY: publicKeys.map(key => F.toObject(key[1])),
    sigR8x: signatures.map(signature => F.toObject(signature.R8[0])),
    sigR8y: signatures.map(signature => F.toObject(signature.R8[1])),
    sigS: signatures.map(signature => signature.S),
    pathElements: paths.map(path => path.elements),
    pathIndices: paths.map(path => path.indices)
  }

  const buildDirectory = resolve(argument('--build') || 'circuit/build')
  const outputDirectory = resolve(argument('--output') || 'circuit/build/latest-proof')
  await mkdir(outputDirectory, { recursive: true })
  await writeFile(
    resolve(outputDirectory, 'input.json'),
    JSON.stringify(circuitInput, stringify, 2)
  )

  const { proof, publicSignals } = await groth16.fullProve(
    circuitInput,
    resolve(buildDirectory, 'reserve_coverage_js/reserve_coverage.wasm'),
    resolve(buildDirectory, 'reserve_coverage_final.zkey')
  )
  const verified = await groth16.verify(
    JSON.parse(await readFile(resolve(buildDirectory, 'verification_key.json'), 'utf8')),
    publicSignals,
    proof
  )
  if (!verified) throw new Error('generated proof failed local verification')

  await writeFile(resolve(outputDirectory, 'proof.json'), JSON.stringify(proof, null, 2))
  await writeFile(resolve(outputDirectory, 'public.json'), JSON.stringify(publicSignals, null, 2))

  const calldata = await groth16.exportSolidityCallData(proof, publicSignals)
  const [a, b, c, inputs] = JSON.parse(`[${calldata}]`)
  await writeFile(
    resolve(outputDirectory, 'calldata.json'),
    JSON.stringify({ asset: `0x${assetField.toString(16).padStart(64, '0')}`, a, b, c, inputs }, null, 2)
  )

  const summary = {
    assetId,
    assetField: `0x${assetField.toString(16).padStart(64, '0')}`,
    custodianRoot: `0x${custodianRoot.toString(16).padStart(64, '0')}`,
    tokenSupply: tokenSupply.toString(),
    reserveQuantity: total.toString(),
    covered: covered === 1n,
    timeBound: timeBound.toString(),
    custodianPublicKeys: publicKeys.slice(0, attestations.length).map(([x, y]) => ({
      x: F.toObject(x).toString(),
      y: F.toObject(y).toString()
    })),
    locallyVerified: true,
    calldata: {
      asset: `0x${assetField.toString(16).padStart(64, '0')}`,
      a,
      b,
      c,
      inputs
    }
  }

  if (process.argv.includes('--submit')) {
    const registry = process.env.RESERVE_REGISTRY_ADDRESS
    const privateKey = process.env.DEPLOYER_PRIVATE_KEY
    const rpcUrl = process.env.HASHKEY_RPC_URL || 'https://mainnet.hsk.xyz'
    if (!registry || !privateKey) {
      throw new Error('RESERVE_REGISTRY_ADDRESS and DEPLOYER_PRIVATE_KEY are required for --submit')
    }
    const account = privateKeyToAccount(privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`)
    const wallet = createWalletClient({ account, transport: http(rpcUrl) })
    const publicClient = createPublicClient({ transport: http(rpcUrl) })
    const hash = await wallet.writeContract({
      address: registry,
      abi: parseAbi([
        'function submitProof(bytes32 asset,uint256[2] a,uint256[2][2] b,uint256[2] c,uint256[5] publicInputs)'
      ]),
      functionName: 'submitProof',
      args: [summary.assetField, a, b, c, inputs]
    })
    const receipt = await publicClient.waitForTransactionReceipt({ hash })
    summary.transactionHash = hash
    summary.blockNumber = receipt.blockNumber.toString()
  }

  await writeFile(resolve(outputDirectory, 'summary.json'), JSON.stringify(summary, null, 2))
  process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
