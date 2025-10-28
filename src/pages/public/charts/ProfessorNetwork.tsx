import { useQuery } from '@tanstack/react-query'
import { publicAPI } from '@/api/publicApi'
import { useAnalyticsFilters } from '@/pages/public/AnalyticsContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useEffect, useRef } from 'react'
import { Network } from 'vis-network'
import { DataSet } from 'vis-data'

export function ProfessorNetwork() {
  const { filters } = useAnalyticsFilters()
  const networkRef = useRef<HTMLDivElement>(null)
  const networkInstance = useRef<Network | null>(null)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['professor-network', filters],
    queryFn: () => publicAPI.getProfessorNetwork(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  useEffect(() => {
    if (!networkRef.current || !data) return

    // Create nodes
    const projectCounts = data.nodes.map((n) => n.projectCount)
    const maxProjectCount = projectCounts.length ? Math.max(...projectCounts) : 0
    const baseNodeSize = 60
    const variableNodeSize = 140

    const nodes = new DataSet(
      data.nodes.map((node) => ({
        id: node.id,
        label: `${node.name}\n${node.projectCount} proyectos`,
        title: `${node.name}\n${node.projectCount} proyectos`, // tooltip
        size:
          baseNodeSize +
          (maxProjectCount > 0 ? (node.projectCount / maxProjectCount) * variableNodeSize : 0),
        value: node.projectCount,
        color: {
          background: '#3b82f6',
          border: '#1e40af',
          highlight: {
            background: '#1d4ed8',
            border: '#1e3a8a',
          },
          hover: {
            background: '#2563eb',
            border: '#1e3a8a',
          },
        },
        font: {
          color: '#ffffff',
          size: 18 + (maxProjectCount > 0 ? (node.projectCount / maxProjectCount) * 6 : 0),
          bold: {
            color: '#ffffff',
            size: 18,
          },
        },
      }))
    )

    // Create edges with labels
    const edges = new DataSet(
      data.edges.map((edge) => ({
        from: edge.source,
        to: edge.target,
        value: edge.weight,
        width: Math.max(1, Math.min(5, edge.weight / 2)),
        title: `${edge.collaborations} colaboraciones`,
        label: `${edge.weight}`, // Add weight label
        font: {
          size: 12,
          color: '#666',
          background: {
            enabled: true,
            color: '#ffffff',
            padding: 4,
          },
        },
        color: {
          color: 'rgba(200, 200, 200, 0.5)',
          highlight: '#3b82f6',
        },
      }))
    )

    // Destroy previous instance if exists
    if (networkInstance.current) {
      networkInstance.current.destroy()
    }

    // Create network
    const container = networkRef.current
    const networkData = { nodes, edges }

    const options = {
      nodes: {
        shape: 'circle',
        borderWidth: 2,
        font: {
          color: '#ffffff',
          size: 18,
          align: 'center',
        },
        scaling: {
          min: baseNodeSize,
          max: baseNodeSize + variableNodeSize,
          label: {
            enabled: true,
            min: 16,
            max: 28,
            drawThreshold: 10,
          },
        },
      },
      physics: {
        enabled: true,
        barnesHut: {
          gravitationalConstant: -30000,
          centralGravity: 0.3,
          springLength: 200,
          springConstant: 0.04,
        },
        maxVelocity: 50,
        timestep: 0.35,
        stabilization: {
          iterations: 200,
        },
      },
      interaction: {
        navigationButtons: true,
        keyboard: true,
        zoomView: true,
        dragView: true,
      },
      layout: {
        randomSeed: 42,
      },
    }

    networkInstance.current = new Network(container, networkData, options)

    // Stabilize network
    networkInstance.current.once('stabilizationIterationsDone', () => {
      networkInstance.current?.setOptions({ physics: false })
    })

    return () => {
      if (networkInstance.current) {
        networkInstance.current.destroy()
        networkInstance.current = null
      }
    }
  }, [data])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Red de Colaboración entre Profesores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96 flex items-center justify-center text-sm text-muted-foreground">
            Cargando datos...
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isError || !data?.nodes?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Red de Colaboración entre Profesores</CardTitle>
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
        <CardTitle>Red de Colaboración entre Profesores</CardTitle>
        <p className="text-xs text-muted-foreground mt-2">
          El tamaño de los nodos representa la cantidad de proyectos. El ancho de las líneas representa la cantidad de colaboraciones.
        </p>
      </CardHeader>
      <CardContent>
        <div ref={networkRef} style={{ width: '100%', height: '500px', border: '1px solid #e5e7eb' }} />
      </CardContent>
    </Card>
  )
}
