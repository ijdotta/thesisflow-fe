import React, { createContext, useContext, useState, useCallback } from 'react'
import type { AnalyticsFilters } from '@/api/publicApi'

interface AnalyticsContextType {
  filters: AnalyticsFilters
  setFilters: (filters: AnalyticsFilters) => void
  updateFilter: <K extends keyof AnalyticsFilters>(key: K, value: AnalyticsFilters[K]) => void
  clearFilters: () => void
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined)

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const [filters, setFiltersState] = useState<AnalyticsFilters>({})

  const setFilters = useCallback((newFilters: AnalyticsFilters) => {
    setFiltersState(newFilters)
  }, [])

  const updateFilter = useCallback(<K extends keyof AnalyticsFilters>(key: K, value: AnalyticsFilters[K]) => {
    setFiltersState((prev) => ({
      ...prev,
      [key]: value,
    }))
  }, [])

  const clearFilters = useCallback(() => {
    setFiltersState({})
  }, [])

  return (
    <AnalyticsContext.Provider value={{ filters, setFilters, updateFilter, clearFilters }}>
      {children}
    </AnalyticsContext.Provider>
  )
}

export function useAnalyticsFilters() {
  const context = useContext(AnalyticsContext)
  if (!context) {
    throw new Error('useAnalyticsFilters must be used within AnalyticsProvider')
  }
  return context
}
