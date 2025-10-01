"use client"

import { motion } from "framer-motion"
import { Sidebar } from "@/components/sidebar"
import { WalletConnect } from "@/components/wallet-connect"
import { SourcesTable } from "@/components/sources-table"
import { SearchFilters } from "@/components/search-filters"
import { FilterProvider } from "@/contexts/filter-context"

export default function BrowseSourcesPage() {
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
                Browse Source Code
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="text-slate-400 mt-1"
              >
                Explore verified smart contract source code on SepoliaETH
              </motion.p>
            </div>
            <WalletConnect />
          </header>

          {/* Main content */}
          <main className="p-8">
            <div className="max-w-7xl mx-auto space-y-6">
              <SearchFilters />
              <SourcesTable />
            </div>
          </main>
        </div>
      </div>
    </FilterProvider>
  )
}
