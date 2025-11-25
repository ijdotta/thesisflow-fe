import { useState, useMemo, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { publicAPI } from '@/api/publicApi'
import { useAnalyticsFilters } from '@/pages/public/AnalyticsContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { ProjectDetailDialog } from '@/components/ProjectDetailDialog'
import { getRoleDisplayName, sortParticipants } from '@/utils/roleMapper'
import type { ProjectResponse } from '@/types/ProjectResponse'

export function BrowseProjectsPage() {
  const { filters } = useAnalyticsFilters()
  const [searchParams, setSearchParams] = useSearchParams()
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [pageSize] = useState(12)
  const [selectedProject, setSelectedProject] = useState<ProjectResponse | null>(null)

  // Sync search to URL
  useEffect(() => {
    if (search) {
      setSearchParams({ search })
    } else {
      setSearchParams({})
    }
  }, [search, setSearchParams])

  const { data, isLoading, isError } = useQuery({
    queryKey: ['browse-projects', { ...filters, search, page, size: pageSize }],
    queryFn: () => publicAPI.browseProjects({ ...filters, search, page, size: pageSize }),
    staleTime: 5 * 60 * 1000,
  })

  const totalPages = data?.totalPages || 0

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Buscar por título, etiqueta, tema o nombre (separar múltiples con ;)..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(0)
          }}
          className="pl-10"
        />
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Cargando proyectos...</p>
        </div>
      ) : isError ? (
        <div className="text-center py-12">
          <p className="text-red-500">Error al cargar los proyectos</p>
        </div>
      ) : !data?.content?.length ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No hay proyectos que coincidan con tu búsqueda</p>
        </div>
      ) : (
        <>
          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.content.map((project) => (
              <Card
                key={project.publicId}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSelectedProject(project)}
              >
                <CardHeader>
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg line-clamp-2">{project.title}</CardTitle>
                      <Badge variant={project.type === 'THESIS' || project.type === 'FINAL_PROJECT' ? 'default' : 'outline'}>
                        {project.type === 'THESIS' ? 'Tesis' : project.type === 'FINAL_PROJECT' ? 'Proyecto Final' : project.type}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{project.career.name}</span>
                      {project.initialSubmission && (
                        <>
                          <span>•</span>
                          <span>{new Date(project.initialSubmission).getFullYear()}</span>
                        </>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  {/* Application Domain - Top Level Badge */}
                  {project.applicationDomainDTO && (
                    <div>
                      <Badge variant="secondary">
                        {project.applicationDomainDTO.name}
                      </Badge>
                    </div>
                  )}

                  {/* Tags - Lower Relevance */}
                  {project.tags?.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">Etiquetas</p>
                      <div className="flex flex-wrap gap-1">
                        {project.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag.publicId} variant="outline" className="text-xs">
                            {tag.name}
                          </Badge>
                        ))}
                        {project.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{project.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Participants */}
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Participantes</p>
                    <div className="space-y-1 text-xs">
                      {sortParticipants(project.participants).slice(0, 3).map((p, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                          <span className="text-muted-foreground">{getRoleDisplayName(p.role)}</span>
                          <span className="font-medium">
                            {p.personDTO.name} {p.personDTO.lastname}
                          </span>
                        </div>
                      ))}
                      {project.participants.length > 3 && (
                        <div className="text-muted-foreground italic cursor-pointer hover:underline" onClick={(e) => { e.stopPropagation(); setSelectedProject(project); }}>
                          +{project.participants.length - 3} más
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
                    <div>
                      <span className="font-medium">Consejo:</span> {new Date(project.initialSubmission).toLocaleDateString('es-ES')}
                    </div>
                    <div>
                      <span className="font-medium">Finalización:</span> {project.completion ? new Date(project.completion).toLocaleDateString('es-ES') : <span className="italic text-amber-600">pendiente</span>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Página {page + 1} de {totalPages} • Total: {data.totalElements} proyectos
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page === totalPages - 1}
                >
                  Siguiente
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <ProjectDetailDialog
        project={selectedProject}
        open={!!selectedProject}
        onOpenChange={(open) => !open && setSelectedProject(null)}
      />
    </div>
  )
}
