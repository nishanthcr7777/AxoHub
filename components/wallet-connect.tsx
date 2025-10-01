"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useWallet } from "@/hooks/use-wallet"
import { ClientOnly } from "@/components/client-only"

function WalletConnectInner() {
  const {
    isConnected,
    isConnecting,
    isReconnecting,
    isWrongNetwork,
    canConnect,
    address,
    balance,
    chain,
    connect,
    disconnect,
    ensOrShortAddress,
    balanceLoading,
    switchToSepolia,
    isSwitchingNetwork,
  } = useWallet()

  const connectingUi = isConnecting && !isReconnecting && canConnect

  if (isConnected && address) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex items-center gap-4"
      >
        <Card className="p-3 bg-black/20 backdrop-blur-sm border-white/10 hover:border-cyan-500/30 transition-all duration-300">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <motion.div
                animate={{
                  boxShadow: [
                    "0 0 5px rgba(34, 211, 238, 0.5)",
                    "0 0 15px rgba(34, 211, 238, 0.8)",
                    "0 0 5px rgba(34, 211, 238, 0.5)",
                  ],
                }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                className="w-3 h-3 rounded-full"
                style={{ background: "#22d3ee" }}
              />
              <Badge variant="outline" className="text-xs border-cyan-500/30 text-cyan-300">
                {chain?.name ?? "Unknown"}
              </Badge>
            </div>

            <div className="text-right">
              <div className="text-sm font-mono text-white">{ensOrShortAddress}</div>
              <div className="text-xs text-slate-400">
                {balanceLoading ? "…" : balance ? `${Number(balance.formatted).toFixed(4)} ${balance.symbol}` : "—"}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                className="w-2 h-2 bg-green-400 rounded-full shadow-lg shadow-green-400/50"
              />
              <span className="text-sm text-green-400 font-medium">Connected</span>
            </div>
          </div>

          {isWrongNetwork && (
            <div className="mt-3 flex items-center justify-between rounded-md border border-red-500/40 bg-red-500/10 p-2">
              <span className="text-xs text-red-300">Wrong network. Please switch to Sepolia.</span>
              <Button
                onClick={switchToSepolia}
                size="sm"
                variant="outline"
                className="border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/10 bg-transparent"
                disabled={isSwitchingNetwork}
              >
                {isSwitchingNetwork ? "Switching…" : "Switch to Sepolia"}
              </Button>
            </div>
          )}
        </Card>

        <Button
          onClick={disconnect}
          variant="outline"
          size="sm"
          className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-300 transition-all duration-300 bg-transparent"
        >
          Disconnect
        </Button>
      </motion.div>
    )
  }

  return (
    <div className="flex items-center gap-4">
      <Button
        onClick={connect}
        disabled={connectingUi || !canConnect}
        className="relative overflow-hidden bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white border-0 shadow-[0_0_20px_rgba(34,211,238,0.35)] transition-all duration-300 px-6 py-2"
      >
        <AnimatePresence mode="popLayout">
          {connectingUi ? (
            <motion.div
              key="connecting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
              />
              <span>Connecting...</span>
            </motion.div>
          ) : (
            <motion.div
              key="connect"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <span>🔗</span>
              <span>Connect Wallet</span>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
          animate={{ x: ["-100%", "100%"] }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        />
      </Button>

      {!canConnect && (
        <span className="text-xs text-slate-400">
          WalletConnect projectId is required. Add NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID in Environment Variables.
        </span>
      )}
    </div>
  )
}

export function WalletConnect() {
  return (
    <ClientOnly
      fallback={
        <div className="flex items-center gap-4">
          <Button
            disabled
            className="relative overflow-hidden bg-gradient-to-r from-cyan-600/50 to-indigo-600/50 text-white border-0 px-6 py-2 opacity-50"
          >
            <span>🔗</span>
            <span>Loading...</span>
          </Button>
        </div>
      }
    >
      <WalletConnectInner />
    </ClientOnly>
  )
}
