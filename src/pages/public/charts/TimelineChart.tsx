import { useQuery } from '@tanstack/react-query'
import { publicAPI } from '@/api/publicApi'
import { useAnalyticsFilters } from '@/pages/public/AnalyticsContext'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ChartData {
  year: number
  [professorName: string]: number | string
}

export function TimelineChart() {
  const { filters } = useAnalyticsFilters()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['thesis-timeline', filters],
    queryFn: () => publicAPI.getThesisTimeline(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tesis por Profesor (Línea de Tiempo)</CardTitle>
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
          <CardTitle>Tesis por Profesor (Línea de Tiempo)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center text-sm text-muted-foreground">
            {isError ? 'Error al cargar los datos' : 'No hay datos disponibles'}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Transform data for recharts
  const chartData: ChartData[] = []
  const professors = new Set<string>()

  data.data.forEach((item) => {
    professors.add(item.professorName)
  })

  const yearsMap = new Map<number, Record<string, number>>()
  data.data.forEach((item) => {
    if (!yearsMap.has(item.year)) {
      yearsMap.set(item.year, { year: item.year })
    }
    yearsMap.get(item.year)![item.professorName] = item.count
  })

  Array.from(yearsMap.values())
    .sort((a, b) => (a.year as number) - (b.year as number))
    .forEach((entry) => {
      chartData.push(entry as ChartData)
    })

  const colors = [
    '#3b82f6',
    '#ef4444',
    '#10b981',
    '#f59e0b',
    '#8b5cf6',
    '#06b6d4',
    '#ec4899',
    '#6366f1',
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tesis por Profesor (Línea de Tiempo)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis />
            <Tooltip formatter={(value) => value as number} />
            <Legend />
            {Array.from(professors).map((prof, index) => (
              <Line
                key={prof}
                type="monotone"
                dataKey={prof}
                stroke={colors[index % colors.length]}
                connectNulls
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
