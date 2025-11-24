import { useQuery } from '@tanstack/react-query'
import { publicAPI } from '@/api/publicApi'
import { useAnalyticsFilters } from '@/pages/public/AnalyticsContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const getColor = (value: number, max: number): string => {
  if (max === 0) return '#e5e7eb'
  const ratio = value / max
  const colors = ['#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8', '#ffffbf', '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026']
  const index = Math.floor(ratio * (colors.length - 1))
  return colors[index]
}

export function TopicsHeatmap() {
  const { filters } = useAnalyticsFilters()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['topic-heatmap', filters],
    queryFn: () => publicAPI.getTopicHeatmap(filters),
    staleTime: 5 * 60 * 1000,
  })

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Popularidad de Temas (Mapa de Calor)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96 flex items-center justify-center text-sm text-muted-foreground">
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
          <CardTitle>Popularidad de Temas (Mapa de Calor)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96 flex items-center justify-center text-sm text-muted-foreground">
            {isError ? 'Error al cargar los datos' : 'No hay datos disponibles'}
          </div>
        </CardContent>
      </Card>
    )
  }

  const topics = Array.from(new Set(data.data.map((d) => d.topic))).sort()
  const years = Array.from(new Set(data.data.map((d) => d.year))).sort((a, b) => a - b)
  const maxCount = Math.max(...data.data.map((d) => d.count))

  const getCount = (topic: string, year: number): number => {
    return data.data.find((d) => d.topic === topic && d.year === year)?.count || 0
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Popularidad de Temas (Mapa de Calor)</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr>
              <th className="p-2 text-left border border-gray-200 bg-gray-50 font-medium text-xs">Tema</th>
              {years.map((year) => (
                <th key={year} className="p-2 text-center border border-gray-200 bg-gray-50 font-medium text-xs min-w-12">
                  {year}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {topics.map((topic) => (
              <tr key={topic}>
                <td className="p-2 border border-gray-200 bg-gray-50 text-xs font-medium max-w-xs truncate">
                  {topic}
                </td>
                {years.map((year) => {
                  const count = getCount(topic, year)
                  const bgColor = count > 0 ? getColor(count, maxCount) : '#f3f4f6'
                  return (
                    <td
                      key={`${topic}-${year}`}
                      className="p-2 border border-gray-200 text-center text-xs font-semibold text-gray-900 cursor-pointer hover:opacity-80 transition-opacity"
                      style={{ backgroundColor: bgColor }}
                      title={`${topic} (${year}): ${count} proyecto${count !== 1 ? 's' : ''}`}
                    >
                      {count > 0 ? count : '-'}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  )
}
