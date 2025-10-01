"use client"

import { motion } from "framer-motion"
import { useState, useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SourceModal } from "@/components/source-modal"
import { Skeleton } from "@/components/ui/skeleton"
import { useReadContract } from "wagmi"
import { sourceRegistryAbi } from "@/lib/abis/source-registry"
import { SOURCE_REGISTRY_ADDRESSES } from "@/lib/contracts/source-registry"
import { useChainId } from "wagmi"
import { toast } from "sonner"
import { useFilters } from "@/contexts/filter-context"

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

export function SourcesTable() {
  const [selectedSource, setSelectedSource] = useState<SourceContract | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const chainId = useChainId()

  const { searchTerm, selectedCompiler, selectedLicense, activeFilters } = useFilters()

  const {
    data: contractSources,
    isLoading,
    isError,
    error,
  } = useReadContract({
    address: SOURCE_REGISTRY_ADDRESSES[chainId] as `0x${string}`,
    abi: sourceRegistryAbi,
    functionName: "getAllSources",
  })

  const sources: SourceContract[] = contractSources
    ? contractSources.map((source, index) => ({
        id: index,
        name: source.name,
        version: source.version,
        compiler: source.compiler,
        license: source.license,
        ipfsCID: source.ipfsCID,
        submitter: source.submitter,
        timestamp: source.timestamp,
        verified: true,
        category: getCategoryFromName(source.name),
      }))
    : []

  const filteredSources = useMemo(() => {
    return sources.filter((source) => {
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        const matchesSearch =
          source.name.toLowerCase().includes(searchLower) ||
          source.version.toLowerCase().includes(searchLower) ||
          source.submitter.toLowerCase().includes(searchLower)
        if (!matchesSearch) return false
      }

      if (selectedCompiler && selectedCompiler !== "All Compilers") {
        if (source.compiler !== selectedCompiler) return false
      }

      if (selectedLicense && selectedLicense !== "All Licenses") {
        if (source.license !== selectedLicense) return false
      }

      if (activeFilters.length > 0) {
        const matchesCategory = activeFilters.some((filter) => {
          const filterLower = filter.toLowerCase()
          return source.category.toLowerCase() === filterLower || source.name.toLowerCase().includes(filterLower)
        })
        if (!matchesCategory) return false
      }

      return true
    })
  }, [sources, searchTerm, selectedCompiler, selectedLicense, activeFilters])

  function getCategoryFromName(name: string): string {
    const lowerName = name.toLowerCase()
    if (lowerName.includes("uniswap") || lowerName.includes("swap") || lowerName.includes("defi")) return "DeFi"
    if (lowerName.includes("nft") || lowerName.includes("erc721") || lowerName.includes("marketplace")) return "NFT"
    if (lowerName.includes("game") || lowerName.includes("token")) return "Gaming"
    if (lowerName.includes("dao") || lowerName.includes("governance")) return "DAO"
    if (lowerName.includes("bridge") || lowerName.includes("cross")) return "Bridge"
    return "Other"
  }

  if (isError) {
    toast.error(`Failed to load sources: ${error?.message || "Unknown error"}`)
  }

  const totalPages = Math.ceil(filteredSources.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const displayedSources = filteredSources.slice(startIndex, startIndex + itemsPerPage)

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

  if (isLoading) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="bg-black/20 backdrop-blur-sm border-white/10 overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Verified Contracts</h2>
              <Skeleton className="h-4 w-24 bg-slate-700" />
            </div>
          </div>
          <div className="p-6 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded bg-slate-700" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-[250px] bg-slate-700" />
                  <Skeleton className="h-4 w-[200px] bg-slate-700" />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>
    )
  }

  if (!isLoading && filteredSources.length === 0 && sources.length > 0) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="bg-black/20 backdrop-blur-sm border-white/10 overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Verified Contracts</h2>
              <div className="text-sm text-slate-400">{sources.length} total contracts</div>
            </div>
          </div>
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-white mb-2">No Results Found</h3>
            <p className="text-slate-400 mb-6">
              No contracts match your current filters. Try adjusting your search criteria.
            </p>
          </div>
        </Card>
      </motion.div>
    )
  }

  if (!isLoading && sources.length === 0) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="bg-black/20 backdrop-blur-sm border-white/10 overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Verified Contracts</h2>
              <div className="text-sm text-slate-400">0 contracts found</div>
            </div>
          </div>
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">📂</div>
            <h3 className="text-xl font-semibold text-white mb-2">No Sources Found</h3>
            <p className="text-slate-400 mb-6">
              No smart contract source code has been submitted yet. Be the first to contribute!
            </p>
            <Button
              onClick={() => (window.location.href = "/submit-source")}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              Submit First Source
            </Button>
          </div>
        </Card>
      </motion.div>
    )
  }

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="bg-black/20 backdrop-blur-sm border-white/10 overflow-hidden">
          {/* Table header */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Verified Contracts</h2>
              <div className="text-sm text-slate-400">
                {filteredSources.length === sources.length
                  ? `${sources.length} contracts found`
                  : `${filteredSources.length} of ${sources.length} contracts`}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800/30">
                <tr>
                  <th className="text-left p-4 text-slate-300 font-medium">Name</th>
                  <th className="text-left p-4 text-slate-300 font-medium">Version</th>
                  <th className="text-left p-4 text-slate-300 font-medium">Compiler</th>
                  <th className="text-left p-4 text-slate-300 font-medium">License</th>
                  <th className="text-left p-4 text-slate-300 font-medium">Author</th>
                  <th className="text-left p-4 text-slate-300 font-medium">Category</th>
                  <th className="text-left p-4 text-slate-300 font-medium">Deployed</th>
                  <th className="text-left p-4 text-slate-300 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayedSources.map((source, index) => (
                  <motion.tr
                    key={source.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                    onClick={() => setSelectedSource(source)}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">{source.name}</span>
                        {source.verified && (
                          <Badge variant="outline" className="border-green-500/30 text-green-300 text-xs">
                            ✓ Verified
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-slate-300">{source.version}</td>
                    <td className="p-4">
                      <Badge variant="outline" className="border-slate-500/30 text-slate-300 text-xs">
                        {source.compiler}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Badge variant="outline" className="border-cyan-500/30 text-cyan-300 text-xs">
                        {source.license}
                      </Badge>
                    </td>
                    <td className="p-4 text-slate-300 font-mono text-sm">
                      <a
                        href={`https://sepolia.etherscan.io/address/${source.submitter}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-cyan-300 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {formatAddress(source.submitter)}
                      </a>
                    </td>
                    <td className="p-4">
                      <Badge variant="outline" className={`text-xs ${getCategoryColor(source.category)}`}>
                        {source.category}
                      </Badge>
                    </td>
                    <td className="p-4 text-slate-400 text-sm">{formatDate(source.timestamp)}</td>
                    <td className="p-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedSource(source)
                        }}
                        className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10 bg-transparent text-xs"
                      >
                        View Source
                      </Button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-6 border-t border-white/10 flex items-center justify-between">
            <div className="text-sm text-slate-400">
              Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredSources.length)} of{" "}
              {filteredSources.length} contracts
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="border-slate-600 text-slate-300 hover:bg-slate-700 disabled:opacity-50 bg-transparent"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="border-slate-600 text-slate-300 hover:bg-slate-700 disabled:opacity-50 bg-transparent"
              >
                Next
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>

      <SourceModal source={selectedSource} isOpen={!!selectedSource} onClose={() => setSelectedSource(null)} />
    </>
  )
}
