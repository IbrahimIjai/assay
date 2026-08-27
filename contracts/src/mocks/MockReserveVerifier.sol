// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IReserveVerifier} from "../interfaces/IReserveVerifier.sol";

/// @notice Test-only verifier. It treats publicInputs[4] as the expected coverage result.
contract MockReserveVerifier is IReserveVerifier {
    bool public accept;

    constructor(bool accept_) {
        accept = accept_;
    }

    function setAccept(bool accept_) external {
        accept = accept_;
    }

    function verifyProof(
        uint256[2] calldata,
        uint256[2][2] calldata,
        uint256[2] calldata,
        uint256[5] calldata
    ) external view returns (bool) {
        return accept;
    }
}
