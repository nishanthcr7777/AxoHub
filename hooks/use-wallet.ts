"use client"

import { useMemo, useEffect, useState } from "react"
import { useAccount, useBalance, useChainId, useChains, useDisconnect, useSwitchChain } from "wagmi"
import { useWeb3Modal } from "@web3modal/wagmi/react"
import { w3mProjectId } from "@/lib/web3modal"

function shorten(addr?: `0x${string}` | string | null) {
  if (!addr) return ""
  const s = String(addr)
  return s.length > 10 ? `${s.slice(0, 6)}...${s.slice(-4)}` : s
}

export function useWallet() {
  const { address, isConnected, status } = useAccount()
  const chainId = useChainId()
  const chains = useChains()
  const { disconnect } = useDisconnect()
  const { open } = useWeb3Modal()
  const { switchChain, isPending: isSwitchingNetwork } = useSwitchChain()

  const { data: balanceData, isLoading: balanceLoading } = useBalance({
    address: address as `0x${string}` | undefined,
    chainId,
    query: { enabled: Boolean(address) },
  })

  const chain = useMemo(() => chains.find((c) => c.id === chainId), [chains, chainId])

  const isReconnecting = status === "reconnecting"
  const sepoliaId = 11155111
  const isWrongNetwork = Boolean(isConnected && chainId && chainId !== sepoliaId)
  const canConnect = Boolean(w3mProjectId)

  const [uiConnecting, setUiConnecting] = useState(false)

  useEffect(() => {
    if (status === "connected" || status === "disconnected" || status === "reconnecting") {
      setUiConnecting(false)
    }
  }, [status])

  useEffect(() => {
    if (!uiConnecting) return
    const t = setTimeout(() => {
      // fail-safe so the spinner never hangs forever
      setUiConnecting(false)
    }, 12000)
    return () => clearTimeout(t)
  }, [uiConnecting])

  return {
    // connection
    isConnected,
    isConnecting: uiConnecting, // use UI state instead of wagmi's status which could hang
    isReconnecting,
    isWrongNetwork,
    canConnect,
    address: address ?? null,
    ensOrShortAddress: shorten(address),
    chain,
    chainId,
    // balance
    balance: balanceData
      ? { formatted: balanceData.formatted, symbol: balanceData.symbol, decimals: balanceData.decimals }
      : null,
    balanceLoading,
    isSwitchingNetwork,
    // actions
    connect: async () => {
      if (!canConnect) {
        console.warn("[v0] WalletConnect projectId missing; cannot open modal.")
        setUiConnecting(false)
        return
      }
      if (!open) {
        console.warn("[v0] Web3Modal 'open' is unavailable; aborting connect.")
        setUiConnecting(false)
        return
      }

      try {
        setUiConnecting(true)
        await open({ view: "Connect" })
      } catch (e) {
        console.log("[v0] open modal error:", (e as Error)?.message)
      } finally {
        setUiConnecting(false)
      }
    },
    disconnect: () => disconnect(),
    switchToSepolia: () => switchChain?.({ chainId: sepoliaId }),
  }
}
