pragma circom 2.2.0;

include "circomlib/circuits/poseidon.circom";
include "circomlib/circuits/mux2.circom";
include "circomlib/circuits/eddsaposeidon.circom";
include "circomlib/circuits/bitify.circom";
include "circomlib/circuits/comparators.circom";

// Poseidon Merkle inclusion for a fixed-depth tree.
template MerklePath(DEPTH) {
    signal input leaf;
    signal input pathElements[DEPTH];
    signal input pathIndices[DEPTH];
    signal output root;

    component h[DEPTH];
    signal current[DEPTH + 1];
    signal left[DEPTH];
    signal right[DEPTH];
    current[0] <== leaf;

    for (var i = 0; i < DEPTH; i++) {
        pathIndices[i] * (1 - pathIndices[i]) === 0;
        // pathIndices = 0 => current is left; 1 => current is right.
        left[i] <== current[i] + pathIndices[i] * (pathElements[i] - current[i]);
        right[i] <== pathElements[i] + pathIndices[i] * (current[i] - pathElements[i]);

        h[i] = Poseidon(2);
        h[i].inputs[0] <== left[i];
        h[i].inputs[1] <== right[i];
        current[i + 1] <== h[i].out;
    }

    root <== current[DEPTH];
}

// Proves that the sum of active custodian-signed quantities is >= tokenSupply.
//
// Public:
//   assetId, custodianRoot, tokenSupply, timeBound, covered
// Private:
//   quantities, account refs, timestamps, EdDSA keys/signatures, Merkle paths.
//
// N is fixed for predictable proving cost. PAD inactive slots with active[i] = 0.
template ReserveCoverage(N, DEPTH) {
    // public inputs
    signal input assetId;
    signal input custodianRoot;
    signal input tokenSupply;
    signal input timeBound;
    signal input covered;

    // private witness
    signal input active[N];
    signal input quantity[N];
    signal input accountRef[N];
    signal input asOf[N];
    signal input pubKeyX[N];
    signal input pubKeyY[N];
    signal input sigR8x[N];
    signal input sigR8y[N];
    signal input sigS[N];
    signal input pathElements[N][DEPTH];
    signal input pathIndices[N][DEPTH];

    component quantityBits[N];
    component freshnessBits[N];
    component signatures[N];
    component keyHashers[N];
    component paths[N];
    component attestationHashers[N];

    var sum = 0;

    for (var i = 0; i < N; i++) {
        // Active slots are boolean. Inactive slots must contribute zero quantity.
        active[i] * (1 - active[i]) === 0;
        quantity[i] * (1 - active[i]) === 0;

        // Prevent accidental field aliasing for normal demo quantities.
        quantityBits[i] = Num2Bits(64);
        quantityBits[i].in <== quantity[i];

        // asOf >= timeBound when the slot is active.
        freshnessBits[i] = GreaterEqThan(64);
        freshnessBits[i].in[0] <== asOf[i];
        freshnessBits[i].in[1] <== timeBound;
        active[i] * (1 - freshnessBits[i].out) === 0;

        // Attestation is bound to this exact asset/quantity/account/timestamp tuple.
        attestationHashers[i] = Poseidon(4);
        attestationHashers[i].inputs[0] <== assetId;
        attestationHashers[i].inputs[1] <== quantity[i];
        attestationHashers[i].inputs[2] <== accountRef[i];
        attestationHashers[i].inputs[3] <== asOf[i];

        // A disabled signature verifier is a no-op for padding slots.
        signatures[i] = EdDSAPoseidonVerifier();
        signatures[i].enabled <== active[i];
        signatures[i].Ax <== pubKeyX[i];
        signatures[i].Ay <== pubKeyY[i];
        signatures[i].S <== sigS[i];
        signatures[i].R8x <== sigR8x[i];
        signatures[i].R8y <== sigR8y[i];
        signatures[i].M <== attestationHashers[i].out;

        // Custodian leaf = Poseidon(pubKeyX, pubKeyY).
        keyHashers[i] = Poseidon(2);
        keyHashers[i].inputs[0] <== pubKeyX[i];
        keyHashers[i].inputs[1] <== pubKeyY[i];

        paths[i] = MerklePath(DEPTH);
        paths[i].leaf <== keyHashers[i].out;
        for (var j = 0; j < DEPTH; j++) {
            paths[i].pathElements[j] <== pathElements[i][j];
            paths[i].pathIndices[j] <== pathIndices[i][j];
        }

        // An inactive slot gets a dummy path root of 0/ignored signature. For an active slot,
        // membership must match the registered custodian root.
        active[i] * (paths[i].root - custodianRoot) === 0;

        sum += quantity[i];
    }

    // covered must be a boolean and must mean exactly sum >= tokenSupply.
    covered * (1 - covered) === 0;
    component coverage = GreaterEqThan(128);
    coverage.in[0] <== sum;
    coverage.in[1] <== tokenSupply;
    covered === coverage.out;
}

component main {public [assetId, custodianRoot, tokenSupply, timeBound, covered]} = ReserveCoverage(4, 4);
