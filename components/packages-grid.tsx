"use client"

import { motion } from "framer-motion"
import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PackageModal } from "@/components/package-modal"

interface Package {
  id: string
  name: string
  version: string
  description: string
  publisher: string
  contractAddress: string
  category: string
  downloads: number
  rating: number
  tags: string[]
  lastUpdated: string
}

const mockPackages: Package[] = [
  {
    id: "1",
    name: "DeFi Swap Router",
    version: "2.1.0",
    description: "A comprehensive DEX router for seamless token swapping with optimal price discovery",
    publisher: "0x742d...5b8c",
    contractAddress: "0x1234567890abcdef1234567890abcdef12345678",
    category: "DeFi",
    downloads: 1250,
    rating: 4.8,
    tags: ["swap", "dex", "router", "defi"],
    lastUpdated: "2024-01-15",
  },
  {
    id: "2",
    name: "NFT Marketplace Kit",
    version: "1.5.2",
    description: "Complete NFT marketplace solution with bidding, royalties, and collection management",
    publisher: "0x1234...abcd",
    contractAddress: "0xabcdef1234567890abcdef1234567890abcdef12",
    category: "NFT",
    downloads: 890,
    rating: 4.6,
    tags: ["nft", "marketplace", "auction", "royalties"],
    lastUpdated: "2024-01-14",
  },
  {
    id: "3",
    name: "Gaming Token System",
    version: "3.0.1",
    description: "Multi-token gaming ecosystem with rewards, achievements, and in-game economies",
    publisher: "0x5678...efgh",
    contractAddress: "0x567890abcdef1234567890abcdef1234567890ab",
    category: "Gaming",
    downloads: 654,
    rating: 4.9,
    tags: ["gaming", "tokens", "rewards", "achievements"],
    lastUpdated: "2024-01-13",
  },
  {
    id: "4",
    name: "DAO Governance Suite",
    version: "2.3.0",
    description: "Complete DAO governance framework with voting, proposals, and treasury management",
    publisher: "0x9abc...1234",
    contractAddress: "0x90abcdef1234567890abcdef1234567890abcdef",
    category: "DAO",
    downloads: 432,
    rating: 4.7,
    tags: ["dao", "governance", "voting", "treasury"],
    lastUpdated: "2024-01-12",
  },
  {
    id: "5",
    name: "Cross-Chain Bridge",
    version: "1.8.0",
    description: "Secure cross-chain asset bridge with multi-signature validation and fee optimization",
    publisher: "0xdef0...5678",
    contractAddress: "0xdef01234567890abcdef1234567890abcdef1234",
    category: "Bridge",
    downloads: 321,
    rating: 4.5,
    tags: ["bridge", "cross-chain", "interoperability"],
    lastUpdated: "2024-01-11",
  },
  {
    id: "6",
    name: "Yield Farming Protocol",
    version: "1.2.3",
    description: "Automated yield farming with compound rewards and risk management strategies",
    publisher: "0x2468...9abc",
    contractAddress: "0x24681357924681357924681357924681357924",
    category: "DeFi",
    downloads: 789,
    rating: 4.4,
    tags: ["yield", "farming", "defi", "rewards"],
    lastUpdated: "2024-01-10",
  },
]

export function PackagesGrid() {
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6

  const totalPages = Math.ceil(mockPackages.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const displayedPackages = mockPackages.slice(startIndex, startIndex + itemsPerPage)

  const getCategoryColor = (category: string) => {
    const colors = {
      DeFi: "border-blue-500/30 text-blue-300 bg-blue-500/10",
      NFT: "border-purple-500/30 text-purple-300 bg-purple-500/10",
      Gaming: "border-green-500/30 text-green-300 bg-green-500/10",
      DAO: "border-yellow-500/30 text-yellow-300 bg-yellow-500/10",
      Bridge: "border-cyan-500/30 text-cyan-300 bg-cyan-500/10",
    }
    return colors[category as keyof typeof colors] || "border-slate-500/30 text-slate-300 bg-slate-500/10"
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < Math.floor(rating) ? "text-yellow-400" : "text-slate-600"}>
        ★
      </span>
    ))
  }

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Available Packages</h2>
          <div className="text-sm text-slate-400">{mockPackages.length} packages found</div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedPackages.map((pkg, index) => (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
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
                  <p className="text-slate-300 text-sm mb-4 line-clamp-3">{pkg.description}</p>

                  {/* Stats */}
                  <div className="flex items-center gap-4 mb-4 text-sm">
                    <div className="flex items-center gap-1">
                      {renderStars(pkg.rating)}
                      <span className="text-slate-400 ml-1">{pkg.rating}</span>
                    </div>
                    <div className="text-slate-400">{pkg.downloads} downloads</div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {pkg.tags.slice(0, 3).map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="border-slate-600/50 text-slate-400 text-xs bg-slate-800/30"
                      >
                        {tag}
                      </Badge>
                    ))}
                    {pkg.tags.length > 3 && (
                      <Badge variant="outline" className="border-slate-600/50 text-slate-400 text-xs bg-slate-800/30">
                        +{pkg.tags.length - 3}
                      </Badge>
                    )}
                  </div>

                  {/* Publisher & Date */}
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
                    <span>by {pkg.publisher}</span>
                    <span>{pkg.lastUpdated}</span>
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
                  >
                    ⭐
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-8">
          <div className="text-sm text-slate-400">
            Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, mockPackages.length)} of {mockPackages.length}{" "}
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
