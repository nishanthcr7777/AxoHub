# 🌐 Axohub

> The decentralized **package & source registry for smart contracts** – publish, discover, and integrate verified Solidity code seamlessly.

<p align="center">
  <img width="360" height="360" alt="image" src="https://github.com/user-attachments/assets/38d12441-41c1-4f23-af43-659d48ce4e02" />
</p>


<p align="center">
  <a href="#"><img src="https://img.shields.io/badge/status-Completed-brightgreen" /></a>
  <a href="#"><img src="https://img.shields.io/badge/license-MIT-blue.svg" /></a>
  <a href="#"><img src="https://img.shields.io/badge/deployed-Sepolia%20%7C%20Vercel-purple" /></a>
  <a href="#"><img src="https://img.shields.io/badge/tool-Remix-orange" /></a>
</p>  

---

## 🚀 Vision

Axohub is an **open-source package & source manager for Ethereum smart contracts**, functioning like **npm for Solidity**. It enables developers and founders to:

* Publish reusable contracts directly from Remix.
* Verify source code & ABIs on-chain.
* Submit source code to IPFS and connect contracts to frontends instantly.
* Browse verified contracts and sources with real-time updates.

---

## ✨ Features

* 📦 **Package Publishing** – Upload compiled contract + ABI from Remix.
* 📝 **Source Submission** – Submit raw Solidity code, store on IPFS, and register on-chain.
* 🔐 **On-chain Verification** – Trustless, transparent smart contract verification.
* 🌍 **IPFS Integration** – Decentralized storage for metadata and source code.
* ⚡ **Frontend Integration** – Connect contracts to apps without manual wiring.
* 💻 **Dynamic Wallet Support** – MetaMask & WalletConnect working for preview & production URLs.
* 🛠️ **Founder Friendly** – No Hardhat/Foundry setup required.

---

## 📂 Tech Stack

* **Smart Contracts:** Solidity + OpenZeppelin
* **Deployment:** Remix IDE + MetaMask
* **Storage:** IPFS (metadata & source code)
* **Frontend:** Next.js + TailwindCSS + wagmi
* **Blockchain:** Ethereum Testnets (Sepolia)
* **Hosting:** Vercel (supports dynamic preview URLs)

---

## 🔧 Getting Started

### Deploy via Remix

1. Open [Remix IDE](https://remix.ethereum.org).
2. Paste your contract under `contracts/`.
3. Compile using the specified Solidity version (see pragma).
4. Deploy using **Injected Provider** (MetaMask).
5. Copy the **deployed contract address** + ABI.

### Publish Package / Submit Source

1. Open the **Axohub dApp**.
2. **Publish Package:**

   * Enter Name, Version, Contract Address, Description, Tags.
   * Submit → stores package on-chain.
3. **Submit Source:**

   * Enter Name, Version, Compiler, License, Solidity Source Code.
   * Submit → uploads source to IPFS & registers on-chain.

---

## ⚡ Example Integration

```ts
import { createPublicClient, http } from "viem";
import { abi } from "./abis/MyContract.json";

const client = createPublicClient({
  chain: sepolia,
  transport: http(),
});

const contract = client.getContract({
  address: "0xYourDeployedAddress",
  abi,
});

// Example read
const owner = await contract.read.owner();
console.log("Contract owner:", owner);
```

---

## 🔗 Live Contracts

| Purpose         | Address                                      | Explorer Link                                                                                        |
| --------------- | -------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| 📦 Package Reg. | `0x1477FF10fA3Dde1207Ba72AA31329aeC502614d3` | [View on Etherscan](https://sepolia.etherscan.io/address/0x1477FF10fA3Dde1207Ba72AA31329aeC502614d3) |
| 📝 Source Reg.  | `0xd575D43389eE86648D67219c9934BbCBF980De56` | [View on Etherscan](https://sepolia.etherscan.io/address/0xd575D43389eE86648D67219c9934BbCBF980De56) |

---

## 🛣️ Roadmap

* [x] MVP: Publish packages + submit sources from Remix
* [x] IPFS integration for source & metadata
* [x] Dynamic WalletConnect support (MetaMask & WalletConnect)
* [x] Browse Packages & Sources with real-time updates
* [ ] Multi-chain support (Polygon, Base, Arbitrum)
* [ ] Axohub SDK for developers
* [ ] Governance via DAO

---

## 👥 Contributors

* Nishanth B (Founder & Developer)
* Open to community contributions 🚀

---

## 📜 License

MIT License © 2025 Axohub
