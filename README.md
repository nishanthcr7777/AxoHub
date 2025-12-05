}

# 🌐 Axohub

> **The decentralized package & source registry for smart contracts** – publish, discover, and integrate verified Solidity code seamlessly.

<p align="center">
  <img width="360" height="360" alt="Axohub Logo" src="https://github.com/user-attachments/assets/38d12441-41c1-4f23-af43-659d48ce4e02" />
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

* Publish reusable smart contracts directly from Remix
* Verify source code & ABIs on-chain
* Submit source code to IPFS and connect contracts to frontends instantly
* Browse verified contracts and sources with real-time updates

### ✅ NEW with Nullshot MCP

Axohub now integrates a **multi-agent AI security & code generation system** that prevents vulnerable smart contracts from ever being published.

---

## ✨ Features

### 🔹 Core Axohub Features (Existing)

* 📦 **Package Publishing** – Upload compiled contract + ABI from Remix
* 📝 **Source Submission** – Submit raw Solidity code stored on IPFS
* 🔐 **On-chain Verification** – Trustless, transparent verification
* 🌍 **IPFS Integration** – Decentralized storage for metadata & source
* ⚡ **Frontend Integration** – Plug-and-play contract integration
* 💻 **Dynamic Wallet Support** – MetaMask & WalletConnect
* 🛠️ **Founder Friendly** – No Hardhat / Foundry required

---

## 🧠 NEW: MCP-Powered AI Security & Code Generation

*(Powered by Nullshot MCP Framework)*

Axohub now includes **two cooperating MCP agents**:

### 1️⃣ Code Generator MCP

* Converts **natural language → secure Solidity contracts**
* Uses **OpenZeppelin security patterns**
* Example:

  > “Create an ERC20 token with 2% tax and burn”
* Outputs **production-ready Solidity code inside Axohub**

### 2️⃣ Auditor MCP

* Performs **automatic security audits before publishing**
* Detects:

  * Re-entrancy
  * tx.origin attacks
  * Unchecked external calls
  * Access control flaws
* Generates:

  * ✅ **Approval if safe**
  * ❌ **Inline commented fixes if vulnerable**

---

## 🔁 MCP Workflow

```
Prompt → Code Generator MCP → Solidity Code
        → Auditor MCP → Risk Report + Fixes
        → User Applies Fix → Re-Audit → Publish
```

✅ **No vulnerable contract can be published unless the Auditor MCP approves it.**

---

## 🏗️ Tech Stack

* **Smart Contracts:** Solidity + OpenZeppelin
* **Deployment:** Remix + MetaMask
* **Storage:** IPFS
* **Frontend:** Next.js + TailwindCSS + wagmi
* **Blockchain:** Ethereum Testnets (Sepolia)
* **Hosting:** Vercel
* **AI / Agents:**

  * Nullshot MCP (Multi-Agent System)
  * OpenAI / Gemini (Pluggable LLM Backend)

---

## 🔧 Getting Started

### ✅ Deploy via Remix

1. Open **Remix IDE**
2. Paste contract under `contracts/`
3. Compile
4. Deploy using **Injected Provider (MetaMask)**
5. Copy **Contract Address + ABI**

---

### 📦 Publish Package (Axohub)

* Name
* Version
* Contract Address
* Description
* Tags

✅ Submit → Stored **on-chain**

---

### 📝 Submit Source

* Name
* Version
* Compiler
* License
* Solidity Source Code

✅ Submit → Stored on **IPFS + Registered on-chain**

⚠️ **Before Publishing:**

* Code is automatically sent to **Auditor MCP**
* If vulnerable → user must fix with **Code Generator MCP**

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

| Purpose             | Address                                      | Explorer                                                                                             |
| ------------------- | -------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| 📦 Package Registry | `0x1477FF10fA3Dde1207Ba72AA31329aeC502614d3` | [View on Etherscan](https://sepolia.etherscan.io/address/0x1477FF10fA3Dde1207Ba72AA31329aeC502614d3) |
| 📝 Source Registry  | `0xd575D43389eE86648D67219c9934BbCBF980De56` | [View on Etherscan](https://sepolia.etherscan.io/address/0xd575D43389eE86648D67219c9934BbCBF980De56) |

---

## 🧩 Why This Is serious

✅ Real **MCP multi-agent system**
✅ AI **code generation + security auditing**
✅ Real users can publish contracts **today**
✅ Actively **prevents Web3 exploits**
✅ **Developer infrastructure**, not a toy demo

> This is not “AI for fun” — this is **AI enforcing trust at the protocol publishing layer.**

---

## 🛣️ Roadmap

* ✅ MVP: Publish packages + submit sources
* ✅ IPFS integration
* ✅ WalletConnect + MetaMask
* ✅ MCP Code Generator & Auditor
* ⏳ Browse packages with reputation scoring
* ⏳ Multi-chain support (Polygon, Base, Arbitrum)
* ⏳ Axohub SDK
* ⏳ DAO Governance

---

## 👥 Contributors

* **Nishanth B** — Founder & Full-stack Developer
* Open to community contributions 🚀

---

## 📜 License

MIT License © 2025 Axohub

