import * as React from 'react';
import { DataTable, type Column, type Sort } from '@/components/DataTable';
import { Button } from '@/components/ui/button';
import { Edit, Plus } from 'lucide-react';
import { usePagedApplicationDomains } from '@/hooks/usePagedApplicationDomains';
import type { FriendlyApplicationDomain } from '@/types/FriendlyEntities';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { createApplicationDomain, updateApplicationDomain } from '@/api/applicationDomains';
import { useQueryClient } from '@tanstack/react-query';
import { useOptionalToast } from '@/components/ui/toast';

export default function ApplicationDomainsTable() {
  const [page, setPage] = React.useState(0);
  const [size, setSize] = React.useState(25);
  const [sort, setSort] = React.useState<Sort>({ field: 'name', dir: 'asc' });
  const [filters, setFilters] = React.useState<Record<string,string>>({});
  const [editing, setEditing] = React.useState<{ mode: 'create'|'edit'; entity?: FriendlyApplicationDomain | null } | null>(null);
  const queryClient = useQueryClient();
  const { push } = useOptionalToast();

  const { data, isLoading, error } = usePagedApplicationDomains({ page, size, sort, filters });
  const domains = data?.domains || [];
  const total = data?.totalElements || 0;

  const columns = React.useMemo<Column<FriendlyApplicationDomain>[]>(() => [
    { id: 'name', header: 'Nombre', accessor: r => r.name, sortField: 'name', filter: { type: 'text', placeholder: 'Filtrar nombre'} },
    { id: 'description', header: 'Descripción', accessor: r => r.description || '—', sortField: 'description', filter: { type: 'text', placeholder: 'Filtrar descripción'} },
    { id: 'actions', header: 'Acciones', accessor: (row) => (
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={() => setEditing({ mode: 'edit', entity: row })}><Edit className="h-4 w-4" /></Button>
      </div>)},
  ], []);

  function openCreate() { setEditing({ mode: 'create' }); }
  function closeSheet() { setEditing(null); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget as HTMLFormElement);
    const body = { name: String(fd.get('name')||'').trim(), description: String(fd.get('description')||'').trim() || undefined };
    if (!body.name) { push({ variant:'error', title:'Falta nombre', message:'Nombre es obligatorio'}); return; }
    try {
      if (editing?.mode === 'create') { await createApplicationDomain(body); push({ variant:'success', title:'Creado', message:'Dominio creado'}); }
      else if (editing?.mode === 'edit' && editing.entity) { await updateApplicationDomain(editing.entity.publicId, body); push({ variant:'success', title:'Actualizado', message:'Dominio actualizado'}); }
      queryClient.invalidateQueries({ queryKey: ['application-domains'] });
      closeSheet();
    } catch (err:any) { push({ variant:'error', title:'Error', message: err?.message || 'Operación fallida'}); }
  }

  const entity = editing?.entity;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">Dominios de Aplicación</h2>
        <Button size="sm" onClick={openCreate} className="gap-1"><Plus className="h-4 w-4" /> Nuevo</Button>
      </div>
      <DataTable<FriendlyApplicationDomain>
        columns={columns}
        rows={domains}
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
        <SheetContent className="sm:max-w-[480px]">
          <SheetHeader><SheetTitle>{editing?.mode === 'create' ? 'Crear Dominio' : 'Editar Dominio'}</SheetTitle></SheetHeader>
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-medium">Nombre</label>
              <Input name="name" defaultValue={entity?.name} required autoFocus/>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Descripción</label>
              <Input name="description" defaultValue={entity?.description} />
            </div>
            <SheetFooter className="gap-2">
              <Button type="submit" size="sm">Guardar</Button>
              <Button type="button" size="sm" variant="outline" onClick={closeSheet}>Cancelar</Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}

