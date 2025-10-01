"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CodeEditor } from "@/components/code-editor"
import { ipfsMock } from "@/lib/ipfs-mock"
import { Skeleton } from "@/components/ui/skeleton"

interface SourceContract {
  id: number
  name: string
  version: string
  compiler: string
  license: string
  ipfsCID: string
  submitter: `0x${string}`
  timestamp: bigint
  verified: boolean
  category: string
}

interface SourceModalProps {
  source: SourceContract | null
  isOpen: boolean
  onClose: () => void
}

export function SourceModal({ source, isOpen, onClose }: SourceModalProps) {
  const [sourceCode, setSourceCode] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (source && isOpen) {
      setIsLoading(true)
      ipfsMock
        .getText(source.ipfsCID)
        .then((code) => {
          setSourceCode(code)
          setIsLoading(false)
        })
        .catch((err) => {
          console.error("[v0] Failed to fetch source code:", err)
          setSourceCode("// Failed to load source code from IPFS")
          setIsLoading(false)
        })
    }
  }, [source, isOpen])

  if (!source) return null

  const getCategoryColor = (category: string) => {
    const colors = {
      DeFi: "border-blue-500/30 text-blue-300",
      NFT: "border-purple-500/30 text-purple-300",
      Gaming: "border-green-500/30 text-green-300",
      DAO: "border-yellow-500/30 text-yellow-300",
      Bridge: "border-cyan-500/30 text-cyan-300",
      Other: "border-slate-500/30 text-slate-300",
    }
    return colors[category as keyof typeof colors] || "border-slate-500/30 text-slate-300"
  }

  const formatDate = (timestamp: bigint) => {
    return new Date(Number(timestamp) * 1000).toLocaleDateString()
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", duration: 0.5 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-6xl max-h-[90vh] overflow-hidden"
          >
            <Card className="bg-black/80 backdrop-blur-sm border-white/10 h-full flex flex-col">
              {/* Header */}
              <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-white">{source.name}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-slate-400">v{source.version}</span>
                      <Badge variant="outline" className="border-green-500/30 text-green-300 text-xs">
                        ✓ Verified
                      </Badge>
                      <Badge variant="outline" className={`text-xs ${getCategoryColor(source.category)}`}>
                        {source.category}
                      </Badge>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
                >
                  Close
                </Button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-hidden flex">
                {/* Sidebar with contract info */}
                <div className="w-80 p-6 border-r border-white/10 space-y-6 overflow-y-auto">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Contract Details</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Compiler:</span>
                        <Badge variant="outline" className="border-slate-500/30 text-slate-300 text-xs">
                          {source.compiler}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">License:</span>
                        <Badge variant="outline" className="border-cyan-500/30 text-cyan-300 text-xs">
                          {source.license}
                        </Badge>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-slate-400">Submitter:</span>
                        <a
                          href={`https://sepolia.etherscan.io/address/${source.submitter}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-white font-mono text-sm hover:text-cyan-300 transition-colors break-all"
                        >
                          {formatAddress(source.submitter)}
                        </a>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Deployed:</span>
                        <span className="text-white text-sm">{formatDate(source.timestamp)}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-slate-400">IPFS CID:</span>
                        <span className="text-white font-mono text-xs break-all">{source.ipfsCID}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Actions</h3>
                    <div className="space-y-2">
                      <Button
                        onClick={() => {
                          const blob = new Blob([sourceCode], { type: "text/plain" })
                          const url = URL.createObjectURL(blob)
                          const a = document.createElement("a")
                          a.href = url
                          a.download = `${source.name}-${source.version}.sol`
                          a.click()
                          URL.revokeObjectURL(url)
                        }}
                        className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white"
                      >
                        Download Source
                      </Button>
                      <Button
                        onClick={() => {
                          window.open(`https://sepolia.etherscan.io/address/${source.submitter}`, "_blank")
                        }}
                        variant="outline"
                        className="w-full border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
                      >
                        View on Explorer
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Source code */}
                <div className="flex-1 p-6 overflow-hidden">
                  <div className="h-full">
                    <h3 className="text-lg font-semibold text-white mb-4">Source Code</h3>
                    {isLoading ? (
                      <div className="h-[calc(100%-2rem)] space-y-2">
                        <Skeleton className="h-4 w-full bg-slate-700" />
                        <Skeleton className="h-4 w-3/4 bg-slate-700" />
                        <Skeleton className="h-4 w-5/6 bg-slate-700" />
                        <Skeleton className="h-4 w-2/3 bg-slate-700" />
                      </div>
                    ) : (
                      <div className="h-[calc(100%-2rem)] overflow-hidden">
                        <CodeEditor value={sourceCode} onChange={() => {}} language="solidity" readOnly />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
