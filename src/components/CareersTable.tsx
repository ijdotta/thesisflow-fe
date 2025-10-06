import * as React from 'react';
import { DataTable, type Column, type Sort } from '@/components/DataTable';
import { Button } from '@/components/ui/button';
import { Edit, Plus, Trash, Loader2 } from 'lucide-react';
import { usePagedCareers } from '@/hooks/usePagedCareers';
import type { FriendlyCareer } from '@/types/FriendlyEntities';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { createCareer, updateCareer, deleteCareer } from '@/api/careers';
import { ConfirmDeleteDialog } from '@/components/ConfirmDeleteDialog';
import { useQueryClient } from '@tanstack/react-query';
import { useOptionalToast } from '@/components/ui/toast';

export default function CareersTable() {
  const [page, setPage] = React.useState(0);
  const [size, setSize] = React.useState(25);
  const [sort, setSort] = React.useState<Sort>({ field: 'name', dir: 'asc' });
  const [filters, setFilters] = React.useState<Record<string,string>>({});
  const [editing, setEditing] = React.useState<{ mode: 'create'|'edit'; entity?: FriendlyCareer | null } | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [deleteState, setDeleteState] = React.useState<{ open: boolean; target?: FriendlyCareer | null }>({ open:false });

  const queryClient = useQueryClient();
  const { push } = useOptionalToast();

  const { data, isLoading, error } = usePagedCareers({ page, size, sort, filters });
  const careers = data?.careers || [];
  const total = data?.totalElements || 0;

  const columns = React.useMemo<Column<FriendlyCareer>[]>(() => [
    { id: 'name', header: 'Nombre', accessor: r => r.name, sortField: 'name', filter: { type: 'text', placeholder: 'Filtrar nombre'} },
    { id: 'actions', header: 'Acciones', accessor: (row) => (
      <div className="flex gap-2">
        <Button size="sm" variant="default" onClick={() => setEditing({ mode: 'edit', entity: row })} title="Editar"><Edit className="h-4 w-4" /></Button>
        <Button size="sm" variant="destructive" title="Eliminar" onClick={() => setDeleteState({ open:true, target: row })}><Trash className="h-4 w-4" /></Button>
      </div>
    ) },
  ], []);

  function openCreate() { setEditing({ mode: 'create' }); }
  function closeSheet() { setEditing(null); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    const fd = new FormData(e.currentTarget as HTMLFormElement);
    const body = { name: String(fd.get('name')||'').trim() };
    if (!body.name) { push({ variant:'error', title:'Falta nombre', message:'Nombre es obligatorio'}); setSaving(false); return; }
    try {
      if (editing?.mode === 'create') { await createCareer(body); push({ variant:'success', title:'Creado', message:'Carrera creada'}); }
      else if (editing?.mode === 'edit' && editing.entity) { await updateCareer(editing.entity.publicId, body); push({ variant:'success', title:'Actualizado', message:'Carrera actualizada'}); }
      queryClient.invalidateQueries({ queryKey: ['careers'] });
      closeSheet();
    } catch (err:any) { push({ variant:'error', title:'Error', message: err?.message || 'Operación fallida'}); }
    finally { setSaving(false); }
  }

  const entity = editing?.entity;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">Carreras</h2>
        <Button size="sm" onClick={openCreate} className="gap-1"><Plus className="h-4 w-4" /> Nueva</Button>
      </div>
      <DataTable<FriendlyCareer>
        columns={columns}
        rows={careers}
        total={total}
        loading={isLoading}
        error={error ? String(error) : null}
        page={page}
        size={size}
        sort={sort}
        filters={filters}
        onPageChange={setPage}
        onSizeChange={setSize}
        onSortChange={setSort}
        onFiltersChange={setFilters}
      />
      <Sheet open={!!editing} onOpenChange={(o)=> !o && closeSheet()}>
        <SheetContent className="sm:max-w-[520px] px-6 py-6 overflow-y-auto">
          <SheetHeader><SheetTitle>{editing?.mode === 'create' ? 'Crear Carrera' : 'Editar Carrera'}</SheetTitle></SheetHeader>
          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            <section className="space-y-4">
              <h3 className="text-sm font-semibold tracking-tight">Datos de la carrera</h3>
              <div className="space-y-1">
                <label className="text-xs font-medium">Nombre *</label>
                <Input name="name" defaultValue={entity?.name} required autoFocus/>
              </div>
            </section>
            <SheetFooter className="gap-2 pt-2">
              <Button type="submit" size="sm" className="min-w-24" disabled={saving}>{saving && <Loader2 className="h-4 w-4 animate-spin" />}Guardar</Button>
              <Button type="button" size="sm" variant="outline" onClick={closeSheet} disabled={saving}>Cancelar</Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
      <ConfirmDeleteDialog
        open={deleteState.open}
        onOpenChange={(o)=> setDeleteState(s=> ({ ...s, open:o, ...(o?{}:{target:null}) }))}
        entityName={deleteState.target?.name || ''}
        label="carrera"
        requireSlug={false}
        onConfirm={async ()=> {
          const t = deleteState.target; if (!t) return;
            try { await deleteCareer(t.publicId); push({ variant:'success', title:'Eliminado', message:'Carrera eliminada'}); queryClient.invalidateQueries({ queryKey:['careers'] }); }
            catch(err:any){ push({ variant:'error', title:'Error', message: err?.message || 'No se pudo eliminar'}); }
            finally { setDeleteState({ open:false, target:null }); }
        }}
      />
    </div>
  );
}
