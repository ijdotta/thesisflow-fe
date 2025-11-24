import { useQuery } from '@tanstack/react-query'
import { publicAPI } from '@/api/publicApi'
import { useAnalyticsFilters } from '@/pages/public/AnalyticsContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ResponsiveHeatMap } from '@nivo/heatmap'

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

  // Transform data for nivo heatmap
  const years = Array.from(new Set(data.data.map((d) => d.year))).sort((a, b) => a - b)
  const topics = Array.from(new Set(data.data.map((d) => d.topic))).sort()

  // Calculate min/max for normalization
  const allCounts = data.data.map((d) => d.count)
  const maxCount = Math.max(...allCounts)

  const nivoData = topics.map((topic) => ({
    id: topic,
    data: years.map((year) => {
      const item = data.data.find((d) => d.topic === topic && d.year === year)
      const count = item?.count ?? 0
      // Normalize to 0-1 range for diverging color scale
      const normalized = maxCount > 0 ? count / maxCount : 0
      return {
        x: String(year),
        y: normalized,
        count: count, // Keep original count for display
      }
    }),
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Popularidad de Temas (Mapa de Calor)</CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ width: '100%', height: '600px' }}>
          <ResponsiveHeatMap
            data={nivoData}
            margin={{ top: 60, right: 100, bottom: 120, left: 220 }}
            minValue={0}
            maxValue={1}
            forceSquare={false}
            colors={{
              type: 'diverging',
              scheme: 'blue_red',
              divergeAt: 0.5,
              steps: 11,
            }}
            axisTop={{
              tickSize: 5,
              tickPadding: 8,
              tickRotation: -45,
              legend: 'Años',
              legendPosition: 'middle',
              legendOffset: 50,
            }}
            axisLeft={{
              tickSize: 5,
              tickPadding: 8,
              tickRotation: 0,
              legend: 'Temas',
              legendPosition: 'middle',
              legendOffset: -60,
            }}
            cellOpacity={1}
            cellBorderWidth={1}
            cellBorderColor={{ from: 'color', modifiers: [['darker', 0.3]] }}
            labelTextColor={{ from: 'color', modifiers: [['darker', 2.5]] }}
            emptyColor="#f3f4f6"
            tooltip={(props) => (
              <div
                style={{
                  padding: '10px 14px',
                  background: '#1f2937',
                  color: '#fff',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: 500,
                  boxShadow: '0 4px 6px rgba(0,0,0,0.2)',
                }}
              >
                <div style={{ marginBottom: '6px', fontWeight: 'bold' }}>
                  {props.cell.serieId}
                </div>
                <div>Año: {props.cell.xKey}</div>
                <div>Proyectos: {(props.cell.data as any).count}</div>
              </div>
            )}
            legends={[
              {
                anchor: 'bottom',
                translateX: 0,
                translateY: 100,
                length: 500,
                thickness: 10,
                direction: 'row',
                tickPosition: 'after',
                tickSize: 4,
                tickSpacing: 8,
                tickOverlap: false,
                title: 'Intensidad (Normalizada)',
                titleAlign: 'start',
                titleOffset: 8,
              },
            ]}
          />
        </div>
      </CardContent>
    </Card>
  )
}
