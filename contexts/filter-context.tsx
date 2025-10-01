"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

interface FilterContextType {
  searchTerm: string
  setSearchTerm: (term: string) => void
  selectedCompiler: string
  setSelectedCompiler: (compiler: string) => void
  selectedLicense: string
  setSelectedLicense: (license: string) => void
  activeFilters: string[]
  addFilter: (filter: string) => void
  removeFilter: (filter: string) => void
  clearAllFilters: () => void
}

const FilterContext = createContext<FilterContextType | undefined>(undefined)

export function FilterProvider({ children }: { children: ReactNode }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCompiler, setSelectedCompiler] = useState("")
  const [selectedLicense, setSelectedLicense] = useState("")
  const [activeFilters, setActiveFilters] = useState<string[]>([])

  const addFilter = (filter: string) => {
    if (!activeFilters.includes(filter)) {
      setActiveFilters([...activeFilters, filter])
    }
  }

  const removeFilter = (filter: string) => {
    setActiveFilters(activeFilters.filter((f) => f !== filter))
  }

  const clearAllFilters = () => {
    setActiveFilters([])
    setSearchTerm("")
    setSelectedCompiler("")
    setSelectedLicense("")
  }

  return (
    <FilterContext.Provider
      value={{
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
      }}
    >
      {children}
    </FilterContext.Provider>
  )
}

export function useFilters() {
  const context = useContext(FilterContext)
  if (context === undefined) {
    throw new Error("useFilters must be used within a FilterProvider")
  }
  return context
}
