// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {CustodianRegistry} from "../src/CustodianRegistry.sol";
import {ReserveRegistry} from "../src/ReserveRegistry.sol";
import {AssayCompliance} from "../src/AssayCompliance.sol";
import {VerifiedRwaToken} from "../src/tokens/VerifiedRwaToken.sol";
import {MockReserveVerifier} from "../src/mocks/MockReserveVerifier.sol";
import {MockBorrowVerifier} from "../src/mocks/MockBorrowVerifier.sol";
import {MockStablecoin} from "../src/mocks/MockStablecoin.sol";
import {LendingPool} from "../src/LendingPool.sol";
import {ShieldedVault} from "../src/ShieldedVault.sol";

contract LendingFlowTest is Test {
    bytes32 internal asset = bytes32(uint256(77));
    address internal borrower = address(0xB0B);
    address internal payout = address(0xCAFE);

    VerifiedRwaToken internal silver;
    MockStablecoin internal stablecoin;
    LendingPool internal pool;
    ShieldedVault internal vault;

    function setUp() public {
        CustodianRegistry custodians = new CustodianRegistry(address(this));
        custodians.setIssuer(asset, address(this));
        custodians.setCustodianRoot(asset, bytes32(uint256(1234)));
        MockReserveVerifier reserveVerifier = new MockReserveVerifier(true);
        ReserveRegistry reserves =
            new ReserveRegistry(address(this), custodians, address(reserveVerifier), 1 days);
        AssayCompliance compliance = new AssayCompliance(address(this), reserves, asset);
        silver = new VerifiedRwaToken(
            address(this), "Verified Silver", "vSILVER", compliance, asset
        );
        compliance.setToken(address(silver));

        uint256[2] memory a;
        uint256[2][2] memory b;
        uint256[2] memory c;
        uint256[5] memory publicInputs = [
            uint256(asset),
            uint256(bytes32(uint256(1234))),
            uint256(4_000e18),
            block.timestamp,
            uint256(1)
        ];
        reserves.submitProof(asset, a, b, c, publicInputs);

        stablecoin = new MockStablecoin(address(this));
        pool = new LendingPool(address(this), stablecoin, reserves);
        MockBorrowVerifier borrowVerifier = new MockBorrowVerifier(address(this), true);
        vault = new ShieldedVault(address(this), pool, reserves, borrowVerifier);
        pool.setLoanManager(address(vault));
        vault.setAssetToken(asset, silver);

        stablecoin.mint(address(this), 100_000e6);
        stablecoin.approve(address(pool), 100_000e6);
        pool.supply(100_000e6);
        silver.mint(borrower, 1_000e18);
    }

    function testDepositBorrowAndRepayReturnsCollateral() public {
        bytes32 commitment = bytes32(uint256(555));
        vm.startPrank(borrower);
        silver.approve(address(vault), 1_000e18);
        vault.deposit(asset, 1_000e18, commitment);

        uint256[2] memory a;
        uint256[2][2] memory b;
        uint256[2] memory c;
        uint256[7] memory inputs;
        inputs[3] = 1;
        inputs[4] = 24_000e6;
        inputs[5] = 999;
        inputs[6] = uint256(commitment);
        bytes32 loanId = vault.borrow(
            asset, a, b, c, inputs, payout, uint64(block.timestamp + 30 days)
        );
        vm.stopPrank();

        assertEq(stablecoin.balanceOf(payout), 24_000e6);
        assertEq(pool.totalDebt(), 24_000e6);

        vm.startPrank(payout);
        stablecoin.approve(address(vault), 24_000e6);
        vault.repay(loanId, 24_000e6);
        vm.stopPrank();

        assertEq(pool.totalDebt(), 0);
        assertEq(silver.balanceOf(borrower), 1_000e18);
    }
}
