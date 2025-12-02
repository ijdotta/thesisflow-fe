import { useQuery } from '@tanstack/react-query'
import { publicAPI } from '@/api/publicApi'
import { useAnalyticsFilters } from '@/pages/public/AnalyticsContext'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ChartData {
  year: number
  [professorId: string]: number | string
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{
    name: string
    value: number
    dataKey: string
  }>
  professors: Map<string, string>
}

function CustomTooltip({ active, payload, professors }: CustomTooltipProps) {
  if (!active || !payload) return null
  
  const sorted = [...payload].sort((a, b) => (b.value as number) - (a.value as number))
  
  return (
    <div className="bg-background border border-border rounded-md shadow-md p-2">
      {sorted.map((entry) => (
        <div key={entry.dataKey} className="text-xs">
          <span style={{ color: entry.color || '#000' }}>●</span>
          {' '}
          <span className="font-medium">{professors.get(entry.dataKey) ?? entry.dataKey}:</span>
          {' '}
          <span>{entry.value}</span>
        </div>
      ))}
    </div>
  )
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
          <CardTitle>Tesis por Profesor (Barras por Año)</CardTitle>
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
          <CardTitle>Tesis por Profesor (Barras por Año)</CardTitle>
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
  const professors = new Map<string, string>()

  data.data.forEach((item) => {
    professors.set(item.professorId, item.professorName)
  })

  const yearsMap = new Map<number, Record<string, number>>()
  data.data.forEach((item) => {
    if (!yearsMap.has(item.year)) {
      yearsMap.set(item.year, { year: item.year })
    }
    yearsMap.get(item.year)![item.professorId] = item.count
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

  const isMobile = window.innerWidth < 768
  const professorCount = professors.size
  const shouldShowLegend = professorCount <= 5

  return (
    <Card>
        <CardHeader>
          <CardTitle>Tesis por Profesor (Barras por Año)</CardTitle>
      </CardHeader>
      <CardContent className={isMobile ? "overflow-x-auto" : "overflow-hidden"}>
        <ResponsiveContainer width="100%" height={600}>
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 80 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis allowDecimals={false} />
            <Tooltip
              content={<CustomTooltip professors={professors} />}
              contentStyle={{ position: 'relative', zIndex: 1000 }}
              wrapperStyle={{ outline: 'none', zIndex: 1000 }}
            />
            {shouldShowLegend && (
              <Legend 
                wrapperStyle={{ 
                  paddingTop: '20px',
                  fontSize: window.innerWidth < 768 ? '11px' : '12px',
                  overflowWrap: 'break-word'
                }} 
                layout={window.innerWidth < 768 ? 'vertical' : 'horizontal'}
              />
            )}
            {Array.from(professors.entries())
              .sort((a, b) => a[1].localeCompare(b[1]))
              .map(([profId, profName], index) => (
              <Line
                key={profId}
                type="monotone"
                dataKey={profId}
                name={profName}
                stroke={colors[index % colors.length]}
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
