// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/// @title PackageRegistry - A decentralized registry for smart contract packages.
/// @notice Allows publishing and retrieving package metadata (name, version, IPFS CIDs, contract address).
contract PackageRegistry is Ownable {
    uint256 private _packageCount;
    address private _lastPublisher;

    /// @dev Struct representing a published package.
    struct Package {
        string name;            // Human-readable package name (e.g., "ERC20")
        string version;         // Semantic version (e.g., "1.0.0")
        string ipfsMetadataCid; // IPFS CID for metadata (JSON with description, docs, etc.)
        string ipfsAbiCid;      // IPFS CID for contract ABI (interface definition)
        address contractAddress; // Deployed contract address (must not be zero)
        address publisher;      // EOA or contract that published the package
        uint256 timestamp;      // Unix timestamp of publication
    }

    /// @dev Mapping from package ID to Package struct.
    mapping(uint256 => Package) private _packages;

    /// @dev Emitted when a new package is published.
    event PackagePublished(
        uint256 indexed id,
        string name,
        string version,
        address indexed publisher,
        address indexed contractAddress,
        string ipfsMetadataCid,
        string ipfsAbiCid,
        uint256 timestamp
    );
    constructor() Ownable(msg.sender) {}
    /// @dev Constructor initializes the contract owner.
   
    /// @notice Publishes a new package to the registry.
    /// @dev Reverts if:
    ///      - `contractAddress` is zero.
    ///      - `name` or `version` is empty.
    ///      - IPFS CIDs are empty (optional, but recommended for usability).
    /// @param name Human-readable package name.
    /// @param version Semantic version string.
    /// @param contractAddress Deployed contract address.
    /// @param ipfsMetadataCid IPFS CID for metadata.
    /// @param ipfsAbiCid IPFS CID for ABI.
    /// @return id The assigned package ID.
    function publishPackage(
        string memory name,
        string memory version,
        address contractAddress,
        string memory ipfsMetadataCid,
        string memory ipfsAbiCid
    )
        external
        returns (uint256 id)
    {
        require(contractAddress != address(0), "PackageRegistry: zero address");
        require(bytes(name).length > 0, "PackageRegistry: empty name");
        require(bytes(version).length > 0, "PackageRegistry: empty version");

        _packageCount++;
        _packages[_packageCount] = Package({
            name: name,
            version: version,
            ipfsMetadataCid: ipfsMetadataCid,
            ipfsAbiCid: ipfsAbiCid,
            contractAddress: contractAddress,
            publisher: msg.sender,
            timestamp: block.timestamp
        });

        _lastPublisher = msg.sender;
        emit PackagePublished(
            _packageCount,
            name,
            version,
            msg.sender,
            contractAddress,
            ipfsMetadataCid,
            ipfsAbiCid,
            block.timestamp
        );
        return _packageCount;
    }

    /// @notice Retrieves a package by its ID.
    /// @dev Reverts if the ID is invalid (zero or exceeds `_packageCount`).
    /// @param id The package ID.
    /// @return pkg The Package struct.
    function getPackage(uint256 id)
        external
        view
        returns (Package memory pkg)
    {
        require(id > 0 && id <= _packageCount, "PackageRegistry: invalid ID");
        return _packages[id];
    }

    /// @notice Returns the total number of published packages.
    /// @return count Total packages.
    function totalPackages()
        external
        view
        returns (uint256 count)
    {
        return _packageCount;
    }

    /// @notice Returns the address of the last publisher.
    /// @return publisher Address of the last publisher.
    function lastPublisher()
        external
        view
        returns (address publisher)
    {
        return _lastPublisher;
    }
}