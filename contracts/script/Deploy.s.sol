// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script} from "forge-std/Script.sol";
import {CustodianRegistry} from "../src/CustodianRegistry.sol";
import {MockReserveVerifier} from "../src/mocks/MockReserveVerifier.sol";
import {ReserveRegistry} from "../src/ReserveRegistry.sol";
import {AssayCompliance} from "../src/AssayCompliance.sol";
import {VerifiedRwaToken} from "../src/tokens/VerifiedRwaToken.sol";
import {MockStablecoin} from "../src/mocks/MockStablecoin.sol";
import {MockBorrowVerifier} from "../src/mocks/MockBorrowVerifier.sol";
import {ShieldedVault} from "../src/ShieldedVault.sol";
import {LendingPool} from "../src/LendingPool.sol";

contract Deploy is Script {
    function run() external returns (address) {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerKey);

        vm.startBroadcast(deployerKey);

        CustodianRegistry registry = new CustodianRegistry(deployer);
        MockReserveVerifier reserveVerifier = new MockReserveVerifier(true);
        bytes32 asset = keccak256("SILVER-001");
        registry.setIssuer(asset, deployer);

        ReserveRegistry reserves = new ReserveRegistry(deployer, registry, address(reserveVerifier), 1 days);
        AssayCompliance compliance = new AssayCompliance(deployer, reserves, asset);
        VerifiedRwaToken silver = new VerifiedRwaToken(
            deployer,
            "Verified Silver",
            "vSILVER",
            compliance,
            asset
        );
        compliance.setToken(address(silver));

        MockStablecoin usdc = new MockStablecoin();
        MockBorrowVerifier borrowVerifier = new MockBorrowVerifier(true);
        ShieldedVault vault = new ShieldedVault(deployer, usdc, reserves, borrowVerifier);
        vault.setAssetToken(asset, silver);

        LendingPool pool = new LendingPool(deployer, usdc, reserves);
        usdc.mint(deployer, 1_000_000e6);
        usdc.transfer(address(pool), 100_000e6);

        vm.stopBroadcast();
        return address(reserves);
    }
}
