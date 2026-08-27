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
    uint256 internal constant HASHKEY_MAINNET_CHAIN_ID = 177;
    uint256 internal constant SNARK_SCALAR_FIELD =
        21888242871839275222246405745257275088548364400416034343698204186575808495617;
    bytes32 internal constant DEMO_CUSTODIAN_ROOT =
        0x2950e2d1598627a6578b0b13b544392f71abb8071da4afd570134d001cb5c650;

    function run() external returns (address) {
        require(block.chainid == HASHKEY_MAINNET_CHAIN_ID, "HashKey mainnet only");

        uint256 deployerKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address deployer = vm.addr(deployerKey);

        vm.startBroadcast(deployerKey);

        CustodianRegistry registry = new CustodianRegistry(deployer);
        Groth16Verifier reserveVerifier = new Groth16Verifier();
        // Circuit public inputs must be inside the BN254 scalar field.
        bytes32 asset = bytes32(uint256(keccak256("SILVER-001")) % SNARK_SCALAR_FIELD);
        registry.setIssuer(asset, deployer);
        registry.registerCustodian(
            asset,
            13647726390646517558822104200117493537768566638253656741753015264393211448507,
            21152880908706062036554489157898633771599456459236945572594692047806474527861
        );
        registry.registerCustodian(
            asset,
            14198199294725610549674106479456880216468883172112898726097291059916030615716,
            3692538201424181923218784982638569008463896421261532904627695962790490819212
        );
        registry.registerCustodian(
            asset,
            15850234131497396140276928696694876600799868362467534769232687914171541564610,
            11926323001508430286153713867978684930565627159529794474357719939347827707323
        );
        registry.setCustodianRoot(asset, DEMO_CUSTODIAN_ROOT);

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

        MockStablecoin usdc = new MockStablecoin(deployer);
        MockBorrowVerifier borrowVerifier = new MockBorrowVerifier(deployer, true);
        LendingPool pool = new LendingPool(deployer, usdc, reserves);
        ShieldedVault vault = new ShieldedVault(deployer, pool, reserves, borrowVerifier);
        vault.setAssetToken(asset, silver);
        pool.setLoanManager(address(vault));
        ChallengeManager challenges = new ChallengeManager(deployer);
        usdc.mint(deployer, 1_000_000e6);
        usdc.approve(address(pool), 100_000e6);
        pool.supply(100_000e6);

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
