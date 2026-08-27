// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IReserveVerifier} from "./interfaces/IReserveVerifier.sol";
import {CustodianRegistry} from "./CustodianRegistry.sol";

/// @title ReserveRegistry
/// @notice Public registry of zero-knowledge-backed RWA coverage attestations.
contract ReserveRegistry is Ownable {
    struct Attestation {
        bool covered;
        uint64 asOf;
        uint256 supplyAtProof;
        bytes32 proofHash;
    }

    // Public input layout for reserve_coverage:
    // [0] assetId
    // [1] custodianRoot
    // [2] tokenSupply
    // [3] timeBound
    // [4] covered
    uint256 internal constant PUBLIC_INPUTS = 5;

    uint64 public immutable maxAge;
    CustodianRegistry public immutable custodians;
    IReserveVerifier public verifier;

    mapping(bytes32 asset => Attestation) public latest;
    mapping(bytes32 asset => uint256[]) private _proofHistory;

    error InvalidVerifier();
    error InvalidPublicInputs();
    error InvalidProof();
    error ZeroAsset();
    error FutureProof();
    error NotFresh();

    event VerifierUpdated(address indexed verifier);
    event ProofAccepted(
        bytes32 indexed asset,
        bool covered,
        uint64 indexed asOf,
        uint256 supplyAtProof,
        bytes32 proofHash
    );

    constructor(address initialOwner, CustodianRegistry registry, address reserveVerifier, uint64 _maxAge)
        Ownable(initialOwner)
    {
        if (reserveVerifier == address(0)) revert InvalidVerifier();
        custodians = registry;
        verifier = IReserveVerifier(reserveVerifier);
        maxAge = _maxAge;
    }

    function setVerifier(address newVerifier) external onlyOwner {
        if (newVerifier == address(0)) revert InvalidVerifier();
        verifier = IReserveVerifier(newVerifier);
        emit VerifierUpdated(newVerifier);
    }

    function submitProof(
        bytes32 asset,
        uint256[2] calldata a,
        uint256[2][2] calldata b,
        uint256[2] calldata c,
        uint256[5] calldata publicInputs
    ) external {
        if (asset == bytes32(0)) revert ZeroAsset();
        if (bytes32(publicInputs[0]) != asset) revert InvalidPublicInputs();
        if (bytes32(publicInputs[1]) != custodians.custodianRoot(asset)) revert InvalidPublicInputs();

        uint256 supply = publicInputs[2];
        uint256 timeBound = publicInputs[3];
        bool covered = publicInputs[4] == 1;
        if (publicInputs[4] > 1) revert InvalidPublicInputs();
        if (timeBound > block.timestamp) revert FutureProof();
        if (covered == false && supply == 0) revert InvalidPublicInputs();

        bool ok = verifier.verifyProof(a, b, c, publicInputs);
        if (!ok) revert InvalidProof();

        bytes32 proofHash = keccak256(abi.encode(a, b, c, publicInputs));
        latest[asset] = Attestation({
            covered: covered,
            asOf: uint64(timeBound),
            supplyAtProof: supply,
            proofHash: proofHash
        });
        _proofHistory[asset].push(uint256(proofHash));

        emit ProofAccepted(asset, covered, uint64(timeBound), supply, proofHash);
    }

    function isFresh(bytes32 asset) public view returns (bool) {
        Attestation memory a = latest[asset];
        if (a.asOf == 0) return false;
        if (block.timestamp < a.asOf) return false;
        return block.timestamp - a.asOf <= maxAge;
    }

    function getLatest(bytes32 asset) external view returns (Attestation memory) {
        return latest[asset];
    }

    function coverageStatus(bytes32 asset) external view returns (uint8) {
        Attestation memory a = latest[asset];
        if (!isFresh(asset)) return 1;
        if (!a.covered) return 2;
        return 0;
    }

    function proofCount(bytes32 asset) external view returns (uint256) {
        return _proofHistory[asset].length;
    }

    function proofAt(bytes32 asset, uint256 index) external view returns (bytes32) {
        return bytes32(_proofHistory[asset][index]);
    }
}
