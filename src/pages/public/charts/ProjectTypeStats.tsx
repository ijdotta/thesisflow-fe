import { useQuery } from '@tanstack/react-query'
import { publicAPI } from '@/api/publicApi'
import { useAnalyticsFilters } from '@/pages/public/AnalyticsContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ProjectTypeStatItem {
  projectType: string
  displayName: string
  year: number
  projectCount: number
  percentage: number
}

export function ProjectTypeStats() {
  const { filters } = useAnalyticsFilters()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['project-type-stats', filters],
    queryFn: () => publicAPI.getProjectTypeStats(filters),
    staleTime: 5 * 60 * 1000,
  })

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Proyectos por Tipo y Año</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center text-sm text-muted-foreground">
            Cargando datos...
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isError || !data?.data?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Proyectos por Tipo y Año</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center text-sm text-muted-foreground">
            {isError ? 'Error al cargar los datos' : 'No hay datos disponibles'}
          </div>
        </CardContent>
      </Card>
    )
  }

  const yearMap = new Map<number, ProjectTypeStatItem[]>()
  data.data.forEach((item) => {
    if (!yearMap.has(item.year)) {
      yearMap.set(item.year, [])
    }
    yearMap.get(item.year)!.push(item)
  })

  const years = Array.from(yearMap.keys()).sort((a, b) => a - b)

  const getIntensityColor = (percentage: number) => {
    if (percentage === 0) return 'bg-white'
    if (percentage < 25) return 'bg-blue-100'
    if (percentage < 50) return 'bg-blue-200'
    if (percentage < 75) return 'bg-blue-300'
    return 'bg-blue-400'
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Proyectos por Tipo y Año</CardTitle>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <table className="w-full text-sm table-fixed">
          <thead>
            <tr className="border-b">
              <th className="px-4 py-2 text-left font-semibold text-muted-foreground break-words">
                Tipo
              </th>
              {years.map((year) => (
                <th
                  key={year}
                  className="px-4 py-2 text-center font-semibold text-muted-foreground break-words"
                >
                  {year}
                </th>
              ))}
              <th className="px-4 py-2 text-center font-semibold text-muted-foreground break-words">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {['THESIS', 'FINAL_PROJECT'].map((typeKey) => {
              const total = data.data
                .filter((item) => item.projectType === typeKey)
                .reduce((sum, item) => sum + item.projectCount, 0)
              
              const displayName = typeKey === 'THESIS' ? 'Tesis' : 'Trabajo Final'

              return (
                <tr key={typeKey} className="border-b hover:bg-slate-50">
                  <td className="px-4 py-2 font-medium break-words">{displayName}</td>
                  {years.map((year) => {
                    const item = data.data.find(
                      (d) => d.year === year && d.projectType === typeKey
                    )
                    const count = item?.projectCount || 0
                    const percentage = item?.percentage || 0

                    return (
                      <td
                        key={year}
                        className={`px-4 py-2 text-center ${getIntensityColor(percentage)}`}
                        title={percentage > 0 ? `${percentage.toFixed(1)}%` : 'Sin datos'}
                      >
                        {count > 0 ? (
                          <div>
                            <div className="font-semibold">{count}</div>
                            <div className="text-xs text-slate-600">
                              {percentage.toFixed(1)}%
                            </div>
                          </div>
                        ) : (
                          '-'
                        )}
                      </td>
                    )
                  })}
                  <td className="px-4 py-2 text-center font-semibold bg-slate-50">
                    {total > 0 ? total : '-'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </CardContent>
    </Card>
  )
}
