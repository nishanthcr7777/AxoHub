"use client"

import { motion } from "framer-motion"
import { Sidebar } from "@/components/sidebar"
import { WalletConnect } from "@/components/wallet-connect"
import { PackagesCards } from "@/components/packages-cards"
import { SearchFilters } from "@/components/search-filters"
import { FilterProvider } from "@/contexts/filter-context"

export default function BrowsePackagesPage() {
  return (
    <FilterProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black">
        <Sidebar />

        <div className="ml-64 min-h-screen">
          {/* Header */}
          <header className="flex items-center justify-between p-6 border-b border-white/10 backdrop-blur-sm bg-white/5">
            <div className="flex-1">
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-2xl font-bold text-white"
              >
                Browse Packages
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="text-slate-400 mt-1"
              >
                Discover and interact with smart contract packages on SepoliaETH
              </motion.p>
            </div>
            <WalletConnect />
          </header>

          {/* Main content */}
          <main className="p-8">
            <div className="max-w-7xl mx-auto space-y-6">
              <SearchFilters />
              <PackagesCards />
            </div>
          </main>
        </div>
      </div>
    </FilterProvider>
  )
}
