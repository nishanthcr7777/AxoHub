"use client"

import { createWeb3Modal, defaultWagmiConfig } from "@web3modal/wagmi/react"
import { sepolia, mainnet } from "wagmi/chains"

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
const effectiveProjectId = projectId || "placeholder-project-id"

if (!projectId) {
  console.warn("[AxoHub] NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is missing")
}

const metadata = {
  name: "AxoHub",
  description: "AxoHub - Decentralized Source & Package Registry",
  url: "https://axohub.dev",
  icons: ["/axohub-logo.jpg"],
}

export const chains = [sepolia, mainnet] as const

export const wagmiConfig = defaultWagmiConfig({
  chains,
  projectId: effectiveProjectId,
  metadata,
})

let modalCreated = false

if (typeof window !== "undefined") {
  initWeb3Modal()
}

export function initWeb3Modal() {
  if (typeof window === "undefined" || modalCreated) return

  createWeb3Modal({
    wagmiConfig,
    projectId: effectiveProjectId,
    chains,
    themeMode: "dark",
    themeVariables: {
      "--w3m-accent": "#00e5ff",
      "--w3m-background": "#0a0f1a",
      "--w3m-color-mix": "#00e5ff",
      "--w3m-color-mix-strength": 30,
      "--w3m-font-family": "var(--font-sans, ui-sans-serif)",
      "--w3m-border-radius-master": "10px",
    },
  })

  modalCreated = true
}

export const w3mProjectId = projectId
