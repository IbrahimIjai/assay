// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {CustodianRegistry} from "../src/CustodianRegistry.sol";
import {MockReserveVerifier} from "../src/mocks/MockReserveVerifier.sol";
import {ReserveRegistry} from "../src/ReserveRegistry.sol";
import {AssayCompliance} from "../src/AssayCompliance.sol";
import {VerifiedRwaToken} from "../src/tokens/VerifiedRwaToken.sol";

contract ReserveRegistryTest is Test {
    CustodianRegistry registry;
    MockReserveVerifier verifier;
    ReserveRegistry reserves;
    AssayCompliance compliance;
    VerifiedRwaToken silver;
    bytes32 asset = keccak256("SILVER-001");

    function setUp() external {
        registry = new CustodianRegistry(address(this));
        verifier = new MockReserveVerifier(true);
        registry.setIssuer(asset, address(this));
        registry.setCustodianRoot(asset, bytes32(uint256(1234)));
        reserves = new ReserveRegistry(address(this), registry, address(verifier), 1 days);
        compliance = new AssayCompliance(address(this), reserves, asset);
        silver = new VerifiedRwaToken(address(this), "Verified Silver", "vSILVER", compliance, asset);
        compliance.setToken(address(silver));
    }

    function testMintBlockedUntilReserveProofExists() external {
        vm.expectRevert(AssayCompliance.ReserveNotFresh.selector);
        silver.mint(address(this), 1e18);
    }

    function testMintWorksAfterVerifiedFreshProof() external {
        uint256[2] memory a;
        uint256[2][2] memory b;
        uint256[2] memory c;
        uint256[5] memory pub = [
            uint256(asset),
            uint256(bytes32(uint256(1234))),
            uint256(4_000e18),
            uint256(block.timestamp),
            uint256(1)
        ];

        reserves.submitProof(asset, a, b, c, pub);
        silver.mint(address(this), 1e18);
        assertEq(silver.totalSupply(), 1e18);
    }

    function testMintCannotExceedSupplyCoveredByProof() external {
        uint256[2] memory a;
        uint256[2][2] memory b;
        uint256[2] memory c;
        uint256[5] memory pub = [
            uint256(asset),
            uint256(bytes32(uint256(1234))),
            uint256(100),
            uint256(block.timestamp),
            uint256(1)
        ];

        reserves.submitProof(asset, a, b, c, pub);
        silver.mint(address(this), 100);
        vm.expectRevert(AssayCompliance.ProvenSupplyExceeded.selector);
        silver.mint(address(this), 1);
    }

    function testMintBlockedWhenCoverageFails() external {
        verifier.setAccept(true);
        uint256[2] memory a;
        uint256[2][2] memory b;
        uint256[2] memory c;
        uint256[5] memory pub = [
            uint256(asset),
            uint256(bytes32(uint256(1234))),
            uint256(5_000e18),
            uint256(block.timestamp),
            uint256(0)
        ];

        reserves.submitProof(asset, a, b, c, pub);
        vm.expectRevert(AssayCompliance.ReserveNotCovered.selector);
        silver.mint(address(this), 1e18);
    }

    function testStaleProofBlocksMint() external {
        uint256[2] memory a;
        uint256[2][2] memory b;
        uint256[2] memory c;
        uint256[5] memory pub = [
            uint256(asset),
            uint256(bytes32(uint256(1234))),
            uint256(4_000e18),
            uint256(block.timestamp),
            uint256(1)
        ];
        reserves.submitProof(asset, a, b, c, pub);
        vm.warp(block.timestamp + 1 days + 1);
        vm.expectRevert(AssayCompliance.ReserveNotFresh.selector);
        silver.mint(address(this), 1e18);
    }
}
