"use client"

import { motion } from "framer-motion"
import { useEffect, useMemo, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PackageModal } from "@/components/package-modal"
import { Skeleton } from "@/components/ui/skeleton"
import { useReadContract, useReadContracts, useChainId } from "wagmi"
import { packageRegistryAbi } from "@/lib/abis/package-registry"
import { PACKAGE_REGISTRY_ADDRESSES } from "@/lib/contracts/package-registry"
import { ipfsMock } from "@/lib/ipfs-mock"
import { toast } from "sonner"

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

type PackageMetadata =
  | {
      name?: string
      description?: string
      tags?: string[]
      rating?: number
      downloads?: number
      lastUpdated?: string
    }
  | undefined

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
    DeFi: "border-blue-500/30 text-blue-300 bg-blue-500/10",
    NFT: "border-purple-500/30 text-purple-300 bg-purple-500/10",
    Gaming: "border-green-500/30 text-green-300 bg-green-500/10",
    DAO: "border-yellow-500/30 text-yellow-300 bg-yellow-500/10",
    Bridge: "border-cyan-500/30 text-cyan-300 bg-cyan-500/10",
    Other: "border-slate-500/30 text-slate-300 bg-slate-500/10",
  }
  return (colors as any)[category] || "border-slate-500/30 text-slate-300 bg-slate-500/10"
}

function renderStars(rating: number) {
  return Array.from({ length: 5 }, (_, i) => (
    <span key={i} className={i < Math.floor(rating) ? "text-yellow-400" : "text-slate-600"}>
      {"★"}
    </span>
  ))
}

function formatDate(timestamp: bigint) {
  return new Date(Number(timestamp) * 1000).toLocaleDateString()
}

function formatAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function PackagesCards() {
  const chainId = useChainId()
  const [selectedPackage, setSelectedPackage] = useState<PackageContract | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6

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

  const packages: PackageContract[] = useMemo(() => {
    return (packagesReads.data || [])
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
      .filter((p): p is PackageContract => Boolean(p))
  }, [packagesReads.data])

  const totalPages = Math.ceil(packages.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const displayedPackages = useMemo(() => packages.slice(startIndex, startIndex + itemsPerPage), [packages, startIndex])

  // Load metadata for displayed packages from IPFS mock (safe no-op if CID not present)
  const [metadataMap, setMetadataMap] = useState<Record<number, PackageMetadata>>({})

  const displayedKeys = useMemo(
    () => displayedPackages.map((p) => `${p.id}:${p.ipfsMetadataCid}`).join("|"),
    [displayedPackages],
  )

  useEffect(() => {
    let cancelled = false
    async function loadMetadata() {
      const entries: Record<number, PackageMetadata> = {}
      for (const pkg of displayedPackages) {
        if (!pkg?.ipfsMetadataCid) continue
        // skip if already loaded
        if (metadataMap[pkg.id] !== undefined) continue
        try {
          const entry: any = await ipfsMock.get(pkg.ipfsMetadataCid)
          if (entry && typeof entry.content === "string") {
            try {
              const parsed = JSON.parse(entry.content)
              entries[pkg.id] = parsed as PackageMetadata
            } catch {
              entries[pkg.id] = undefined
            }
          } else {
            entries[pkg.id] = undefined
          }
        } catch {
          entries[pkg.id] = undefined
        }
      }
      if (!cancelled) {
        const hasNew = Object.keys(entries).some((k) => {
          const id = Number(k)
          return JSON.stringify(metadataMap[id]) !== JSON.stringify(entries[id])
        })
        if (hasNew) {
          setMetadataMap((prev) => ({ ...prev, ...entries }))
        }
      }
    }
    loadMetadata()
    return () => {
      cancelled = true
    }
    // depend on stable keys only to prevent endless loops
  }, [displayedKeys])

  useEffect(() => {
    if (isError) {
      toast.error(`Failed to load packages: ${error?.message || "Unknown error"}`)
    }
  }, [isError, error])

  if (!registryAddress) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="bg-black/20 backdrop-blur-sm border-white/10 overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Available Packages</h2>
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

  if (isLoading) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Available Packages</h2>
          <Skeleton className="h-4 w-24 bg-slate-700" />
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="p-6 bg-black/20 backdrop-blur-sm border-white/10">
              <div className="flex items-start justify-between mb-4">
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-5 w-40 bg-slate-700" />
                  <Skeleton className="h-4 w-24 bg-slate-700" />
                </div>
                <Skeleton className="h-6 w-16 bg-slate-700" />
              </div>
              <Skeleton className="h-4 w-full bg-slate-700 mb-2" />
              <Skeleton className="h-4 w-3/4 bg-slate-700 mb-4" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-12 bg-slate-700" />
                <Skeleton className="h-6 w-12 bg-slate-700" />
                <Skeleton className="h-6 w-12 bg-slate-700" />
              </div>
            </Card>
          ))}
        </div>
      </motion.div>
    )
  }

  if (!isLoading && packages.length === 0) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="bg-black/20 backdrop-blur-sm border-white/10 overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Available Packages</h2>
              <div className="text-sm text-slate-400">0 packages found</div>
            </div>
          </div>
          <div className="p-6 text-slate-300">No packages have been published yet.</div>
        </Card>
      </motion.div>
    )
  }

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Available Packages</h2>
          <div className="text-sm text-slate-400">{packages.length} packages found</div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedPackages.map((pkg, index) => {
            const md = metadataMap[pkg.id]
            const description = md?.description || "No description provided."
            const tags = (md?.tags && md.tags.length > 0 ? md.tags : [pkg.category.toLowerCase()]).slice(0, 4)
            const rating = typeof md?.rating === "number" ? md.rating : 4.8
            const downloads = typeof md?.downloads === "number" ? md.downloads : 0
            const lastUpdated = md?.lastUpdated || formatDate(pkg.timestamp)

            return (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -5 }}
              >
                <Card className="p-6 bg-black/20 backdrop-blur-sm border-white/10 hover:border-purple-500/30 transition-all duration-300 cursor-pointer h-full flex flex-col group">
                  <div className="flex-1" onClick={() => setSelectedPackage(pkg)}>
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white group-hover:text-purple-300 transition-colors">
                          {pkg.name}
                        </h3>
                        <p className="text-sm text-slate-400">v{pkg.version}</p>
                      </div>
                      <Badge variant="outline" className={`text-xs ${getCategoryColor(pkg.category)}`}>
                        {pkg.category}
                      </Badge>
                    </div>

                    {/* Description */}
                    <p className="text-slate-300 text-sm mb-4 line-clamp-3">{description}</p>

                    {/* Stats */}
                    <div className="flex items-center gap-4 mb-4 text-sm">
                      <div className="flex items-center gap-1">
                        {renderStars(rating)}
                        <span className="text-slate-400 ml-1">{rating}</span>
                      </div>
                      <div className="text-slate-400">{downloads} downloads</div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {tags.slice(0, 3).map((tag) => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className="border-slate-600/50 text-slate-400 text-xs bg-slate-800/30"
                        >
                          {tag}
                        </Badge>
                      ))}
                      {tags.length > 3 && (
                        <Badge variant="outline" className="border-slate-600/50 text-slate-400 text-xs bg-slate-800/30">
                          +{tags.length - 3}
                        </Badge>
                      )}
                    </div>

                    {/* Publisher & Date */}
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
                      <span>by {formatAddress(pkg.publisher)}</span>
                      <span>{lastUpdated}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t border-white/10">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedPackage(pkg)
                      }}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white text-sm"
                    >
                      View Details
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => e.stopPropagation()}
                      className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
                      title="Favorite"
                      aria-label="Favorite"
                    >
                      {"⭐"}
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-8">
          <div className="text-sm text-slate-400">
            Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, packages.length)} of {packages.length}{" "}
            packages
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
      </motion.div>

      <PackageModal package={selectedPackage} isOpen={!!selectedPackage} onClose={() => setSelectedPackage(null)} />
    </>
  )
}
