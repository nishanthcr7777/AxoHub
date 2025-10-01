"use client"

import { useWallet } from "@/hooks/use-wallet"
import { ClientOnly } from "@/components/client-only"

function WalletButtonInner() {
  const { isConnected, ensOrShortAddress, balance, connect, disconnect, balanceLoading } = useWallet()

  if (!isConnected) {
    return (
      <button
        onClick={connect}
        className="relative inline-flex items-center gap-2 px-4 py-2 rounded-md bg-background text-foreground border"
        style={{
          // neon accent ring + glow
          borderColor: "var(--accent, #22d3ee)",
          boxShadow: "0 0 8px rgba(34,211,238,0.5), inset 0 0 8px rgba(34,211,238,0.25)",
        }}
        aria-label="Connect Wallet"
      >
        <span className="h-2 w-2 rounded-full" style={{ background: "var(--accent, #22d3ee)" }} />
        <span className="font-medium">Connect Wallet</span>
      </button>
    )
  }

  return (
    <div className="inline-flex items-center gap-2">
      <button
        onClick={connect}
        className="relative inline-flex items-center gap-2 px-3 py-2 rounded-md bg-background text-foreground border"
        style={{
          borderColor: "var(--accent, #22d3ee)",
          boxShadow: "0 0 8px rgba(34,211,238,0.5), inset 0 0 8px rgba(34,211,238,0.25)",
        }}
        aria-label="Open Wallet Modal"
        title="Open Wallet Modal"
      >
        <span className="font-mono text-sm">{ensOrShortAddress}</span>
        <span
          className="ml-2 rounded px-2 py-0.5 text-xs"
          style={{
            background: "rgba(34,211,238,0.1)",
            color: "var(--accent, #22d3ee)",
            border: "1px solid rgba(34,211,238,0.35)",
          }}
        >
          {balanceLoading ? "…" : balance ? `${balance.formatted.slice(0, 6)} ${balance.symbol}` : "—"}
        </span>
      </button>

      <button
        onClick={disconnect}
        className="inline-flex items-center gap-1 px-3 py-2 rounded-md border text-foreground"
        style={{
          borderColor: "rgba(255,255,255,0.08)",
          background: "rgba(255,255,255,0.02)",
        }}
        aria-label="Disconnect Wallet"
      >
        <span className="h-2 w-2 rounded-full bg-red-500" aria-hidden />
        <span className="text-sm">Disconnect</span>
      </button>
    </div>
  )
}

export function WalletButton() {
  return (
    <ClientOnly
      fallback={
        <button
          className="relative inline-flex items-center gap-2 px-4 py-2 rounded-md bg-background text-foreground border opacity-50"
          disabled
        >
          <span className="h-2 w-2 rounded-full bg-gray-400" />
          <span className="font-medium">Loading...</span>
        </button>
      }
    >
      <WalletButtonInner />
    </ClientOnly>
  )
}
