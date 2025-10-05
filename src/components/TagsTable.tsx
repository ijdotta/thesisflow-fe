import * as React from 'react';
import { DataTable, type Column, type Sort } from '@/components/DataTable';
import { Button } from '@/components/ui/button';
import { Edit, Plus, Trash } from 'lucide-react';
import { usePagedTags } from '@/hooks/usePagedTags';
import type { FriendlyTag } from '@/types/FriendlyEntities';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { createTag, updateTag, deleteTag } from '@/api/tags';
import { useQueryClient } from '@tanstack/react-query';
import { useOptionalToast } from '@/components/ui/toast';

export default function TagsTable() {
  const [page, setPage] = React.useState(0);
  const [size, setSize] = React.useState(25);
  const [sort, setSort] = React.useState<Sort>({ field: 'name', dir: 'asc' });
  const [filters, setFilters] = React.useState<Record<string,string>>({});
  const [editing, setEditing] = React.useState<{ mode: 'create'|'edit'; entity?: FriendlyTag | null } | null>(null);
  const queryClient = useQueryClient();
  const { push } = useOptionalToast();

  const { data, isLoading, error } = usePagedTags({ page, size, sort, filters });
  const tags = data?.tags || [];
  const total = data?.totalElements || 0;

  const columns = React.useMemo<Column<FriendlyTag>[]>(() => [
    { id: 'name', header: 'Nombre', accessor: r => r.name, sortField: 'name', filter: { type: 'text', placeholder: 'Filtrar nombre'} },
    { id: 'description', header: 'Descripción', accessor: r => r.description || '—', sortField: 'description', filter: { type: 'text', placeholder: 'Filtrar descripción'} },
    { id: 'actions', header: 'Acciones', accessor: (row) => (
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={() => setEditing({ mode: 'edit', entity: row })}><Edit className="h-4 w-4" /></Button>
        <Button size="sm" variant="destructive" title="Eliminar" onClick={() => {
          if (window.confirm(`Eliminar etiqueta \"${row.name}\"?`)) {
            deleteTag(row.publicId)
              .then(()=> { push({ variant:'success', title:'Eliminado', message:'Etiqueta eliminada'}); queryClient.invalidateQueries({ queryKey:['tags'] }); })
              .catch((err:any)=> push({ variant:'error', title:'Error', message: err?.message || 'No se pudo eliminar'}));
          }
        }}><Trash className="h-4 w-4" /></Button>
      </div>)},
  ], [push, queryClient]);

  function openCreate() { setEditing({ mode: 'create' }); }
  function closeSheet() { setEditing(null); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget as HTMLFormElement);
    const body = { name: String(fd.get('name')||'').trim(), description: String(fd.get('description')||'').trim() || undefined };
    if (!body.name) { push({ variant:'error', title:'Falta nombre', message:'Nombre es obligatorio'}); return; }
    try {
      if (editing?.mode === 'create') { await createTag(body); push({ variant:'success', title:'Creado', message:'Etiqueta creada'}); }
      else if (editing?.mode === 'edit' && editing.entity) { await updateTag(editing.entity.publicId, body); push({ variant:'success', title:'Actualizado', message:'Etiqueta actualizada'}); }
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      closeSheet();
    } catch (err:any) { push({ variant:'error', title:'Error', message: err?.message || 'Operación fallida'}); }
  }

  const entity = editing?.entity;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">Etiquetas</h2>
        <Button size="sm" onClick={openCreate} className="gap-1"><Plus className="h-4 w-4" /> Nueva</Button>
      </div>
      <DataTable<FriendlyTag>
        columns={columns}
        rows={tags}
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
        <SheetContent className="sm:max-w-[560px] px-6 py-6 overflow-y-auto">
          <SheetHeader><SheetTitle>{editing?.mode === 'create' ? 'Crear Etiqueta' : 'Editar Etiqueta'}</SheetTitle></SheetHeader>
          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            <section className="space-y-4">
              <h3 className="text-sm font-semibold tracking-tight">Datos de la etiqueta</h3>
              <div className="space-y-1">
                <label className="text-xs font-medium">Nombre *</label>
                <Input name="name" defaultValue={entity?.name} required autoFocus/>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">Descripción</label>
                <Input name="description" defaultValue={entity?.description} />
              </div>
            </section>
            <SheetFooter className="gap-2 pt-2">
              <Button type="submit" size="sm" className="min-w-24">Guardar</Button>
              <Button type="button" size="sm" variant="outline" onClick={closeSheet}>Cancelar</Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
