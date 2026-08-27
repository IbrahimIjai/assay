pragma circom 2.2.0;

include "circomlib/circuits/bitify.circom";
include "circomlib/circuits/comparators.circom";

// Fast smoke-test circuit for the core reserve inequality.
template Coverage(N) {
    signal input quantity[N];
    signal input tokenSupply;
    signal output covered;

    var sum = 0;
    for (var i = 0; i < N; i++) {
        component bits = Num2Bits(64);
        bits.in <== quantity[i];
        sum += quantity[i];
    }

    component ge = GreaterEqThan(128);
    ge.in[0] <== sum;
    ge.in[1] <== tokenSupply;
    covered <== ge.out;
}

component main = Coverage(4);
