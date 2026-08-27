// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {AssayCompliance} from "../AssayCompliance.sol";

/// @title VerifiedRwaToken
/// @notice Minimal demo RWA token whose mint path is enforced by AssayCompliance.
contract VerifiedRwaToken is ERC20, Ownable {
    AssayCompliance public immutable compliance;
    bytes32 public immutable asset;

    error ComplianceRejected();

    constructor(
        address initialOwner,
        string memory name_,
        string memory symbol_,
        AssayCompliance compliance_,
        bytes32 assetId
    ) ERC20(name_, symbol_) Ownable(initialOwner) {
        compliance = compliance_;
        asset = assetId;
    }

    function mint(address to, uint256 amount) external onlyOwner {
        compliance.created(to, amount);
        _mint(to, amount);
    }

    function transfer(address to, uint256 amount) public override returns (bool) {
        if (!compliance.canTransfer(msg.sender, to, amount)) revert ComplianceRejected();
        return super.transfer(to, amount);
    }

    function transferFrom(address from, address to, uint256 amount) public override returns (bool) {
        if (!compliance.canTransfer(from, to, amount)) revert ComplianceRejected();
        return super.transferFrom(from, to, amount);
    }
}
