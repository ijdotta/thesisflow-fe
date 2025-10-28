import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import type { ProjectResponse } from '@/types/ProjectResponse'
import { getRoleDisplayName } from '@/utils/roleMapper'

interface ProjectDetailDialogProps {
  project: ProjectResponse | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProjectDetailDialog({ project, open, onOpenChange }: ProjectDetailDialogProps) {
  if (!project) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="max-w-2xl overflow-y-auto p-6">
        <SheetHeader className="mb-4">
          <SheetTitle className="line-clamp-2">{project.title}</SheetTitle>
        </SheetHeader>

        <div className="space-y-6">
          <div className="space-y-6">
            {/* Header Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant={project.type === 'THESIS' ? 'default' : 'secondary'}>
                  {project.type === 'THESIS' ? 'Tesis' : 'TF'}
                </Badge>
                <span className="text-sm text-muted-foreground">{project.career.name}</span>
                {project.initialSubmission && (
                  <span className="text-sm text-muted-foreground">
                    • {new Date(project.initialSubmission).getFullYear()}
                  </span>
                )}
              </div>
            </div>

            {/* Tags */}
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

            {/* Domain */}
            {project.applicationDomain && (
              <div className="space-y-2">
                <h3 className="font-semibold text-sm">Dominio</h3>
                <p className="text-sm">{project.applicationDomain.name}</p>
                {project.applicationDomain.description && (
                  <p className="text-xs text-muted-foreground">{project.applicationDomain.description}</p>
                )}
              </div>
            )}

            {/* All Participants */}
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">Participantes</h3>
              <div className="space-y-2">
                {project.participants.map((p, idx) => (
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
                  <span className="font-medium">Presentación:</span>{' '}
                  {new Date(project.initialSubmission).toLocaleDateString('es-ES')}
                </div>
                {project.completion && (
                  <div>
                    <span className="font-medium">Finalización:</span>{' '}
                    {new Date(project.completion).toLocaleDateString('es-ES')}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
