import { useQuery } from '@tanstack/react-query'
import { publicAPI } from '@/api/publicApi'
import { useAnalyticsFilters } from '@/pages/public/AnalyticsContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useECharts } from '@/hooks/useECharts'
import { useEffect, useRef } from 'react'

export function TopicsHeatmap() {
  const { filters } = useAnalyticsFilters()
  const ref = useRef<HTMLDivElement>(null)
  const { setOption, getInstance } = useECharts(ref)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['topic-heatmap', filters],
    queryFn: () => publicAPI.getTopicHeatmap(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  useEffect(() => {
    if (!data?.data || data.data.length === 0) return

    const topics = Array.from(new Set(data.data.map((d) => d.topic)))
    const years = Array.from(new Set(data.data.map((d) => d.year))).sort((a, b) => a - b)

    // Create matrix data for heatmap
    const heatmapData = data.data.map((d) => [
      topics.indexOf(d.topic),
      years.indexOf(d.year),
      d.count,
    ])

    const maxCount = Math.max(...data.data.map((d) => d.count))

    const option = {
      tooltip: {
        position: 'top',
        formatter: (params: any) => {
          if (!params.componentSubType || params.componentSubType !== 'heatmap') return ''
          const topic = topics[params.value[0]]
          const year = years[params.value[1]]
          const count = params.value[2]
          return `${topic}<br/>${year}: ${count} proyectos`
        },
      },
      grid: {
        height: '80%',
        top: 10,
        left: 150,
      },
      xAxis: {
        type: 'category',
        data: years,
        splitArea: {
          show: true,
        },
      },
      yAxis: {
        type: 'category',
        data: topics,
        splitArea: {
          show: true,
        },
      },
      visualMap: {
        min: 0,
        max: maxCount,
        calculable: true,
        orient: 'vertical',
        right: '2%',
        bottom: '5%',
        inRange: {
          color: ['#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8', '#ffffbf', '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026'],
        },
      },
      series: [
        {
          name: 'Proyectos',
          type: 'heatmap',
          data: heatmapData,
          label: {
            show: true,
          },
          emphasis: {
            itemStyle: {
              borderColor: '#333',
              borderWidth: 1,
            },
          },
        },
      ],
    }

    setOption(option)
  }, [data, setOption])

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Popularidad de Temas (Mapa de Calor)</CardTitle>
      </CardHeader>
      <CardContent>
        <div ref={ref} style={{ width: '100%', height: '400px' }} />
      </CardContent>
    </Card>
  )
}
