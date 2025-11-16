import * as React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import type { Project } from '@/types/Project';
import { ConfirmDeleteDialog } from '@/components/ConfirmDeleteDialog';
import { deleteProject, setProjectParticipants, setProjectApplicationDomain } from '@/api/projects';
import { useOptionalToast } from '@/components/ui/toast';
import { useSearchStudents } from '@/hooks/useSearchStudents';
import { useAllApplicationDomains } from '@/hooks/useAllApplicationDomains';
import { useDebounce } from '@/hooks/useDebounce';
import { ProjectResourcesSheet } from '@/components/ProjectResourcesSheet';
import { SearchableMultiSelect } from '@/components/projectWizard/components/SearchableMultiSelect';
import { X, FileText } from 'lucide-react';

interface Props {
  project: Project | null;
  open: boolean;
  onOpenChange: (o:boolean)=>void;
  onDeleted: ()=>void;
}

export function ProjectManageSheet({ project, open, onOpenChange, onDeleted }: Props) {
  const queryClient = useQueryClient();
  const { push } = useOptionalToast();
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [resourcesOpen, setResourcesOpen] = React.useState(false);
  const [selectedStudents, setSelectedStudents] = React.useState<Array<{ publicId: string; name: string; lastname: string }>>([]);
  const [studentQuery, setStudentQuery] = React.useState('');
  const [selectedDomainId, setSelectedDomainId] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);
  const titleRef = React.useRef<HTMLHeadingElement | null>(null);

  const debouncedQuery = useDebounce(studentQuery, 300);
  const { data: studentsData } = useSearchStudents(debouncedQuery);
  const { data: domainsData } = useAllApplicationDomains();
  const studentResults = studentsData?.items ?? [];
  const domains = (domainsData?.items ?? []).sort((a, b) => a.name.localeCompare(b.name));

  React.useEffect(()=> { if (open && titleRef.current) { titleRef.current.focus(); } }, [open]);

  // Initialize selected students and domain from project
  React.useEffect(() => {
    if (project) {
      setSelectedStudents(project.students.map(s => ({ publicId: s.publicId, name: s.name, lastname: s.lastname })));
      setSelectedDomainId(project.applicationDomain?.publicId ?? null);
    }
  }, [project]);

  async function handleDelete() {
    if (!project) return;
    try {
      await deleteProject(project.publicId);
      push({ variant:'success', title:'Eliminado', message:'Proyecto eliminado'});
      setDeleteOpen(false);
      onOpenChange(false);
      onDeleted();
    } catch (err:any) {
      push({ variant:'error', title:'Error', message: err?.message || 'No se pudo eliminar'});
    }
  }

  function addStudent(student: { publicId: string; name: string; lastname: string }) {
    if (!selectedStudents.some(s => s.publicId === student.publicId)) {
      setSelectedStudents([...selectedStudents, student]);
      setStudentQuery('');
    }
  }

  function removeStudent(publicId: string) {
    setSelectedStudents(selectedStudents.filter(s => s.publicId !== publicId));
  }

  async function handleSaveStudents() {
    if (!project) return;
    setSaving(true);
    try {
      // Rebuild all participants with updated students
      const participants = [
        ...project.directors.map(d => ({ personId: d.publicId, role: 'DIRECTOR' as const })),
        ...project.codirectors.map(d => ({ personId: d.publicId, role: 'CO_DIRECTOR' as const })),
        ...project.collaborators.map(c => ({ personId: c.publicId, role: 'COLLABORATOR' as const })),
        ...selectedStudents.map(s => ({ personId: s.publicId, role: 'STUDENT' as const })),
      ];

      await setProjectParticipants(project.publicId, participants);
      push({ variant:'success', title:'Actualizado', message:'Estudiantes actualizados correctamente'});
      onDeleted(); // Trigger refresh
    } catch (err:any) {
      push({ variant:'error', title:'Error', message: err?.message || 'No se pudo actualizar'});
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveDomain(domainPublicId: string | null) {
    if (!project) return;
    try {
      await setProjectApplicationDomain(project.publicId, domainPublicId);
      
      // Find the domain object to update project state
      let newDomain = null;
      if (domainPublicId) {
        const found = domains.find(d => d.publicId === domainPublicId);
        if (found) {
          newDomain = { publicId: found.publicId, name: found.name };
        }
      }
      
      // Update project reference to reflect change immediately
      Object.assign(project, { applicationDomain: newDomain });
      
      // Update local state to trigger re-render and show selection
      setSelectedDomainId(domainPublicId);
      
      // Invalidate projects query to refresh from backend
      await queryClient.invalidateQueries({ queryKey: ['projects'] });
      
      push({ variant:'success', title:'Actualizado', message:'Dominio actualizado correctamente'});
    } catch (err:any) {
      push({ variant:'error', title:'Error', message: err?.message || 'No se pudo actualizar el dominio'});
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[560px] px-6 py-6 overflow-y-auto">
        <SheetHeader>
          <SheetTitle ref={titleRef} tabIndex={-1} className="outline-none">Gestionar Proyecto</SheetTitle>
        </SheetHeader>
        {!project && (
          <div className="text-sm text-muted-foreground mt-4">No hay datos del proyecto.</div>
        )}
        {project && (
          <div className="mt-4 space-y-6 text-sm">
            <section className="space-y-3">
              <h3 className="text-xs font-semibold tracking-wide text-muted-foreground">Información</h3>
              <div className="space-y-1">
                <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Título</div>
                <div>{project.title}</div>
              </div>
              <div className="space-y-1">
                <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Tipo</div>
                <div>{project.type}</div>
              </div>
              <div className="space-y-1">
                <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Carrera</div>
                <div>{project.career?.name || '-'}</div>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] uppercase tracking-wide text-muted-foreground">Dominio</label>
                <SearchableMultiSelect
                  items={domains.map(d => ({ publicId: d.publicId, name: d.name, display: d.display }))}
                  selectedIds={selectedDomainId ? [selectedDomainId] : []}
                  onSelect={(id) => handleSaveDomain(id)}
                  onRemove={(id) => {
                    if (selectedDomainId === id) {
                      handleSaveDomain(null);
                    }
                  }}
                  placeholder="Seleccione dominio"
                  hideAddButton={true}
                />
              </div>
            </section>

            <section className="space-y-3 border-t pt-6">
              <h3 className="text-sm font-semibold tracking-tight">Gestionar Estudiantes</h3>
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Buscar estudiante</label>
                <Input
                  value={studentQuery}
                  onChange={e => setStudentQuery(e.target.value)}
                  placeholder="Buscar por nombre o apellido"
                />
                {!!studentResults.length && studentQuery && (
                  <div className="max-h-40 overflow-auto border rounded-md divide-y text-sm bg-background">
                    {studentResults.map(student => (
                      <button
                        key={student.publicId}
                        type="button"
                        onClick={() => addStudent({ publicId: student.publicId, name: student.name, lastname: student.lastname })}
                        className="w-full text-left px-2 py-1 hover:bg-accent"
                        disabled={selectedStudents.some(s => s.publicId === student.publicId)}
                      >
                        {student.display}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Estudiantes seleccionados</label>
                <div className="flex flex-wrap gap-2">
                  {selectedStudents.map(student => (
                    <Badge key={student.publicId} variant="secondary" className="gap-1">
                      {student.lastname}, {student.name}
                      <button
                        type="button"
                        onClick={() => removeStudent(student.publicId)}
                        className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                  {selectedStudents.length === 0 && (
                    <span className="text-xs text-muted-foreground">Sin estudiantes</span>
                  )}
                </div>
              </div>

              <Button
                variant="default"
                size="sm"
                onClick={handleSaveStudents}
                disabled={saving}
              >
                {saving ? 'Guardando...' : 'Guardar Estudiantes'}
              </Button>
            </section>

            <section className="border-t pt-6 space-y-4">
              <h3 className="text-sm font-semibold tracking-tight text-destructive">Zona Peligrosa</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">Eliminar este proyecto es irreversible. Usa el botón de abajo para continuar.</p>
              <div>
                <Button variant="destructive" size="sm" onClick={()=> setDeleteOpen(true)}>Eliminar…</Button>
              </div>
            </section>
          </div>
        )}
        <SheetFooter className="gap-2 mt-8 flex flex-wrap">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setResourcesOpen(true)}
            disabled={!project}
          >
            <FileText className="h-4 w-4 mr-1" />
            Recursos
          </Button>
          <Button variant="outline" size="sm" onClick={()=> onOpenChange(false)}>Cerrar</Button>
        </SheetFooter>
        {project && (
          <>
            <ConfirmDeleteDialog
              open={deleteOpen}
              onOpenChange={setDeleteOpen}
              entityName={project.title}
              label="proyecto"
              onConfirm={handleDelete}
            />
            <ProjectResourcesSheet
              project={project}
              open={resourcesOpen}
              onOpenChange={setResourcesOpen}
            />
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
