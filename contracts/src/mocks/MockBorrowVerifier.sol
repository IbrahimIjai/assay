// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IBorrowVerifier} from "../interfaces/IBorrowVerifier.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract MockBorrowVerifier is IBorrowVerifier, Ownable {
    bool public accept;

    constructor(address initialOwner, bool accept_) Ownable(initialOwner) {
        accept = accept_;
    }

    function setAccept(bool accept_) external onlyOwner {
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
