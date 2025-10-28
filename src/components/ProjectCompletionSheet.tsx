import * as React from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useOptionalToast } from '@/components/ui/toast'
import { setProjectCompletionDate } from '@/api/projects'
import { useQueryClient } from '@tanstack/react-query'
import type { Project } from '@/types/Project'
import { CalendarCheck2 } from 'lucide-react'

interface Props {
  project: Project | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProjectCompletionSheet({ project, open, onOpenChange }: Props) {
  const queryClient = useQueryClient()
  const { push } = useOptionalToast()
  const [completionDate, setCompletionDate] = React.useState('')
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (open && project) {
      const current = project.completion ? project.completion.slice(0, 10) : ''
      setCompletionDate(current)
      setError(null)
    }
    if (!open) {
      setCompletionDate('')
      setError(null)
    }
  }, [open, project])

  async function handleSave() {
    if (!project) return
    if (!completionDate) {
      setError('Selecciona una fecha para continuar.')
      return
    }
    const formatted = completionDate
    try {
      setSaving(true)
      setError(null)
      await setProjectCompletionDate(project.publicId, formatted)
      push({
        variant: 'success',
        title: 'Fecha de finalización guardada',
        message: 'La fecha de finalización se actualizó correctamente.',
      })
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      onOpenChange(false)
    } catch (e: any) {
      push({
        variant: 'error',
        title: 'Error al guardar',
        message: e?.message || 'No se pudo actualizar la fecha.',
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[480px] px-6 py-6 overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Fecha de finalización</SheetTitle>
        </SheetHeader>

        {!project && (
          <div className="mt-4 text-sm text-muted-foreground">Selecciona un proyecto para continuar.</div>
        )}

        {project && (() => {
          const initialDate = project.initialSubmission ? project.initialSubmission.slice(0, 10) : ''
          const currentCompletion = project.completion ? project.completion.slice(0, 10) : ''
          const minDate = initialDate || undefined
          return (
          <div className="mt-6 space-y-6">
            <section className="space-y-3">
              <h3 className="text-sm font-semibold tracking-tight">Proyecto</h3>
              <div className="flex items-center gap-2 rounded-md border bg-muted/60 px-3 py-2 text-sm">
                <CalendarCheck2 className="h-4 w-4 shrink-0" />
                <span className="line-clamp-2 font-medium">{project.title}</span>
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-semibold tracking-tight">Seleccionar fecha</h3>
                  <p className="text-xs text-muted-foreground">
                    El proyecto se marcará como finalizado en la fecha indicada.
                  </p>
                </div>
              </div>
              <Input
                type="date"
                value={completionDate}
                min={minDate}
                onChange={(e) => {
                  setCompletionDate(e.target.value)
                  if (error) setError(null)
                }}
              />
              {error && <p className="text-xs text-red-600">{error}</p>}
              <div className="grid gap-1 text-xs text-muted-foreground">
                <span>Inicio: {initialDate || '—'}</span>
                <span>Actual: {currentCompletion || 'Sin definir'}</span>
              </div>
            </section>
          </div>
        )})()}

        <SheetFooter className="mt-8 gap-2">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving || !project}>
            {saving ? 'Guardando…' : 'Guardar'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
