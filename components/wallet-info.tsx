"use client"

import { useWallet } from "@/hooks/use-wallet"

export function WalletInfo() {
  const { isConnected, address, chain, balance, balanceLoading } = useWallet()

  if (!isConnected) {
    return (
      <div
        className="rounded-md p-3 text-sm"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
        role="status"
      >
        Not connected
      </div>
    )
  }

  return (
    <div
      className="rounded-md p-3 text-sm grid gap-1"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
    >
      <div className="font-mono break-all">
        <span className="opacity-70">Address:</span> {address}
      </div>
      <div>
        <span className="opacity-70">Network:</span> {chain?.name} ({chain?.id})
      </div>
      <div>
        <span className="opacity-70">Balance:</span>{" "}
        {balanceLoading ? "Loading..." : balance ? `${balance.formatted} ${balance.symbol}` : "—"}
      </div>
    </div>
  )
}
