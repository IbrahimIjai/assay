// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReserveRegistry} from "./ReserveRegistry.sol";

/// @title LendingPool
/// @notice Simple stablecoin pool for the hackathon demo. It intentionally does not pretend to be a
///         production interest-bearing ERC-4626 implementation.
contract LendingPool is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    IERC20 public immutable asset;
    ReserveRegistry public immutable reserves;
    uint256 public totalShares;
    uint256 public totalDebt;

    mapping(address account => uint256 shares) public sharesOf;

    error InsufficientLiquidity();
    error InsufficientShares();

    event Supplied(address indexed account, uint256 amount, uint256 shares);
    event Withdrawn(address indexed account, uint256 amount, uint256 shares);
    event DebtRecorded(bytes32 indexed rwaAsset, uint256 amount);

    constructor(address initialOwner, IERC20 stablecoin, ReserveRegistry reserves_) Ownable(initialOwner) {
        asset = stablecoin;
        reserves = reserves_;
    }

    function supply(uint256 amount) external nonReentrant returns (uint256 shares) {
        shares = totalShares == 0 || totalLiquidity() == 0 ? amount : (amount * totalShares) / totalLiquidity();
        asset.safeTransferFrom(msg.sender, address(this), amount);
        totalShares += shares;
        sharesOf[msg.sender] += shares;
        emit Supplied(msg.sender, amount, shares);
    }

    function withdraw(uint256 shares) external nonReentrant returns (uint256 amount) {
        if (shares == 0 || sharesOf[msg.sender] < shares) revert InsufficientShares();
        amount = (shares * totalLiquidity()) / totalShares;
        if (asset.balanceOf(address(this)) < amount) revert InsufficientLiquidity();
        sharesOf[msg.sender] -= shares;
        totalShares -= shares;
        asset.safeTransfer(msg.sender, amount);
        emit Withdrawn(msg.sender, amount, shares);
    }

    function recordDebt(bytes32 rwaAsset, uint256 amount) external onlyOwner {
        ReserveRegistry.Attestation memory a = reserves.latest(rwaAsset);
        if (!a.covered || !reserves.isFresh(rwaAsset)) revert InsufficientLiquidity();
        totalDebt += amount;
        emit DebtRecorded(rwaAsset, amount);
    }

    function totalLiquidity() public view returns (uint256) {
        return asset.balanceOf(address(this));
    }

    function utilisation() external view returns (uint256) {
        uint256 liquid = totalLiquidity();
        if (liquid + totalDebt == 0) return 0;
        return (totalDebt * 1e18) / (liquid + totalDebt);
    }

    function maxLTV(bytes32 rwaAsset) external view returns (uint256) {
        ReserveRegistry.Attestation memory a = reserves.latest(rwaAsset);
        if (!a.covered || !reserves.isFresh(rwaAsset)) return 0;
        return 7000; // 70.00% demo cap; production should be governance/oracle driven.
    }
}
