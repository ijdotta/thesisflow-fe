import { useQuery } from '@tanstack/react-query'
import { publicAPI } from '@/api/publicApi'
import { useAnalyticsFilters } from '@/pages/public/AnalyticsContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useMemo } from 'react'

export function StatsTable() {
  const { filters } = useAnalyticsFilters()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['career-year-stats', filters],
    queryFn: () => publicAPI.getCareerYearStats(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  const tableData = useMemo(() => {
    if (!data?.data) return null

    // Group by career and year
    const careerMap = new Map<string, Map<number, { careerName: string; projectCount: number }>>()
    const allYears = new Set<number>()

    data.data.forEach((item) => {
      if (!careerMap.has(item.careerId)) {
        careerMap.set(item.careerId, new Map())
      }
      careerMap.get(item.careerId)!.set(item.year, item)
      allYears.add(item.year)
    })

    const years = Array.from(allYears).sort((a, b) => a - b)

    return {
      careers: Array.from(careerMap.entries()).map(([careerId, yearMap]) => ({
        careerId,
        careerName: yearMap.values().next().value?.careerName || 'Unknown',
        years: yearMap,
      })),
      years,
    }
  }, [data])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Proyectos por Carrera y Año</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center text-sm text-muted-foreground">
            Cargando datos...
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isError || !tableData?.careers.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Proyectos por Carrera y Año</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center text-sm text-muted-foreground">
            {isError ? 'Error al cargar los datos' : 'No hay datos disponibles'}
          </div>
        </CardContent>
      </Card>
    )
  }

  const getIntensityColor = (count: number, maxCount: number) => {
    const intensity = count / maxCount
    if (intensity === 0) return 'bg-white'
    if (intensity < 0.25) return 'bg-blue-100'
    if (intensity < 0.5) return 'bg-blue-200'
    if (intensity < 0.75) return 'bg-blue-300'
    return 'bg-blue-400'
  }

  const maxCount = Math.max(
    ...tableData.careers.flatMap((c) => Array.from(c.years.values()).map((y) => y.projectCount))
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Proyectos por Carrera y Año</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="px-4 py-2 text-left font-semibold text-muted-foreground">Carrera</th>
              {tableData.years.map((year) => (
                <th key={year} className="px-4 py-2 text-center font-semibold text-muted-foreground">
                  {year}
                </th>
              ))}
              <th className="px-4 py-2 text-center font-semibold text-muted-foreground">Total</th>
            </tr>
          </thead>
          <tbody>
            {tableData.careers.map((career) => {
              const total = Array.from(career.years.values()).reduce((sum, y) => sum + y.projectCount, 0)
              return (
                <tr key={career.careerId} className="border-b hover:bg-slate-50">
                  <td className="px-4 py-2 font-medium">{career.careerName}</td>
                  {tableData.years.map((year) => {
                    const count = career.years.get(year)?.projectCount || 0
                    return (
                      <td key={year} className={`px-4 py-2 text-center ${getIntensityColor(count, maxCount)}`}>
                        {count > 0 ? count : '-'}
                      </td>
                    )
                  })}
                  <td className="px-4 py-2 text-center font-semibold bg-slate-50">{total}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </CardContent>
    </Card>
  )
}
