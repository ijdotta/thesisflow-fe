import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/contexts/useAuth'
import { publicAPI } from '@/api/publicApi'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import AdminLayout from '@/layouts/AdminLayout'

export function ProfessorAnalyticsPage() {
  const { user } = useAuth()
  const { data: currentUserData } = useCurrentUser()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['professor-dashboard-stats', currentUserData?.id],
    queryFn: () => {
      if (!currentUserData?.id) throw new Error('Professor ID not available')
      return publicAPI.getProfessorStats([currentUserData.id])
    },
    staleTime: 5 * 60 * 1000,
    enabled: user?.role === 'PROFESSOR' && !!currentUserData?.id,
  })

  if (!user || user.role !== 'PROFESSOR') {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-red-500">Acceso denegado</p>
        </div>
      </AdminLayout>
    )
  }

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Cargando estadísticas...</p>
        </div>
      </AdminLayout>
    )
  }

  if (isError || !data) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-red-500">Error al cargar las estadísticas</p>
        </div>
      </AdminLayout>
    )
  }

  const { overview, topDomains, topTags } = data

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Mis Estadísticas</h1>
          <p className="text-muted-foreground mt-1">Análisis de tus proyectos y colaboraciones</p>
        </div>

        {/* Overview Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm font-medium text-muted-foreground mb-2">Mis Proyectos</div>
              <div className="text-3xl font-bold">{overview.filteredProjects}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm font-medium text-muted-foreground mb-2">Dominios Únicos</div>
              <div className="text-3xl font-bold">{overview.uniqueDomains}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm font-medium text-muted-foreground mb-2">Temas Únicos</div>
              <div className="text-3xl font-bold">{overview.uniqueTags}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm font-medium text-muted-foreground mb-2">Colaboradores</div>
              <div className="text-3xl font-bold">{overview.uniqueProfessors}</div>
            </CardContent>
          </Card>
        </div>

        {/* Top Items Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Dominios en mis Proyectos</CardTitle>
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
              <CardTitle className="text-base">Temas en mis Proyectos</CardTitle>
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
        </div>
      </div>
    </AdminLayout>
  )
}
