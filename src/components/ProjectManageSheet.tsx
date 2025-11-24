import * as React from 'react';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import type { Project } from '@/types/Project';
import { ConfirmDeleteDialog } from '@/components/ConfirmDeleteDialog';
import { deleteProject, setProjectParticipants, setProjectApplicationDomain } from '@/api/projects';
import { useOptionalToast } from '@/components/ui/toast';
import { useAuth } from '@/contexts/useAuth';
import { getStudents } from '@/api/students';
import { getProfessors } from '@/api/professors';
import { getPeople } from '@/api/people';
import { useAllApplicationDomains } from '@/hooks/useAllApplicationDomains';
import { ProjectResourcesSheet } from '@/components/ProjectResourcesSheet';
import { SearchableMultiSelect } from '@/components/projectWizard/components/SearchableMultiSelect';
import { FileText } from 'lucide-react';

const getProjectTypeDisplayName = (type: string): string => {
  return type === 'THESIS' ? 'Tesis' : 'Trabajo Final'
}

interface Props {
  project: Project | null;
  open: boolean;
  onOpenChange: (o:boolean)=>void;
  onDeleted: ()=>void;
}

export function ProjectManageSheet({ project, open, onOpenChange, onDeleted }: Props) {
  const queryClient = useQueryClient();
  const { push } = useOptionalToast();
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [resourcesOpen, setResourcesOpen] = React.useState(false);
  const [selectedStudents, setSelectedStudents] = React.useState<Array<{ publicId: string; name: string; lastname: string }>>([]);
  const [selectedDirectors, setSelectedDirectors] = React.useState<Array<{ publicId: string; name: string; lastname: string }>>([]);
  const [selectedCoDirectors, setSelectedCoDirectors] = React.useState<Array<{ publicId: string; name: string; lastname: string }>>([]);
  const [selectedCollaborators, setSelectedCollaborators] = React.useState<Array<{ publicId: string; name: string; lastname: string }>>([]);
  const [selectedDomainId, setSelectedDomainId] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);
  const titleRef = React.useRef<HTMLHeadingElement | null>(null);

  // Fetch all students
  const { data: studentsPage } = useQuery({
    queryKey: ['students', 'all'],
    queryFn: () => getStudents({ page: 0, size: 1000, sort: { field: 'name', dir: 'asc' } }),
    staleTime: 5 * 60 * 1000,
  });

  // Fetch all professors for directors/co-directors
  const { data: professorsPage } = useQuery({
    queryKey: ['professors', 'all'],
    queryFn: () => getProfessors({ page: 0, size: 1000, sort: { field: 'name', dir: 'asc' } }),
    staleTime: 5 * 60 * 1000,
  });

  // Fetch all people for collaborators
  const { data: peoplePage } = useQuery({
    queryKey: ['people', 'all'],
    queryFn: () => getPeople({ page: 0, size: 1000, sort: { field: 'name', dir: 'asc' } }),
    staleTime: 5 * 60 * 1000,
  });

  const { data: domainsData } = useAllApplicationDomains();
  
  // Combine fetched students with currently selected students
  const allStudents = (studentsPage?.content ?? []).map(s => ({ 
    publicId: s.publicId, 
    name: s.name, 
    lastname: s.lastname,
    display: `${s.lastname}, ${s.name}`
  }));

  // Combine fetched professors with currently selected directors/co-directors
  const allProfessors = (professorsPage?.content ?? []).map(p => ({ 
    publicId: p.publicId, 
    name: p.name, 
    lastname: p.lastname,
    display: `${p.lastname}, ${p.name}`
  }));

  // Combine fetched people with currently selected collaborators
  const allPeople = (peoplePage?.content ?? []).map(p => ({ 
    publicId: p.publicId, 
    name: p.name, 
    lastname: p.lastname,
    display: `${p.lastname}, ${p.name}`
  }));
  
  const selectedStudentsWithDisplay = selectedStudents.map(s => ({
    ...s,
    display: `${s.lastname}, ${s.name}`
  }));
  
  const studentResults = Array.from(
    new Map(
      [
        ...selectedStudentsWithDisplay,
        ...allStudents
      ].map(s => [s.publicId, s])
    ).values()
  );

  // Helper function to create person list results
  const createPersonResults = (selected: typeof selectedStudents, fetched: typeof allStudents) => {
    const selectedWithDisplay = selected.map(s => ({
      ...s,
      display: `${s.lastname}, ${s.name}`
    }));
    
    return Array.from(
      new Map(
        [
          ...selectedWithDisplay,
          ...fetched
        ].map(s => [s.publicId, s])
      ).values()
    );
  };

  const directorResults = createPersonResults(selectedDirectors, allProfessors);
  const coDirectorResults = createPersonResults(selectedCoDirectors, allProfessors);
  const collaboratorResults = createPersonResults(selectedCollaborators, allPeople);
  
  const domains = (domainsData?.items ?? []).sort((a, b) => a.name.localeCompare(b.name));

  React.useEffect(()=> { if (open && titleRef.current) { titleRef.current.focus(); } }, [open]);

  // Initialize selected students, directors, co-directors, collaborators and domain from project
  React.useEffect(() => {
    if (project) {
      setSelectedStudents(project.students.map(s => ({ publicId: s.publicId, name: s.name, lastname: s.lastname })));
      setSelectedDirectors(project.directors.map(s => ({ publicId: s.publicId, name: s.name, lastname: s.lastname })));
      setSelectedCoDirectors(project.codirectors.map(s => ({ publicId: s.publicId, name: s.name, lastname: s.lastname })));
      setSelectedCollaborators(project.collaborators.map(s => ({ publicId: s.publicId, name: s.name, lastname: s.lastname })));
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

  function removeStudent(publicId: string) {
    setSelectedStudents(selectedStudents.filter(s => s.publicId !== publicId));
  }

  function removeDirector(publicId: string) {
    setSelectedDirectors(selectedDirectors.filter(s => s.publicId !== publicId));
  }

  function removeCoDirector(publicId: string) {
    setSelectedCoDirectors(selectedCoDirectors.filter(s => s.publicId !== publicId));
  }

  function removeCollaborator(publicId: string) {
    setSelectedCollaborators(selectedCollaborators.filter(s => s.publicId !== publicId));
  }

  async function handleSaveParticipants() {
    if (!project) return;
    setSaving(true);
    try {
      // Send all participants - setParticipants now replaces all existing ones
      const participants = [
        ...selectedDirectors.map(d => ({ personId: d.publicId, role: 'DIRECTOR' as const })),
        ...selectedCoDirectors.map(d => ({ personId: d.publicId, role: 'CO_DIRECTOR' as const })),
        ...selectedCollaborators.map(c => ({ personId: c.publicId, role: 'COLLABORATOR' as const })),
        ...selectedStudents.map(s => ({ personId: s.publicId, role: 'STUDENT' as const })),
      ];

      await setProjectParticipants(project.publicId, participants);
      
      // Update project reference with all participants
      Object.assign(project, { 
        students: selectedStudents,
        directors: selectedDirectors,
        codirectors: selectedCoDirectors,
        collaborators: selectedCollaborators
      });
      
      // Invalidate both projects list and individual project query to refresh from backend
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', project.publicId] });
      
      push({ variant:'success', title:'Actualizado', message:'Participantes actualizados correctamente'});
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
      
      // Invalidate both projects list and individual project query to refresh from backend
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', project.publicId] });
      
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
                <div>{getProjectTypeDisplayName(project.type)}</div>
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

            {isAdmin && (
            <section className="space-y-3 border-t pt-6">
              <h3 className="text-sm font-semibold tracking-tight">Gestionar Participantes</h3>
              
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Directores</label>
                <SearchableMultiSelect
                  items={directorResults.map(s => ({ publicId: s.publicId, name: s.name, display: s.display }))}
                  selectedIds={selectedDirectors.map(s => s.publicId)}
                  onSelect={(id) => {
                    const director = directorResults.find(s => s.publicId === id);
                    if (director && !selectedDirectors.some(s => s.publicId === id)) {
                      setSelectedDirectors([...selectedDirectors, { publicId: director.publicId, name: director.name, lastname: director.lastname }]);
                    }
                  }}
                  onRemove={(id) => removeDirector(id)}
                  placeholder="Buscar y seleccionar directores"
                  hideAddButton={true}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Co-Directores</label>
                <SearchableMultiSelect
                  items={coDirectorResults.map(s => ({ publicId: s.publicId, name: s.name, display: s.display }))}
                  selectedIds={selectedCoDirectors.map(s => s.publicId)}
                  onSelect={(id) => {
                    const coDirector = coDirectorResults.find(s => s.publicId === id);
                    if (coDirector && !selectedCoDirectors.some(s => s.publicId === id)) {
                      setSelectedCoDirectors([...selectedCoDirectors, { publicId: coDirector.publicId, name: coDirector.name, lastname: coDirector.lastname }]);
                    }
                  }}
                  onRemove={(id) => removeCoDirector(id)}
                  placeholder="Buscar y seleccionar co-directores"
                  hideAddButton={true}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Colaboradores</label>
                <SearchableMultiSelect
                  items={collaboratorResults.map(s => ({ publicId: s.publicId, name: s.name, display: s.display }))}
                  selectedIds={selectedCollaborators.map(s => s.publicId)}
                  onSelect={(id) => {
                    const collaborator = collaboratorResults.find(s => s.publicId === id);
                    if (collaborator && !selectedCollaborators.some(s => s.publicId === id)) {
                      setSelectedCollaborators([...selectedCollaborators, { publicId: collaborator.publicId, name: collaborator.name, lastname: collaborator.lastname }]);
                    }
                  }}
                  onRemove={(id) => removeCollaborator(id)}
                  placeholder="Buscar y seleccionar colaboradores"
                  hideAddButton={true}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Estudiantes</label>
                <SearchableMultiSelect
                  items={studentResults.map(s => ({ publicId: s.publicId, name: s.name, display: s.display }))}
                  selectedIds={selectedStudents.map(s => s.publicId)}
                  onSelect={(id) => {
                    const student = studentResults.find(s => s.publicId === id);
                    if (student && !selectedStudents.some(s => s.publicId === id)) {
                      setSelectedStudents([...selectedStudents, { publicId: student.publicId, name: student.name, lastname: student.lastname }]);
                    }
                  }}
                  onRemove={(id) => removeStudent(id)}
                  placeholder="Buscar y seleccionar estudiantes"
                  hideAddButton={true}
                />
              </div>

              <Button
                variant="default"
                size="sm"
                onClick={handleSaveParticipants}
                disabled={saving}
              >
                {saving ? 'Guardando...' : 'Guardar Participantes'}
              </Button>
            </section>
            )}

            <section className="border-t pt-6 space-y-3">
              <h3 className="text-sm font-semibold tracking-tight">Recursos</h3>
              <Button 
                variant="outline"
                size="sm"
                onClick={() => setResourcesOpen(true)}
                disabled={!project}
              >
                <FileText className="h-4 w-4 mr-1" />
                Gestionar Recursos
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
