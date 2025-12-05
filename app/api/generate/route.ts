import { NextResponse } from "next/server"
import { GeminiService } from "@/lib/gemini/service"

// Mock data for demo purposes
const getMockResponse = (prompt: string) => {
    const lowerPrompt = prompt.toLowerCase()

    if (lowerPrompt.includes("erc20") || lowerPrompt.includes("token")) {
        return {
            code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MyToken
 * @dev ERC20 Token with minting and burning capabilities
 */
contract MyToken is ERC20, Ownable {
    uint256 public constant MAX_SUPPLY = 1_000_000 * 10**18;
    
    constructor(address initialOwner) 
        ERC20("MyToken", "MTK") 
        Ownable(initialOwner) 
    {
        _mint(initialOwner, 1_000_000 * 10**decimals());
    }
    
    /**
     * @dev Mint new tokens (only owner)
     * @param to Address to receive tokens
     * @param amount Amount of tokens to mint
     */
    function mint(address to, uint256 amount) public onlyOwner {
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds max supply");
        _mint(to, amount);
    }
    
    /**
     * @dev Burn tokens from caller's balance
     * @param amount Amount of tokens to burn
     */
    function burn(uint256 amount) public {
        _burn(msg.sender, amount);
    }
}`,
            explanation: "This is a secure ERC20 token implementation using OpenZeppelin contracts. Key features include: (1) Fixed maximum supply of 1 million tokens to prevent unlimited inflation, (2) Owner-only minting function with supply cap validation, (3) Public burn function allowing anyone to burn their own tokens, (4) Inherits from OpenZeppelin's audited ERC20 and Ownable contracts for security, (5) Uses Solidity 0.8.20 for built-in overflow protection."
        }
    }

    if (lowerPrompt.includes("nft") || lowerPrompt.includes("erc721")) {
        return {
            code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title MyNFT
 * @dev ERC721 NFT with minting and metadata storage
 */
contract MyNFT is ERC721, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    
    uint256 public constant MAX_SUPPLY = 10000;
    
    constructor(address initialOwner) 
        ERC721("MyNFT", "MNFT") 
        Ownable(initialOwner) 
    {}
    
    /**
     * @dev Mint a new NFT
     * @param recipient Address to receive the NFT
     * @param tokenURI Metadata URI for the NFT
     */
    function mintNFT(address recipient, string memory tokenURI)
        public
        onlyOwner
        returns (uint256)
    {
        require(_tokenIds.current() < MAX_SUPPLY, "Max supply reached");
        
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        
        _mint(recipient, newItemId);
        _setTokenURI(newItemId, tokenURI);
        
        return newItemId;
    }
    
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}`,
            explanation: "This is a complete ERC721 NFT implementation with the following features: (1) Token URI storage for metadata links (images, attributes, etc.), (2) Max supply cap of 10,000 NFTs to create scarcity, (3) Owner-only minting with supply validation, (4) Auto-incrementing token IDs using OpenZeppelin's Counter utility, (5) Full ERC721 compliance with metadata extension support. Built on OpenZeppelin's audited contracts for maximum security."
        }
    }

    if (lowerPrompt.includes("multisig") || lowerPrompt.includes("multi-sig")) {
        return {
            code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title MultiSigWallet
 * @dev Multi-signature wallet requiring multiple approvals for transactions
 */
contract MultiSigWallet {
    event Deposit(address indexed sender, uint256 amount);
    event SubmitTransaction(uint256 indexed txId);
    event ApproveTransaction(address indexed owner, uint256 indexed txId);
    event ExecuteTransaction(uint256 indexed txId);
    
    address[] public owners;
    mapping(address => bool) public isOwner;
    uint256 public required;
    
    struct Transaction {
        address to;
        uint256 value;
        bytes data;
        bool executed;
        uint256 approvals;
    }
    
    Transaction[] public transactions;
    mapping(uint256 => mapping(address => bool)) public approved;
    
    modifier onlyOwner() {
        require(isOwner[msg.sender], "Not owner");
        _;
    }
    
    constructor(address[] memory _owners, uint256 _required) {
        require(_owners.length > 0, "Owners required");
        require(_required > 0 && _required <= _owners.length, "Invalid required");
        
        for (uint256 i = 0; i < _owners.length; i++) {
            address owner = _owners[i];
            require(owner != address(0), "Invalid owner");
            require(!isOwner[owner], "Duplicate owner");
            
            isOwner[owner] = true;
            owners.push(owner);
        }
        
        required = _required;
    }
    
    receive() external payable {
        emit Deposit(msg.sender, msg.value);
    }
    
    function submitTransaction(address _to, uint256 _value, bytes memory _data)
        public
        onlyOwner
    {
        transactions.push(Transaction({
            to: _to,
            value: _value,
            data: _data,
            executed: false,
            approvals: 0
        }));
        
        emit SubmitTransaction(transactions.length - 1);
    }
    
    function approveTransaction(uint256 _txId) public onlyOwner {
        require(_txId < transactions.length, "Transaction does not exist");
        require(!approved[_txId][msg.sender], "Already approved");
        require(!transactions[_txId].executed, "Already executed");
        
        approved[_txId][msg.sender] = true;
        transactions[_txId].approvals++;
        
        emit ApproveTransaction(msg.sender, _txId);
    }
    
    function executeTransaction(uint256 _txId) public onlyOwner {
        require(_txId < transactions.length, "Transaction does not exist");
        require(!transactions[_txId].executed, "Already executed");
        require(transactions[_txId].approvals >= required, "Not enough approvals");
        
        Transaction storage transaction = transactions[_txId];
        transaction.executed = true;
        
        (bool success, ) = transaction.to.call{value: transaction.value}(transaction.data);
        require(success, "Transaction failed");
        
        emit ExecuteTransaction(_txId);
    }
}`,
            explanation: "This is a production-ready multi-signature wallet with the following security features: (1) Configurable number of required approvals for transaction execution, (2) Multiple owners can propose and approve transactions, (3) Prevents duplicate approvals and double execution, (4) Supports both ETH transfers and contract interactions via encoded data, (5) Events for complete transaction tracking and transparency. Perfect for DAOs and shared treasury management."
        }
    }

    // Default response for other prompts
    return {
        code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title CustomContract
 * @dev A secure smart contract template
 */
contract CustomContract is Ownable, ReentrancyGuard {
    
    // State variables
    mapping(address => uint256) public balances;
    
    // Events
    event Deposit(address indexed user, uint256 amount);
    event Withdrawal(address indexed user, uint256 amount);
    
    constructor(address initialOwner) Ownable(initialOwner) {}
    
    /**
     * @dev Deposit funds into the contract
     */
    function deposit() public payable nonReentrant {
        require(msg.value > 0, "Must send ETH");
        balances[msg.sender] += msg.value;
        emit Deposit(msg.sender, msg.value);
    }
    
    /**
     * @dev Withdraw funds from the contract
     * @param amount Amount to withdraw
     */
    function withdraw(uint256 amount) public nonReentrant {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        
        balances[msg.sender] -= amount;
        
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");
        
        emit Withdrawal(msg.sender, amount);
    }
    
    /**
     * @dev Get contract balance
     */
    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }
}`,
        explanation: "This is a secure smart contract template with essential security features: (1) ReentrancyGuard to prevent reentrancy attacks, (2) Ownable for access control, (3) Proper event emission for transparency, (4) Balance tracking and validation, (5) Modern Solidity 0.8.20 with built-in overflow protection. This template can be customized for various use cases including staking, vaults, or escrow systems."
    }
}

export async function POST(req: Request) {
    try {
        const { prompt } = await req.json()
        if (!prompt) {
            return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
        }

        try {
            const result = await GeminiService.generateCode(prompt)
            return NextResponse.json(result)
        } catch (apiError: any) {
            // If API fails, return mock data for demo purposes
            console.log("API failed, using mock data for demo:", apiError.message)
            const mockResult = getMockResponse(prompt)
            return NextResponse.json(mockResult)
        }
    } catch (error: any) {
        console.error("Generate Code API Error:", error)
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
    }
}
