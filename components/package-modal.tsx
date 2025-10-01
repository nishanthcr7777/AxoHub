"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ipfsMock } from "@/lib/ipfs-mock"

interface PackageContract {
  id: number
  name: string
  version: string
  contractAddress: `0x${string}`
  publisher: `0x${string}`
  timestamp: bigint
  ipfsMetadataCid: string
  ipfsAbiCid: string
  category: string
}

interface PackageModalProps {
  package: PackageContract | null
  isOpen: boolean
  onClose: () => void
}

const mockABI = [
  {
    inputs: [
      { internalType: "address", name: "tokenA", type: "address" },
      { internalType: "address", name: "tokenB", type: "address" },
      { internalType: "uint256", name: "amountIn", type: "uint256" },
    ],
    name: "swapTokens",
    outputs: [{ internalType: "uint256", name: "amountOut", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "token", type: "address" }],
    name: "getPrice",
    outputs: [{ internalType: "uint256", name: "price", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
]

export function PackageModal({ package: pkg, isOpen, onClose }: PackageModalProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [functionInputs, setFunctionInputs] = useState<{ [key: string]: string }>({})
  const [abiJsonText, setAbiJsonText] = useState<string | null>(null)
  const [abiLoaded, setAbiLoaded] = useState(false)
  const [metadataText, setMetadataText] = useState<string | null>(null)
  const [metadataLoaded, setMetadataLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function loadAbi() {
      setAbiLoaded(false)
      if (!pkg?.ipfsAbiCid) {
        setAbiJsonText(null)
        setAbiLoaded(false)
        return
      }
      const entry = await ipfsMock.get(pkg.ipfsAbiCid)
      if (cancelled) return
      if (entry) {
        setAbiJsonText(entry.content)
        setAbiLoaded(true)
      } else {
        setAbiJsonText(null)
        setAbiLoaded(false)
      }
    }
    loadAbi()
    return () => {
      cancelled = true
    }
  }, [pkg?.ipfsAbiCid])

  useEffect(() => {
    let cancelled = false
    async function loadMetadata() {
      setMetadataLoaded(false)
      if (!pkg?.ipfsMetadataCid) {
        setMetadataText(null)
        setMetadataLoaded(false)
        return
      }
      const entry = await ipfsMock.get(pkg.ipfsMetadataCid)
      if (cancelled) return
      if (entry) {
        setMetadataText(entry.content)
        setMetadataLoaded(true)
      } else {
        setMetadataText(null)
        setMetadataLoaded(false)
      }
    }
    loadMetadata()
    return () => {
      cancelled = true
    }
  }, [pkg?.ipfsMetadataCid])

  if (!pkg) return null

  const getCategoryColor = (category: string) => {
    const colors = {
      DeFi: "border-blue-500/30 text-blue-300 bg-blue-500/10",
      NFT: "border-purple-500/30 text-purple-300 bg-purple-500/10",
      Gaming: "border-green-500/30 text-green-300 bg-green-500/10",
      DAO: "border-yellow-500/30 text-yellow-300 bg-yellow-500/10",
      Bridge: "border-cyan-500/30 text-cyan-300 bg-cyan-500/10",
      Other: "border-slate-500/30 text-slate-300 bg-slate-500/10",
    }
    return colors[category as keyof typeof colors] || "border-slate-500/30 text-slate-300 bg-slate-500/10"
  }

  const handleFunctionCall = (functionName: string) => {
    console.log(`Calling ${functionName} with inputs:`, functionInputs[functionName])
    // Simulate function call - in real implementation, this would interact with the contract
  }

  const updateFunctionInput = (functionName: string, value: string) => {
    setFunctionInputs((prev) => ({ ...prev, [functionName]: value }))
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
                    <h2 className="text-2xl font-bold text-white">{pkg.name}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-slate-400">v{pkg.version}</span>
                      <Badge variant="outline" className={`text-xs ${getCategoryColor(pkg.category)}`}>
                        {pkg.category}
                      </Badge>
                      <Badge variant="outline" className="border-green-500/30 text-green-300 text-xs">
                        ✓ Published
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
              <div className="flex-1 overflow-hidden">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                  <TabsList className="grid w-full grid-cols-4 bg-slate-800/50 border-b border-white/10">
                    <TabsTrigger value="overview" className="data-[state=active]:bg-purple-500/20">
                      Overview
                    </TabsTrigger>
                    <TabsTrigger value="abi" className="data-[state=active]:bg-purple-500/20">
                      ABI Viewer
                    </TabsTrigger>
                    <TabsTrigger value="metadata" className="data-[state=active]:bg-purple-500/20">
                      Metadata
                    </TabsTrigger>
                    <TabsTrigger value="interact" className="data-[state=active]:bg-purple-500/20">
                      Interact
                    </TabsTrigger>
                  </TabsList>

                  <div className="flex-1 overflow-y-auto">
                    <TabsContent value="overview" className="p-6 space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <h3 className="text-lg font-semibold text-white mb-2">Package Information</h3>
                            <p className="text-slate-300">
                              This package contains smart contract interfaces and metadata stored on-chain.
                            </p>
                          </div>

                          <div>
                            <h3 className="text-lg font-semibold text-white mb-2">IPFS References</h3>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-slate-400">Metadata CID:</span>
                                <span className="text-white font-mono text-xs">{pkg.ipfsMetadataCid}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">ABI CID:</span>
                                <span className="text-white font-mono text-xs">{pkg.ipfsAbiCid}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <h3 className="text-lg font-semibold text-white mb-2">Package Details</h3>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-slate-400">Publisher:</span>
                                <a
                                  href={`https://sepolia.etherscan.io/address/${pkg.publisher}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-cyan-300 hover:text-cyan-200 font-mono"
                                >
                                  {formatAddress(pkg.publisher)}
                                </a>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">Contract:</span>
                                <a
                                  href={`https://sepolia.etherscan.io/address/${pkg.contractAddress}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-cyan-300 hover:text-cyan-200 font-mono text-xs"
                                >
                                  {formatAddress(pkg.contractAddress)}
                                </a>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">Published:</span>
                                <span className="text-white">{formatDate(pkg.timestamp)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">Package ID:</span>
                                <span className="text-white">#{pkg.id}</span>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Button
                              onClick={() =>
                                window.open(`https://sepolia.etherscan.io/address/${pkg.contractAddress}`, "_blank")
                              }
                              className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white"
                            >
                              View on Sepolia Explorer
                            </Button>
                            <Button
                              variant="outline"
                              className="w-full border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
                              onClick={() => navigator.clipboard.writeText(pkg.contractAddress)}
                            >
                              Copy Contract Address
                            </Button>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="abi" className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-white">Contract ABI</h3>
                          {abiLoaded ? (
                            <Badge variant="outline" className="border-cyan-500/30 text-cyan-300">
                              Loaded from Mock IPFS
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="border-yellow-500/30 text-yellow-300">
                              Preview Data
                            </Badge>
                          )}
                        </div>
                        <div className="bg-slate-900/50 rounded-lg p-4 max-h-96 overflow-y-auto">
                          {abiLoaded && abiJsonText ? (
                            <pre className="text-sm text-slate-300 font-mono whitespace-pre-wrap">{abiJsonText}</pre>
                          ) : (
                            <pre className="text-sm text-slate-300 font-mono">{JSON.stringify(mockABI, null, 2)}</pre>
                          )}
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="metadata" className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-white">Package Metadata</h3>
                          {metadataLoaded ? (
                            <Badge variant="outline" className="border-cyan-500/30 text-cyan-300">
                              Loaded from Mock IPFS
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="border-yellow-500/30 text-yellow-300">
                              Not Available
                            </Badge>
                          )}
                        </div>
                        <div className="bg-slate-900/50 rounded-lg p-4 max-h-96 overflow-y-auto">
                          {metadataLoaded && metadataText ? (
                            <pre className="text-sm text-slate-300 font-mono whitespace-pre-wrap">{metadataText}</pre>
                          ) : (
                            <p className="text-slate-400 text-sm">
                              No metadata found for CID {pkg.ipfsMetadataCid}. If you published without a file, an
                              example metadata is generated automatically for new publishes.
                            </p>
                          )}
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="interact" className="p-6">
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-white">Contract Functions</h3>
                          <Badge variant="outline" className="border-yellow-500/30 text-yellow-300">
                            Preview Mode
                          </Badge>
                        </div>
                        <p className="text-slate-400 text-sm">
                          This is a preview of contract interaction. Full implementation will use the actual ABI from
                          IPFS.
                        </p>

                        {mockABI.map((func, index) => (
                          <Card key={index} className="p-4 bg-slate-800/30 border-slate-600">
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <h4 className="text-white font-semibold">{func.name}</h4>
                                <Badge
                                  variant="outline"
                                  className={`text-xs ${
                                    func.stateMutability === "view"
                                      ? "border-blue-500/30 text-blue-300"
                                      : "border-orange-500/30 text-orange-300"
                                  }`}
                                >
                                  {func.stateMutability}
                                </Badge>
                              </div>

                              {func.inputs.length > 0 && (
                                <div className="space-y-2">
                                  <span className="text-sm text-slate-400">Inputs:</span>
                                  {func.inputs.map((input, inputIndex) => (
                                    <div key={inputIndex} className="flex gap-2">
                                      <Input
                                        placeholder={`${input.name} (${input.type})`}
                                        value={functionInputs[`${func.name}_${inputIndex}`] || ""}
                                        onChange={(e) =>
                                          updateFunctionInput(`${func.name}_${inputIndex}`, e.target.value)
                                        }
                                        className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-purple-500"
                                      />
                                    </div>
                                  ))}
                                </div>
                              )}

                              <Button
                                onClick={() => handleFunctionCall(func.name)}
                                variant="outline"
                                size="sm"
                                className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10 bg-transparent"
                              >
                                {func.stateMutability === "view" ? "Query" : "Execute"}
                              </Button>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </TabsContent>
                  </div>
                </Tabs>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
