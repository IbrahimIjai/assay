// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @dev Future generated verifier adapter for the private borrowing circuit.
interface IBorrowVerifier {
    function verifyProof(
        uint256[2] calldata a,
        uint256[2][2] calldata b,
        uint256[2] calldata c,
        uint256[7] calldata publicInputs
    ) external view returns (bool);
}
