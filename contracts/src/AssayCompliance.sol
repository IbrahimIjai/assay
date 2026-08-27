// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ICompliance} from "./interfaces/ICompliance.sol";
import {ReserveRegistry} from "./ReserveRegistry.sol";

/// @title AssayCompliance
/// @notice ERC-3643-style compliance adapter whose issuance gate is the reserve proof registry.
/// @dev This is a focused hackathon adapter, not a full ERC-3643 implementation.
contract AssayCompliance is Ownable, ICompliance {
    ReserveRegistry public immutable reserves;
    bytes32 public immutable asset;
    address public token;

    error NotToken();
    error InvalidToken();
    error ReserveNotFresh();
    error ReserveNotCovered();

    event TokenBound(address indexed token);

    constructor(address initialOwner, ReserveRegistry registry, bytes32 assetId) Ownable(initialOwner) {
        reserves = registry;
        asset = assetId;
    }

    function setToken(address tokenAddress) external onlyOwner {
        if (tokenAddress == address(0)) revert InvalidToken();
        token = tokenAddress;
        emit TokenBound(tokenAddress);
    }

    function created(address, uint256) external view override {
        if (msg.sender != token) revert NotToken();
        if (!reserves.isFresh(asset)) revert ReserveNotFresh();
        if (!reserves.getLatest(asset).covered) revert ReserveNotCovered();
    }

    function canTransfer(address, address, uint256) external view override returns (bool) {
        return reserves.isFresh(asset) && reserves.getLatest(asset).covered;
    }
}
