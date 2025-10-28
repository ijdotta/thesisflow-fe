import { useQuery } from '@tanstack/react-query'
import { publicAPI } from '@/api/publicApi'
import { useAnalyticsFilters } from '@/pages/public/AnalyticsContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function DashboardStats() {
  const { filters } = useAnalyticsFilters()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard-stats', filters],
    queryFn: () => publicAPI.getDashboardStats(filters),
    staleTime: 5 * 60 * 1000,
  })

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Cargando estadísticas...</div>
  }

  if (isError || !data) {
    return <div className="text-sm text-muted-foreground">Error al cargar las estadísticas</div>
  }

  const { overview, topDomains, topTags, topProfessors } = data
  const totalTopics =
    overview.totalTopics ?? overview.uniqueTopics ?? overview.uniqueTags ?? 0
  const topicsInRange = overview.topicsInDateRange ?? null

  const showTopicsInRange = topicsInRange !== null

  const filteredProjectPercent =
    overview.totalProjects > 0
      ? ((overview.filteredProjects / overview.totalProjects) * 100).toFixed(1)
      : '0.0'
  const filteredTopicsPercent =
    showTopicsInRange && totalTopics > 0
      ? ((topicsInRange / totalTopics) * 100).toFixed(1)
      : null
  const statGridCols = showTopicsInRange ? 'lg:grid-cols-6' : 'lg:grid-cols-5'

  return (
    <div className="space-y-6">
      {/* Overview Stats Grid */}
      <div className={`grid grid-cols-1 md:grid-cols-2 ${statGridCols} gap-4`}>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm font-medium text-muted-foreground mb-2">Total de Proyectos</div>
            <div className="text-3xl font-bold">{overview.totalProjects}</div>
          </CardContent>
        </Card>
        <Card className="border-blue-300 bg-blue-50 dark:bg-blue-950/30">
          <CardContent className="pt-6">
            <div className="text-sm font-medium text-muted-foreground mb-2">Proyectos (en rango)</div>
            <div className="text-3xl font-bold">{overview.filteredProjects}</div>
            <div className="text-xs text-slate-600 dark:text-slate-400 mt-2">
              {filteredProjectPercent}% del total
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm font-medium text-muted-foreground mb-2">Temas Totales</div>
            <div className="text-3xl font-bold">{totalTopics}</div>
          </CardContent>
        </Card>
        {showTopicsInRange && (
          <Card className="border-purple-300 bg-purple-50 dark:bg-purple-950/30">
            <CardContent className="pt-6">
              <div className="text-sm font-medium text-muted-foreground mb-2">Temas (en rango)</div>
              <div className="text-3xl font-bold">{topicsInRange}</div>
              {filteredTopicsPercent && (
                <div className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                  {filteredTopicsPercent}% del total
                </div>
              )}
            </CardContent>
          </Card>
        )}
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm font-medium text-muted-foreground mb-2">Dominios Únicos</div>
            <div className="text-3xl font-bold">{overview.uniqueDomains}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm font-medium text-muted-foreground mb-2">Profesores</div>
            <div className="text-3xl font-bold">{overview.uniqueProfessors}</div>
          </CardContent>
        </Card>
      </div>

      {/* Top Items Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Dominios</CardTitle>
          </CardHeader>
          <CardContent>
            {topDomains && topDomains.length > 0 ? (
              <div className="space-y-2">
                {topDomains.map((domain, index) => (
                  <div key={domain.id} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-500 w-6">#{index + 1}</span>
                      <span className="text-sm text-slate-700 dark:text-slate-300">{domain.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">{domain.count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground text-center py-4">Sin datos</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Temas</CardTitle>
          </CardHeader>
          <CardContent>
            {topTags && topTags.length > 0 ? (
              <div className="space-y-2">
                {topTags.map((tag, index) => (
                  <div key={tag.id} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-500 w-6">#{index + 1}</span>
                      <span className="text-sm text-slate-700 dark:text-slate-300">{tag.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">{tag.count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground text-center py-4">Sin datos</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Profesores</CardTitle>
          </CardHeader>
          <CardContent>
            {topProfessors && topProfessors.length > 0 ? (
              <div className="space-y-2">
                {topProfessors.map((prof, index) => (
                  <div key={prof.id} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-500 w-6">#{index + 1}</span>
                      <span className="text-sm text-slate-700 dark:text-slate-300">{prof.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">{prof.projectCount}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground text-center py-4">Sin datos</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
