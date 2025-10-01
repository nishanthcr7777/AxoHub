"use client"

import type { ReactNode } from "react"
import { WagmiProvider } from "wagmi"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { wagmiConfig, initWeb3Modal } from "@/lib/web3modal"
import { useEffect } from "react"

type Props = { children: ReactNode }

const queryClient = new QueryClient()

export function WalletProvider({ children }: Props) {
  useEffect(() => {
    initWeb3Modal()
  }, [])

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  )
}
