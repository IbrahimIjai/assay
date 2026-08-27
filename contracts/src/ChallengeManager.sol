// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title ChallengeManager
/// @notice Minimal dispute bond ledger. The adjudication mechanism is intentionally a separate module.
contract ChallengeManager is Ownable {
    struct Challenge {
        bytes32 asset;
        bytes32 proofHash;
        address challenger;
        uint256 bond;
        bool resolved;
        bool slashed;
    }

    mapping(uint256 id => Challenge) public challenges;
    uint256 public nextId;

    error InvalidBond();
    error AlreadyResolved();

    event Challenged(uint256 indexed id, bytes32 indexed asset, bytes32 proofHash, address challenger, uint256 bond);
    event Resolved(uint256 indexed id, bool slashed);

    constructor(address initialOwner) Ownable(initialOwner) {}

    function openChallenge(bytes32 asset, bytes32 proofHash) external payable returns (uint256 id) {
        if (msg.value == 0) revert InvalidBond();
        id = nextId++;
        challenges[id] = Challenge(asset, proofHash, msg.sender, msg.value, false, false);
        emit Challenged(id, asset, proofHash, msg.sender, msg.value);
    }

    function resolve(uint256 id, bool slash) external onlyOwner {
        Challenge storage c = challenges[id];
        if (c.resolved) revert AlreadyResolved();
        c.resolved = true;
        c.slashed = slash;
        if (slash) payable(owner()).transfer(c.bond);
        else payable(c.challenger).transfer(c.bond);
        emit Resolved(id, slash);
    }
}
