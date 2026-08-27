// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script} from "forge-std/Script.sol";
import {console2} from "forge-std/console2.sol";
import {CustodianRegistry} from "../src/CustodianRegistry.sol";
import {Groth16Verifier} from "../src/ReserveVerifier.sol";
import {ReserveRegistry} from "../src/ReserveRegistry.sol";
import {AssayCompliance} from "../src/AssayCompliance.sol";
import {ChallengeManager} from "../src/ChallengeManager.sol";
import {VerifiedRwaToken} from "../src/tokens/VerifiedRwaToken.sol";
import {MockStablecoin} from "../src/mocks/MockStablecoin.sol";
import {MockBorrowVerifier} from "../src/mocks/MockBorrowVerifier.sol";
import {ShieldedVault} from "../src/ShieldedVault.sol";
import {LendingPool} from "../src/LendingPool.sol";

contract Deploy is Script {
    function run() external returns (address) {
        uint256 deployerKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address deployer = vm.addr(deployerKey);

        vm.startBroadcast(deployerKey);

        CustodianRegistry registry = new CustodianRegistry(deployer);
        Groth16Verifier reserveVerifier = new Groth16Verifier();
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
        ChallengeManager challenges = new ChallengeManager(deployer);
        usdc.mint(deployer, 1_000_000e6);
        usdc.transfer(address(pool), 100_000e6);

        vm.stopBroadcast();

        console2.log("Groth16Verifier", address(reserveVerifier));
        console2.log("CustodianRegistry", address(registry));
        console2.log("ReserveRegistry", address(reserves));
        console2.log("AssayCompliance", address(compliance));
        console2.log("VerifiedRwaToken", address(silver));
        console2.log("MockStablecoin", address(usdc));
        console2.log("MockBorrowVerifier", address(borrowVerifier));
        console2.log("ShieldedVault", address(vault));
        console2.log("LendingPool", address(pool));
        console2.log("ChallengeManager", address(challenges));

        return address(reserves);
    }
}
