Assay ZK Circuit — Compile, Setup, Prove, Verify

Goal

Generate a Groth16 proof that demonstrates:

registered custodian statements
        +
valid signatures
        +
registered custodian membership
        +
fresh timestamps
        +
reserve quantity >= token supply
        ↓
covered = true

The proof does not prove that the physical custodian statement is truthful. It proves that the supplied signed statements satisfy the circuit constraints.

Canonical circuit path

There are currently two copies of the reserve circuit in the repository:

circuits/
foundry/circuit/

For the hackathon proving commands, use:

foundry/circuit/

because foundry/package.json already contains the circuit tooling scripts.

Keep the root circuits/ copy synchronized if you edit the circuit.

Circuit

Primary circuit:

foundry/circuit/reserve_coverage.circom

Smoke-test circuit:

foundry/circuit/reserve_coverage_math_only.circom

The smoke-test circuit only checks the arithmetic coverage relation and is useful before adding cryptographic signature/Merkle complexity.

Install circuit dependencies

cd foundry
npm install

This installs the repository's pinned circom2, circomlib, and snarkjs dependencies.

Compile full circuit

cd foundry
npm run circuit:compile

Inspect R1CS:

npm run circuit:info

Generated artifacts should appear under:

foundry/circuit/build/

Compile the math-only circuit first

For the fastest sanity check, compile:

cd foundry
./circuit/scripts/prove.sh

If the installed circom2 command is preferred over a globally installed circom, use the npm script directly or invoke the local binary from node_modules.

The repository's current prove.sh only performs the compile stage and tells you where the Powers of Tau file belongs. It does not yet execute the complete setup/prove/export sequence.

Groth16 setup

You need a Powers of Tau file before proving.

For the current circuit configuration, the repository expects:

foundry/circuit/build/pot14_final.ptau

Place a compatible final Powers of Tau file there.

Then run Groth16 setup using snarkjs.

The generic flow is:

cd foundry

snarkjs groth16 setup \
  circuit/build/reserve_coverage.r1cs \
  circuit/build/pot14_final.ptau \
  circuit/build/reserve_coverage_0000.zkey

Contribute randomness:

snarkjs zkey contribute \
  circuit/build/reserve_coverage_0000.zkey \
  circuit/build/reserve_coverage_final.zkey \
  --name="Assay local demo" \
  -e="assay-demo-entropy"

Export verification key:

snarkjs zkey export verificationkey \
  circuit/build/reserve_coverage_final.zkey \
  circuit/build/verification_key.json

Witness generation

The intended input is a JSON witness matching the circuit signals.

Use:

foundry/circuit/input.example.json

The full witness contains private values such as:

quantities

account references

custodian public keys

signatures

Merkle paths

Do not log private witness material in production.

Proving

The generic snarkjs flow is:

snarkjs wtns calculate \
  circuit/build/reserve_coverage_js/reserve_coverage.wasm \
  circuit/input.example.json \
  circuit/build/witness.wtns

Then:

snarkjs groth16 prove \
  circuit/build/reserve_coverage_final.zkey \
  circuit/build/witness.wtns \
  circuit/build/proof.json \
  circuit/build/public.json

Verify locally:

snarkjs groth16 verify \
  circuit/build/verification_key.json \
  circuit/build/public.json \
  circuit/build/proof.json

Expected:

OK!

Generate Solidity verifier

snarkjs zkey export solidityverifier \
  circuit/build/reserve_coverage_final.zkey \
  src/generated/ReserveVerifier.sol

The generated contract should be copied into:

foundry/src/generated/ReserveVerifier.sol

Make sure it implements the interface expected by:

foundry/src/interfaces/IReserveVerifier.sol

Public input order

The Solidity registry expects five public inputs:

[0] assetId
[1] custodianRoot
[2] tokenSupply
[3] timeBound
[4] covered

These must match the circuit's public signals and the ReserveRegistry.submitProof(...) ABI.

Never silently reorder them.

Proof → contract

After proof generation, call:

ReserveRegistry.submitProof(
    asset,
    a,
    b,
    c,
    publicInputs
);

The registry verifies that:

the asset matches

the custodian root matches the registry

the proof verifier accepts the proof

the public inputs are valid

Then it stores the proof status and freshness metadata.

Critical privacy rule

The following stay private/off-chain:

individual quantities
account references
custodian signatures
Merkle paths
witness

The following become public:

proof
asset
custodian root
supply at proof
proof time
coverage boolean
proof hash

Circuit limitation

The circuit establishes consistency with signed custodian evidence.

It does not establish physical truth.

If a trusted custodian signs a false statement, a valid proof can still be generated for that false statement.

This limitation must be stated during the demo.