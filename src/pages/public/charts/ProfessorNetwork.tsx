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

    // Calculate total edge weight per node
    const edgeWeightSum = new Map<string, number>()
    data.nodes.forEach((node) => {
      edgeWeightSum.set(node.id, 0)
    })
    data.edges.forEach((edge) => {
      edgeWeightSum.set(edge.source, (edgeWeightSum.get(edge.source) || 0) + edge.weight)
      edgeWeightSum.set(edge.target, (edgeWeightSum.get(edge.target) || 0) + edge.weight)
    })

    // Create nodes
    const projectCounts = data.nodes.map((n) => n.projectCount)
    const maxProjectCount = projectCounts.length ? Math.max(...projectCounts) : 0
    const weights = Array.from(edgeWeightSum.values())
    const maxWeight = weights.length ? Math.max(...weights) : 0
    const minNodeSize = 30
    const maxNodeSize = 300

    const nodes = new DataSet(
      data.nodes.map((node) => {
        // Scale node size proportionally to project count
        const nodeSize =
          minNodeSize + node.projectCount * 10

        // Mass based on total edge weight
        const nodeTotalWeight = edgeWeightSum.get(node.id) || 0
        const mass = 1 + (maxWeight > 0 ? (nodeTotalWeight / maxWeight) * 3 : 0)

        return {
          id: node.id,
          label: `${node.name}\n${node.projectCount}`,
          title: `${node.name}\n${node.projectCount} proyectos\n${nodeTotalWeight} colaboraciones`, // tooltip
          size: nodeSize,
          value: node.projectCount,
          mass: mass,
          widthConstraint: {
            maximum: 200,
          },
          margin: {
            top: 35,
            right: 10,
            bottom: 10,
            left: 10,
          },
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
            size: 14 + (maxProjectCount > 0 ? (node.projectCount / maxProjectCount) * 8 : 0),
            bold: {
              color: '#ffffff',
              size: 16 + (maxProjectCount > 0 ? (node.projectCount / maxProjectCount) * 8 : 0),
            },
            multi: true,
          },
        }
      })
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
          size: 13,
          color: '#ffffff',
          face: 'Inter, system-ui, sans-serif',
          strokeColor: '#ffffff',
          strokeWidth: 1,
          background: {
            enabled: true,
            color: 'rgba(15, 23, 42, 0.85)',
            padding: 6,
            cornerRadius: 4,
          },
        },
        color: {
          color: 'rgba(148, 163, 184, 0.7)',
          highlight: '#1e40af',
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
          size: 16,
          align: 'center',
        },
        scaling: {
          min: minNodeSize,
          max: maxNodeSize,
          label: {
            enabled: true,
            min: 14,
            max: 22,
            drawThreshold: 5,
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
