"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useFilters } from "@/contexts/filter-context"

export function SearchFilters() {
  const {
    searchTerm,
    setSearchTerm,
    selectedCompiler,
    setSelectedCompiler,
    selectedLicense,
    setSelectedLicense,
    activeFilters,
    addFilter,
    removeFilter,
    clearAllFilters,
  } = useFilters()

  const compilers = ["All Compilers", "solc-0.8.19", "solc-0.8.18", "solc-0.8.17", "solc-0.8.16"]
  const licenses = ["All Licenses", "MIT", "Apache-2.0", "GPL-3.0", "BSD-3-Clause", "Unlicense"]

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="p-6 bg-black/20 backdrop-blur-sm border-white/10">
        <div className="space-y-4">
          {/* Search and filters row */}
          <div className="grid md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <Input
                placeholder="Search contracts by name, author, or address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-purple-500"
              />
            </div>

            <Select value={selectedCompiler} onValueChange={setSelectedCompiler}>
              <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white">
                <SelectValue placeholder="Compiler" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                {compilers.map((compiler) => (
                  <SelectItem key={compiler} value={compiler} className="text-white hover:bg-slate-700">
                    {compiler}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedLicense} onValueChange={setSelectedLicense}>
              <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white">
                <SelectValue placeholder="License" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                {licenses.map((license) => (
                  <SelectItem key={license} value={license} className="text-white hover:bg-slate-700">
                    {license}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Quick filter tags */}
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-slate-400 mr-2">Quick filters:</span>
            {["DeFi", "NFT", "Gaming", "DAO", "Token", "Bridge"].map((tag) => (
              <Button
                key={tag}
                variant="outline"
                size="sm"
                onClick={() => addFilter(tag)}
                className="border-slate-600 text-slate-300 hover:bg-purple-500/10 hover:border-purple-500/50 bg-transparent text-xs"
              >
                {tag}
              </Button>
            ))}
          </div>

          {/* Active filters */}
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm text-slate-400">Active filters:</span>
              {activeFilters.map((filter) => (
                <Badge
                  key={filter}
                  variant="outline"
                  className="border-purple-500/30 text-purple-300 cursor-pointer hover:bg-purple-500/10"
                  onClick={() => removeFilter(filter)}
                >
                  {filter} ✕
                </Badge>
              ))}
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-slate-400 hover:text-white text-xs"
              >
                Clear all
              </Button>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  )
}
