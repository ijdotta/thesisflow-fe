import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import type { ProjectResponse } from '@/types/ProjectResponse'
import { getRoleDisplayName, sortParticipants } from '@/utils/roleMapper'
import { ProjectResourcesPanel } from '@/components/ProjectResourcesPanel'

interface ProjectDetailDialogProps {
  project: ProjectResponse | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProjectDetailDialog({ project, open, onOpenChange }: ProjectDetailDialogProps) {
  if (!project) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto p-4 sm:p-6">
        <SheetHeader className="mb-4">
          <SheetTitle className="line-clamp-2">{project.title}</SheetTitle>
        </SheetHeader>

        <div className="space-y-6">
          <div className="space-y-6">
            {/* Header Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant={project.type === 'THESIS' || project.type === 'FINAL_PROJECT' ? 'default' : 'outline'}>
                  {project.type === 'THESIS' ? 'Tesis' : project.type === 'FINAL_PROJECT' ? 'Proyecto Final' : project.type}
                </Badge>
                <span className="text-sm text-muted-foreground">{project.career.name}</span>
                {project.initialSubmission && (
                  <span className="text-sm text-muted-foreground">
                    • {new Date(project.initialSubmission).getFullYear()}
                  </span>
                )}
              </div>
            </div>

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
              <div className="space-y-2">
                <h3 className="font-semibold text-sm">Etiquetas</h3>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <Badge key={tag.publicId} variant="outline">
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* All Participants */}
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">Participantes</h3>
              <div className="space-y-2">
                {sortParticipants(project.participants).map((p, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                    <span className="text-xs font-medium text-muted-foreground">
                      {getRoleDisplayName(p.role)}
                    </span>
                    <span className="text-sm font-medium">
                      {p.personDTO.name} {p.personDTO.lastname}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Dates */}
            <div className="space-y-2 pt-2 border-t">
              <h3 className="font-semibold text-sm">Fechas</h3>
              <div className="space-y-1 text-sm">
                <div>
                  <span className="font-medium">Consejo:</span>{' '}
                  {new Date(project.initialSubmission).toLocaleDateString('es-ES')}
                </div>
                <div>
                  <span className="font-medium">Finalización:</span>{' '}
                  {project.completion ? new Date(project.completion).toLocaleDateString('es-ES') : <span className="italic text-amber-600">pendiente</span>}
                </div>
              </div>
            </div>

            {/* Resources */}
            {project.resources && project.resources.length > 0 && (
              <>
                <Separator />
                <div className="space-y-2">
                  <ProjectResourcesPanel 
                    projectId={project.publicId} 
                    resources={project.resources}
                    canEdit={false}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
