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

  const nivoData = topics.map((topic) => ({
    id: topic,
    data: years.map((year) => {
      const item = data.data.find((d) => d.topic === topic && d.year === year)
      return {
        x: String(year),
        y: item?.count ?? 0,
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
            margin={{ top: 40, right: 40, bottom: 100, left: 200 }}
            colors={{ scheme: 'blues' }}
            forceSquare={false}
            axisTop={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: -45,
              legend: '',
              legendOffset: 36,
            }}
            axisLeft={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: '',
              legendOffset: -72,
            }}
            cellOpacity={1}
            cellBorderColor={{ from: 'color', modifiers: [['darker', 0.4]] }}
            labelTextColor={{ from: 'color', modifiers: [['darker', 1.8]] }}
            tooltip={(props) => (
              <div
                style={{
                  padding: '8px 12px',
                  background: '#222',
                  color: '#fff',
                  borderRadius: '4px',
                  fontSize: '12px',
                }}
              >
                <strong>{props.cell.serieId}</strong>
                <br />
                Año: {props.cell.xKey}
                <br />
                Proyectos: {props.cell.value}
              </div>
            )}
            legends={[
              {
                anchor: 'bottom-right',
                translateX: 0,
                translateY: 120,
                length: 400,
                thickness: 8,
                direction: 'row',
                tickPosition: 'after',
                tickSize: 3,
                tickSpacing: 4,
                tickOverlap: false,
                title: 'Cantidad →',
                titleAlign: 'start',
                titleOffset: 4,
              },
            ]}
          />
        </div>
      </CardContent>
    </Card>
  )
}
