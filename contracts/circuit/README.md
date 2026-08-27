# Reserve coverage circuit

`reserve_coverage.circom` is the first proving target for the Assay/Verity MVP. It follows the protocol draft: custodian-signed reserve attestations are private witness data; the proof exposes only the asset, custodian-set root, token supply, time bound and coverage result.

The circuit uses Circom 2 and circomlib's Poseidon + EdDSA-Poseidon primitives. Circom 2.2.3 is the upstream compiler release used by the repo tooling, while this circuit declares compatibility with 2.2.x. `circomlib` provides the reusable circuit templates. citeturn905599search5turn764543search0

## Compile

```bash
npm install
mkdir -p circuit/build
npm run circuit:compile
npm run circuit:info
```

## Groth16 setup / verifier generation

The repo intentionally does **not** commit a `.ptau`/`.zkey` or generated verifier. The standard flow is:

```bash
snarkjs powersoftau new bn128 14 circuit/ptau/pot14_0000.ptau -v
snarkjs powersoftau prepare phase2 circuit/ptau/pot14_0000.ptau circuit/ptau/pot14_final.ptau -v
snarkjs groth16 setup circuit/build/reserve_coverage.r1cs circuit/ptau/pot14_final.ptau circuit/build/reserve_coverage_0000.zkey
snarkjs zkey contribute circuit/build/reserve_coverage_0000.zkey circuit/build/reserve_coverage_final.zkey --name="Assay demo" -v
snarkjs zkey export verificationkey circuit/build/reserve_coverage_final.zkey circuit/build/verification_key.json
snarkjs zkey export solidityverifier circuit/build/reserve_coverage_final.zkey src/ReserveVerifier.sol
```

The handwritten contract layer talks to that generated verifier via `IReserveVerifier`.

## Important MVP boundary

The circuit proves **consistency of signed statements**, not physical truth. If a registered custodian signs false data, the proof is still valid. This is an oracle/trust problem and should stay explicit in the product documentation.
