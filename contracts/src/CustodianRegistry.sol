// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title CustodianRegistry
/// @notice Registers custodian EdDSA public keys and the Merkle root used by the ZK reserve circuit.
/// @dev The root is computed off-chain. The contract deliberately does not attempt to implement
///      Poseidon/Merkle construction in the EVM.
contract CustodianRegistry is Ownable {
    struct Custodian {
        uint256 x;
        uint256 y;
        bool active;
    }

    mapping(bytes32 asset => address issuer) public issuerOf;
    mapping(bytes32 asset => Custodian[]) internal _custodians;
    mapping(bytes32 asset => mapping(bytes32 keyHash => bool)) public activeCustodian;
    mapping(bytes32 asset => bytes32) public custodianRoot;

    error NotIssuer();
    error ZeroAsset();
    error ZeroKey();
    error AlreadyRegistered();
    error NotRegistered();

    event AssetIssuerSet(bytes32 indexed asset, address indexed issuer);
    event CustodianRegistered(bytes32 indexed asset, bytes32 indexed keyHash, uint256 x, uint256 y);
    event CustodianRevoked(bytes32 indexed asset, bytes32 indexed keyHash);
    event CustodianRootUpdated(bytes32 indexed asset, bytes32 indexed root);

    constructor(address initialOwner) Ownable(initialOwner) {}

    function setIssuer(bytes32 asset, address issuer) external onlyOwner {
        if (asset == bytes32(0)) revert ZeroAsset();
        issuerOf[asset] = issuer;
        emit AssetIssuerSet(asset, issuer);
    }

    modifier onlyIssuer(bytes32 asset) {
        if (msg.sender != issuerOf[asset]) revert NotIssuer();
        _;
    }

    function registerCustodian(bytes32 asset, uint256 x, uint256 y) external onlyIssuer(asset) {
        if (x == 0 && y == 0) revert ZeroKey();
        bytes32 keyHash = _keyHash(x, y);
        if (activeCustodian[asset][keyHash]) revert AlreadyRegistered();

        activeCustodian[asset][keyHash] = true;
        _custodians[asset].push(Custodian({x: x, y: y, active: true}));
        emit CustodianRegistered(asset, keyHash, x, y);
    }

    function revokeCustodian(bytes32 asset, uint256 x, uint256 y) external onlyIssuer(asset) {
        bytes32 keyHash = _keyHash(x, y);
        if (!activeCustodian[asset][keyHash]) revert NotRegistered();

        activeCustodian[asset][keyHash] = false;
        emit CustodianRevoked(asset, keyHash);
    }

    function setCustodianRoot(bytes32 asset, bytes32 root) external onlyIssuer(asset) {
        if (root == bytes32(0)) revert ZeroKey();
        custodianRoot[asset] = root;
        emit CustodianRootUpdated(asset, root);
    }

    function custodianCount(bytes32 asset) external view returns (uint256) {
        return _custodians[asset].length;
    }

    function custodianAt(bytes32 asset, uint256 index) external view returns (Custodian memory) {
        return _custodians[asset][index];
    }

    function keyHash(uint256 x, uint256 y) external pure returns (bytes32) {
        return _keyHash(x, y);
    }

    function _keyHash(uint256 x, uint256 y) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(x, y));
    }
}
