import { useQuery } from '@tanstack/react-query'
import { publicAPI } from '@/api/publicApi'
import { useAnalyticsFilters } from '@/pages/public/AnalyticsContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChevronDown } from 'lucide-react'
import { useState } from 'react'

export function AnalyticsFilters() {
  const { data: filterOptions, isLoading } = useQuery({
    queryKey: ['analytics-filters'],
    queryFn: () => publicAPI.getFilters(),
  })

  const { filters, updateFilter, clearFilters } = useAnalyticsFilters()
  const [expandedSections, setExpandedSections] = useState({
    careers: true,
    professors: true,
    projectTypes: true,
    years: true,
  })

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Cargando filtros...</p>
        </CardContent>
      </Card>
    )
  }

  const selectedCareerCount = filters.careerIds?.length || 0
  const selectedProfessorCount = filters.professorIds?.length || 0
  const selectedProjectTypeCount = filters.projectTypeIds?.length || 0
  const hasYearFilter = filters.fromYear !== undefined || filters.toYear !== undefined

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Filtros</CardTitle>
          {(selectedCareerCount > 0 || selectedProfessorCount > 0 || selectedProjectTypeCount > 0 || hasYearFilter) && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs">
              Limpiar
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Careers */}
        <div>
          <button
            onClick={() => toggleSection('careers')}
            className="flex w-full items-center justify-between rounded-lg bg-slate-50 p-2 font-medium text-sm hover:bg-slate-100"
          >
            <span>
              Carreras {selectedCareerCount > 0 && <span className="ml-2 text-xs text-blue-600">({selectedCareerCount})</span>}
            </span>
            <ChevronDown
              className={`h-4 w-4 transition-transform ${expandedSections.careers ? 'rotate-0' : '-rotate-90'}`}
            />
          </button>
          {expandedSections.careers && (
            <div className="mt-2 space-y-2">
              {filterOptions?.careers?.map((career) => (
                <label key={career.id} className="flex items-center space-x-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.careerIds?.includes(career.id) || false}
                    onChange={(e) => {
                      const newIds = e.target.checked
                        ? [...(filters.careerIds || []), career.id]
                        : (filters.careerIds || []).filter((id) => id !== career.id)
                      updateFilter('careerIds', newIds.length > 0 ? newIds : undefined)
                    }}
                    className="rounded"
                  />
                  <span>{career.name}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Professors */}
        <div>
          <button
            onClick={() => toggleSection('professors')}
            className="flex w-full items-center justify-between rounded-lg bg-slate-50 p-2 font-medium text-sm hover:bg-slate-100"
          >
            <span>
              Profesores {selectedProfessorCount > 0 && <span className="ml-2 text-xs text-blue-600">({selectedProfessorCount})</span>}
            </span>
            <ChevronDown
              className={`h-4 w-4 transition-transform ${expandedSections.professors ? 'rotate-0' : '-rotate-90'}`}
            />
          </button>
          {expandedSections.professors && (
            <div className="mt-2 space-y-2 max-h-64 overflow-y-auto">
              {filterOptions?.professors?.map((prof) => (
                <label key={prof.id} className="flex items-center space-x-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.professorIds?.includes(prof.id) || false}
                    onChange={(e) => {
                      const newIds = e.target.checked
                        ? [...(filters.professorIds || []), prof.id]
                        : (filters.professorIds || []).filter((id) => id !== prof.id)
                      updateFilter('professorIds', newIds.length > 0 ? newIds : undefined)
                    }}
                    className="rounded"
                  />
                  <span>{prof.name}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Project Types */}
        <div>
          <button
            onClick={() => toggleSection('projectTypes')}
            className="flex w-full items-center justify-between rounded-lg bg-slate-50 p-2 font-medium text-sm hover:bg-slate-100"
          >
            <span>
              Tipo de Proyecto {selectedProjectTypeCount > 0 && <span className="ml-2 text-xs text-blue-600">({selectedProjectTypeCount})</span>}
            </span>
            <ChevronDown
              className={`h-4 w-4 transition-transform ${expandedSections.projectTypes ? 'rotate-0' : '-rotate-90'}`}
            />
          </button>
          {expandedSections.projectTypes && (
            <div className="mt-2 space-y-2">
              {filterOptions?.projectTypes?.map((type) => (
                <label key={type.id} className="flex items-center space-x-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.projectTypeIds?.includes(type.id) || false}
                    onChange={(e) => {
                      const newIds = e.target.checked
                        ? [...(filters.projectTypeIds || []), type.id]
                        : (filters.projectTypeIds || []).filter((id) => id !== type.id)
                      updateFilter('projectTypeIds', newIds.length > 0 ? newIds : undefined)
                    }}
                    className="rounded"
                  />
                  <span>{type.name}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Year Range */}
        <div>
          <button
            onClick={() => toggleSection('years')}
            className="flex w-full items-center justify-between rounded-lg bg-slate-50 p-2 font-medium text-sm hover:bg-slate-100"
          >
            <span>Rango de Años {hasYearFilter && <span className="ml-2 text-xs text-blue-600">(activo)</span>}</span>
            <ChevronDown
              className={`h-4 w-4 transition-transform ${expandedSections.years ? 'rotate-0' : '-rotate-90'}`}
            />
          </button>
          {expandedSections.years && filterOptions?.yearRange && (
            <div className="mt-2 space-y-3">
              <div>
                <label className="text-xs font-medium">Desde: {filters.fromYear || 'N/A'}</label>
                <input
                  type="range"
                  min={filterOptions.yearRange.minYear}
                  max={filterOptions.yearRange.maxYear}
                  value={filters.fromYear?.toString() || filterOptions.yearRange.minYear.toString()}
                  onChange={(e) => {
                    const year = parseInt(e.target.value)
                    const toYear = filters.toYear || filterOptions.yearRange.maxYear
                    if (year <= toYear) {
                      updateFilter('fromYear', year)
                    }
                  }}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-xs font-medium">Hasta: {filters.toYear || 'N/A'}</label>
                <input
                  type="range"
                  min={filterOptions.yearRange.minYear}
                  max={filterOptions.yearRange.maxYear}
                  value={filters.toYear?.toString() || filterOptions.yearRange.maxYear.toString()}
                  onChange={(e) => {
                    const year = parseInt(e.target.value)
                    const fromYear = filters.fromYear || filterOptions.yearRange.minYear
                    if (year >= fromYear) {
                      updateFilter('toYear', year)
                    }
                  }}
                  className="w-full"
                />
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
