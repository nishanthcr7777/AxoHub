// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SourceRegistry {
    struct Source {
        string name;
        string version;
        string compiler;
        string license;
        string ipfsCID;
        address submitter;
        uint256 timestamp;
    }

    Source[] private _sources; // <-- Made private (best practice)
    mapping(string => mapping(string => bool)) private _sourceExists;

    // Cache the length to save gas on repeated calls
    uint256 private _totalSources;

    event SourceSubmitted(
        uint256 indexed id,
        string name,
        string version,
        address indexed submitter,
        string ipfsCID
    );

    /// @notice Submit a new source to the registry.
    /// @dev Reverts if the source name + version already exists.
    /// @param _name Name of the source (e.g., "OpenZeppelin Contracts").
    /// @param _version Version string (e.g., "4.9.3").
    /// @param _compiler Compiler version (e.g., "solc-0.8.20").
    /// @param _license SPDX license identifier (e.g., "MIT").
    /// @param _ipfsCID IPFS CID for the source code.
    /// @return id The assigned source ID.
    function submitSource(
        string memory _name,
        string memory _version,
        string memory _compiler,
        string memory _license,
        string memory _ipfsCID
    ) external returns (uint256 id) {
        require(bytes(_name).length > 0, "SourceRegistry: empty name");
        require(bytes(_version).length > 0, "SourceRegistry: empty version");
        require(bytes(_ipfsCID).length > 0, "SourceRegistry: empty IPFS CID");
        require(!_sourceExists[_name][_version], "SourceRegistry: version exists");

        _sources.push(Source({
            name: _name,
            version: _version,
            compiler: _compiler,
            license: _license,
            ipfsCID: _ipfsCID,
            submitter: msg.sender,
            timestamp: block.timestamp
        }));

        _totalSources = _sources.length; // Cache length
        id = _totalSources - 1;
        _sourceExists[_name][_version] = true;

        emit SourceSubmitted(id, _name, _version, msg.sender, _ipfsCID);
    }

    /// @notice Get total number of sources.
    /// @return Total sources in the registry.
    function totalSources() external view returns (uint256) {
        return _totalSources; // Uses cached value (saves gas)
    }

    /// @notice Get a source by its index.
    /// @dev Reverts if the index is out of bounds.
    /// @param _index Index of the source.
    /// @return source The Source struct.
    function getSource(uint256 _index) external view returns (Source memory) {
        require(_index < _totalSources, "SourceRegistry: invalid index");
        return _sources[_index];
    }

    /// @notice Get all sources (for off-chain use).
    /// @dev Warning: Returns entire array (gas-intensive for large datasets).
    /// @return sources Array of all Source structs.
    function getAllSources() external view returns (Source[] memory) {
        return _sources;
    }

    /// @notice Check if a source name + version exists.
    /// @param _name Name of the source.
    /// @param _version Version of the source.
    /// @return exists True if the source exists, false otherwise.
    function sourceExists(string memory _name, string memory _version)
        external
        view
        returns (bool exists)
    {
        return _sourceExists[_name][_version];
    }
}