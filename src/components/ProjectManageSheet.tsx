import * as React from 'react';
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import type { Project } from '@/types/Project';
import { ConfirmDeleteDialog } from '@/components/ConfirmDeleteDialog';
import { deleteProject } from '@/api/projects';
import { useOptionalToast } from '@/components/ui/toast';

interface Props {
  project: Project | null;
  open: boolean;
  onOpenChange: (o:boolean)=>void;
  onDeleted: ()=>void;
}

export function ProjectManageSheet({ project, open, onOpenChange, onDeleted }: Props) {
  const { push } = useOptionalToast();
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const titleRef = React.useRef<HTMLHeadingElement | null>(null);

  React.useEffect(()=> { if (open && titleRef.current) { titleRef.current.focus(); } }, [open]);

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
        <SheetFooter className="gap-2 mt-8">
          <Button variant="outline" size="sm" onClick={()=> onOpenChange(false)}>Cerrar</Button>
        </SheetFooter>
        {project && (
          <ConfirmDeleteDialog
            open={deleteOpen}
            onOpenChange={setDeleteOpen}
            entityName={project.title}
            label="proyecto"
            onConfirm={handleDelete}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}

