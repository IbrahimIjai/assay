// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IBorrowVerifier} from "../interfaces/IBorrowVerifier.sol";

contract MockBorrowVerifier is IBorrowVerifier {
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
        uint256[7] calldata
    ) external view returns (bool) {
        return accept;
    }
}
