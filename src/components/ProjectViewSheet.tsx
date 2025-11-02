import * as React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useProject } from '@/hooks/useProject';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { useOptionalToast } from '@/components/ui/toast';
import { Separator } from '@/components/ui/separator';
import { ProjectResourcesPanel } from '@/components/ProjectResourcesPanel';

const TYPE_LABELS: Record<string,string> = { THESIS: 'Tesis', PROJECT: 'Proyecto Final' };

interface Props { publicId: string | null; open: boolean; onOpenChange: (o:boolean)=>void; initial?: import('@/types/Project').Project | null }

export function ProjectViewSheet({ publicId, open, onOpenChange, initial }: Props) {
  const { data: fetched, isLoading, error } = useProject(open ? publicId : null);
  const { push } = useOptionalToast();
  const titleRef = React.useRef<HTMLHeadingElement | null>(null);
  const [canEdit, setCanEdit] = React.useState(false);

  const project = React.useMemo(() => {
    if (!fetched && initial) return initial;
    if (!fetched) return null;
    // If fetched has empty participants but initial has data, merge participant arrays from initial
    const emptyParticipants = !fetched.directors.length && !fetched.codirectors.length && !fetched.collaborators.length && !fetched.students.length;
    if (emptyParticipants && initial) {
      return { ...fetched, directors: initial.directors, codirectors: initial.codirectors, collaborators: initial.collaborators, students: initial.students };
    }
    return fetched;
  }, [fetched, initial]);

  React.useEffect(() => { if (open && titleRef.current) { titleRef.current.focus(); } }, [open]);

  function close() { onOpenChange(false); }

  function copySummary() {
    if (!project) return;
    const lines: string[] = [];
    lines.push(`Título: ${project.title}`);
    lines.push(`Tipo: ${TYPE_LABELS[project.type] || project.type}`);
    lines.push(`Subtipos: ${project.subtypes.join(', ') || '—'}`);
    lines.push(`Fecha de carga: ${project.initialSubmission || '—'}`);
    lines.push(`Estado: ${project.completion ? 'Finalizado' : 'En curso'}`);
    lines.push(`Dominio: ${project.applicationDomain?.name || '—'}`);
    lines.push('');
    lines.push(`Directores: ${project.directors.map(p => `${p.lastname}, ${p.name}`).join(' | ') || '—'}`);
    lines.push(`Co-directores: ${project.codirectors.map(p => `${p.lastname}, ${p.name}`).join(' | ') || '—'}`);
    lines.push(`Colaboradores: ${project.collaborators.map(p => `${p.lastname}, ${p.name}`).join(' | ') || '—'}`);
    lines.push(`Alumnos: ${project.students.map(p => `${p.lastname}, ${p.name}`).join(' | ') || '—'}`);
    lines.push('');
    lines.push(`Etiquetas: ${(project.tags||[]).map(t=>t.name).join(', ') || '—'}`);
    const text = lines.join('\n');
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(()=> push({ variant:'success', title:'Copiado', message:'Resumen copiado al portapapeles'})).catch(()=> push({ variant:'error', title:'Error', message:'No se pudo copiar'}));
    } else {
      try {
        const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta); push({ variant:'success', title:'Copiado', message:'Resumen copiado'});
      } catch { push({ variant:'error', title:'Error', message:'No se pudo copiar'}); }
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[820px] overflow-y-auto px-6 py-5">
        <SheetHeader className="mb-2">
          <SheetTitle ref={titleRef} tabIndex={-1} className="outline-none">Detalle del Proyecto</SheetTitle>
        </SheetHeader>
        <div className="flex flex-wrap gap-2 mb-4">
          <Button variant="outline" size="sm" onClick={copySummary}>Copiar resumen</Button>
          <Button variant="ghost" size="sm" onClick={close}>Cerrar</Button>
          <span className="text-[11px] text-muted-foreground self-center">ESC para cerrar</span>
        </div>
        <Separator className="my-2" />
        {isLoading && (
          <div className="space-y-4 mt-4">
            {Array.from({length:6}).map((_,i)=>(<Skeleton key={i} className="h-5 w-full" />))}
            <Skeleton className="h-40 w-full" />
          </div>
        )}
        {error && !isLoading && (
          <div className="mt-4 text-sm text-red-600">Error cargando proyecto: {String(error)}</div>
        )}
        {!isLoading && !error && project && (
          <div className="mt-2 space-y-8 text-sm">
            <section className="space-y-3">
              <h3 className="text-base font-semibold tracking-tight">Información General</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <Info label="Título" value={project.title} />
                <Info label="Tipo" value={TYPE_LABELS[project.type] || project.type} />
                <Info label="Subtipos" value={project.subtypes?.join(', ') || '—'} />
                <Info label="Fecha de carga" value={project.initialSubmission || '—'} />
                <Info label="Estado" value={project.completion ? 'Finalizado' : 'En curso'} />
                <Info label="Dominio" value={project.applicationDomain?.name || '—'} />
              </div>
              {project.applicationDomain?.description && (
                <div className="text-xs text-muted-foreground leading-relaxed bg-muted/40 rounded-md p-3 border border-muted/60">
                  {project.applicationDomain.description}
                </div>
              )}
            </section>

            <Separator />
            <section className="space-y-3">
              <h3 className="text-base font-semibold tracking-tight">Participantes</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <ParticipantGroup title="Directores" list={project.directors} />
                <ParticipantGroup title="Co-directores" list={project.codirectors} />
                <ParticipantGroup title="Colaboradores" list={project.collaborators} />
                <ParticipantGroup title="Alumnos" list={project.students} />
              </div>
            </section>

            <Separator />
            <section className="space-y-3">
              <h3 className="text-base font-semibold tracking-tight">Etiquetas</h3>
              <div className="flex flex-wrap gap-2">
                {(project.tags || []).length ? project.tags.map(t => (
                  <Tooltip key={t.publicId}>
                    <TooltipTrigger asChild>
                      <span className="px-2 py-1 rounded-md bg-muted text-xs border cursor-default hover:bg-muted/70 transition-colors">
                        {t.name}
                      </span>
                    </TooltipTrigger>
                    {t.description && (
                      <TooltipContent side="top">{t.description}</TooltipContent>
                    )}
                  </Tooltip>
                )) : <span className="text-xs text-muted-foreground">(Sin etiquetas)</span>}
              </div>
            </section>

            <Separator />
            <section className="space-y-3">
              <ProjectResourcesPanel 
                projectId={project.publicId} 
                resources={project.resources}
                canEdit={canEdit}
              />
            </section>
          </div>
        )}
        <SheetFooter className="mt-8">
          <Button variant="outline" onClick={close}>Cerrar</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col">
      <span className="text-[11px] uppercase tracking-wide text-muted-foreground font-medium">{label}</span>
      <span>{value || '—'}</span>
    </div>
  );
}

function ParticipantGroup({ title, list }: { title: string; list: { name: string; lastname: string; publicId: string }[] }) {
  return (
    <div>
      <div className="text-xs font-semibold mb-1">{title}</div>
      {list.length === 0 && <div className="text-xs text-muted-foreground">(Ninguno)</div>}
      {list.length > 0 && (
        <ul className="list-disc pl-5 space-y-0.5">
          {list.map(p => <li key={p.publicId}>{p.lastname}, {p.name}</li>)}
        </ul>
      )}
    </div>
  );
}
