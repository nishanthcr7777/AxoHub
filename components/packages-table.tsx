"use client"

import { motion } from "framer-motion"
import { useState, useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PackageModal } from "@/components/package-modal"
import { Skeleton } from "@/components/ui/skeleton"
import { useReadContract, useReadContracts, useChainId } from "wagmi"
import { packageRegistryAbi } from "@/lib/abis/package-registry"
import { PACKAGE_REGISTRY_ADDRESSES } from "@/lib/contracts/package-registry"
import { toast } from "sonner"
import { useFilters } from "@/contexts/filter-context"

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

export function PackagesTable() {
  const chainId = useChainId()
  const [selectedPackage, setSelectedPackage] = useState<PackageContract | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const { searchTerm, activeFilters } = useFilters()

  const registryAddress = PACKAGE_REGISTRY_ADDRESSES?.[chainId] as `0x${string}` | undefined

  const totalPackagesData = useReadContract({
    address: registryAddress,
    abi: packageRegistryAbi,
    functionName: "totalPackages",
    query: { enabled: Boolean(registryAddress), refetchInterval: 5000 },
  })

  const totalPackages = totalPackagesData.data ? Number(totalPackagesData.data) : 0

  const packagesReads = useReadContracts({
    contracts:
      registryAddress && totalPackages > 0
        ? Array.from({ length: totalPackages }, (_, i) => ({
            address: registryAddress,
            abi: packageRegistryAbi,
            functionName: "getPackage" as const,
            args: [BigInt(i)] as const,
          }))
        : [],
    query: { enabled: Boolean(registryAddress) && totalPackages > 0, refetchInterval: 5000 },
  })

  const isLoading = totalPackagesData.isLoading || packagesReads.isLoading
  const isError = totalPackagesData.isError || packagesReads.isError
  const error = (packagesReads.error || totalPackagesData.error) as Error | undefined

  const packages: PackageContract[] =
    (packagesReads.data || [])
      .map((res, index) => {
        const pkg = res?.result as
          | {
              name: string
              version: string
              ipfsMetadataCid: string
              ipfsAbiCid: string
              contractAddress: `0x${string}`
              publisher: `0x${string}`
              timestamp: bigint
            }
          | undefined

        if (!pkg) return null

        return {
          id: index,
          name: pkg.name,
          version: pkg.version,
          contractAddress: pkg.contractAddress,
          publisher: pkg.publisher,
          timestamp: pkg.timestamp,
          ipfsMetadataCid: pkg.ipfsMetadataCid,
          ipfsAbiCid: pkg.ipfsAbiCid,
          category: getCategoryFromName(pkg.name),
        }
      })
      .filter((p): p is PackageContract => Boolean(p)) || []

  const filteredPackages = useMemo(() => {
    return packages.filter((pkg) => {
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        const matchesSearch =
          pkg.name.toLowerCase().includes(searchLower) ||
          pkg.version.toLowerCase().includes(searchLower) ||
          pkg.publisher.toLowerCase().includes(searchLower) ||
          pkg.contractAddress.toLowerCase().includes(searchLower)
        if (!matchesSearch) return false
      }

      if (activeFilters.length > 0) {
        const matchesCategory = activeFilters.some((filter) => {
          const filterLower = filter.toLowerCase()
          return pkg.category.toLowerCase() === filterLower || pkg.name.toLowerCase().includes(filterLower)
        })
        if (!matchesCategory) return false
      }

      return true
    })
  }, [packages, searchTerm, activeFilters])

  function getCategoryFromName(name: string): string {
    const lowerName = name.toLowerCase()
    if (lowerName.includes("uniswap") || lowerName.includes("swap") || lowerName.includes("defi")) return "DeFi"
    if (lowerName.includes("nft") || lowerName.includes("erc721") || lowerName.includes("marketplace")) return "NFT"
    if (lowerName.includes("game") || lowerName.includes("token")) return "Gaming"
    if (lowerName.includes("dao") || lowerName.includes("governance")) return "DAO"
    if (lowerName.includes("bridge") || lowerName.includes("cross")) return "Bridge"
    return "Other"
  }

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

  const totalPages = Math.ceil(filteredPackages.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const displayedPackages = filteredPackages.slice(startIndex, startIndex + itemsPerPage)

  if (!registryAddress) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="bg-black/20 backdrop-blur-sm border-white/10 overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Published Packages</h2>
              <div className="text-sm text-slate-400">Unsupported network</div>
            </div>
          </div>
          <div className="p-6 text-slate-300">
            No registry found for the connected network. Please switch to a supported chain to view packages.
          </div>
        </Card>
      </motion.div>
    )
  }

  if (isError) {
    toast.error(`Failed to load packages: ${error?.message || "Unknown error"}`)
  }

  if (isLoading) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="bg-black/20 backdrop-blur-sm border-white/10 overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Published Packages</h2>
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

  if (!isLoading && packages.length === 0) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="bg-black/20 backdrop-blur-sm border-white/10 overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Published Packages</h2>
              <div className="text-sm text-slate-400">0 packages found</div>
            </div>
          </div>
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-white mb-2">No Packages Found</h3>
            <p className="text-slate-400 mb-6">
              No packages have been published yet. Be the first to publish a package!
            </p>
            <Button
              onClick={() => (window.location.href = "/publish-package")}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              Publish First Package
            </Button>
          </div>
        </Card>
      </motion.div>
    )
  }

  if (!isLoading && filteredPackages.length === 0 && packages.length > 0) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="bg-black/20 backdrop-blur-sm border-white/10 overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Published Packages</h2>
              <div className="text-sm text-slate-400">{packages.length} total packages</div>
            </div>
          </div>
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-white mb-2">No Results Found</h3>
            <p className="text-slate-400 mb-6">
              No packages match your current filters. Try adjusting your search criteria.
            </p>
          </div>
        </Card>
      </motion.div>
    )
  }

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="bg-black/20 backdrop-blur-sm border-white/10 overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Published Packages</h2>
              <div className="text-sm text-slate-400">
                {filteredPackages.length === packages.length
                  ? `${packages.length} packages found`
                  : `${filteredPackages.length} of ${packages.length} packages`}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800/30">
                <tr>
                  <th className="text-left p-4 text-slate-300 font-medium">Name</th>
                  <th className="text-left p-4 text-slate-300 font-medium">Version</th>
                  <th className="text-left p-4 text-slate-300 font-medium">Contract</th>
                  <th className="text-left p-4 text-slate-300 font-medium">Publisher</th>
                  <th className="text-left p-4 text-slate-300 font-medium">Category</th>
                  <th className="text-left p-4 text-slate-300 font-medium">Published</th>
                  <th className="text-left p-4 text-slate-300 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayedPackages.map((pkg, index) => (
                  <motion.tr
                    key={pkg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                    onClick={() => setSelectedPackage(pkg)}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">{pkg.name}</span>
                        <Badge variant="outline" className="border-green-500/30 text-green-300 text-xs">
                          ✓ Published
                        </Badge>
                      </div>
                    </td>
                    <td className="p-4 text-slate-300">{pkg.version}</td>
                    <td className="p-4 text-slate-300 font-mono text-sm">
                      <a
                        href={`https://sepolia.etherscan.io/address/${pkg.contractAddress}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-cyan-300 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {formatAddress(pkg.contractAddress)}
                      </a>
                    </td>
                    <td className="p-4 text-slate-300 font-mono text-sm">
                      <a
                        href={`https://sepolia.etherscan.io/address/${pkg.publisher}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-cyan-300 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {formatAddress(pkg.publisher)}
                      </a>
                    </td>
                    <td className="p-4">
                      <Badge variant="outline" className={`text-xs ${getCategoryColor(pkg.category)}`}>
                        {pkg.category}
                      </Badge>
                    </td>
                    <td className="p-4 text-slate-400 text-sm">{formatDate(pkg.timestamp)}</td>
                    <td className="p-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedPackage(pkg)
                        }}
                        className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10 bg-transparent text-xs"
                      >
                        View Package
                      </Button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-6 border-t border-white/10 flex items-center justify-between">
            <div className="text-sm text-slate-400">
              Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredPackages.length)} of{" "}
              {filteredPackages.length} packages
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

      <PackageModal package={selectedPackage} isOpen={!!selectedPackage} onClose={() => setSelectedPackage(null)} />
    </>
  )
}
