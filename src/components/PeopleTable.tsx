import * as React from 'react';
import { DataTable, type Column, type Sort } from '@/components/DataTable';
import { Button } from '@/components/ui/button';
import { Edit, Plus, Loader2 } from 'lucide-react';
import { usePagedPeople } from '@/hooks/usePagedPeople';
import type { FriendlyPerson } from '@/types/FriendlyEntities';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { useQueryClient } from '@tanstack/react-query';
import { createPerson, updatePerson, deletePerson } from '@/api/people';
import { useOptionalToast } from '@/components/ui/toast';
import { ConfirmDeleteDialog } from '@/components/ConfirmDeleteDialog';

export default function PeopleTable() {
  const [page, setPage] = React.useState(0);
  const [size, setSize] = React.useState(25);
  const [sort, setSort] = React.useState<Sort>({ field: 'lastname', dir: 'asc' });
  const [filters, setFilters] = React.useState<Record<string,string>>({});
  const [editing, setEditing] = React.useState<{ mode: 'create' | 'edit'; entity?: FriendlyPerson | null } | null>(null);
  const [saving, setSaving] = React.useState(false);

  const queryClient = useQueryClient();
  const { push } = useOptionalToast();

  const { data, isLoading, error } = usePagedPeople({ page, size, sort, filters });
  const people = data?.people || [];
  const total = data?.totalElements || 0;

  const columns = React.useMemo<Column<FriendlyPerson>[]>(() => [
    { id: 'lastname', header: 'Apellido', accessor: r => r.lastname, sortField: 'lastname', filter: { type: 'text', placeholder: 'Filtrar apellido'} },
    { id: 'name', header: 'Nombre', accessor: r => r.name, sortField: 'name', filter: { type: 'text', placeholder: 'Filtrar nombre'} },
    { id: 'actions', header: 'Acciones', accessor: (row) => (
      <div className="flex gap-2">
        <Button size="sm" variant="soft" onClick={() => setEditing({ mode: 'edit', entity: row })} title="Editar"><Edit className="h-4 w-4" /></Button>
      </div>
    ) },
  ], []);

  function openCreate() { setEditing({ mode: 'create' }); }
  function closeSheet() { setEditing(null); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    const form = e.currentTarget as HTMLFormElement;
    const fd = new FormData(form);
    const body = {
      name: String(fd.get('name')||'').trim(),
      lastname: String(fd.get('lastname')||'').trim(),
    };
    if (!body.name || !body.lastname) { push({ variant:'error', title:'Datos incompletos', message:'Nombre y apellido son obligatorios'}); return; }
    try {
      if (editing?.mode === 'create') {
        await createPerson(body);
        push({ variant:'success', title:'Creado', message:'Persona creada'});
      } else if (editing?.mode === 'edit' && editing.entity) {
        await updatePerson(editing.entity.publicId, body);
        push({ variant:'success', title:'Actualizado', message:'Persona actualizada'});
      }
      queryClient.invalidateQueries({ queryKey: ['people'] });
      closeSheet();
    } catch (err:any) {
      push({ variant:'error', title:'Error', message: err?.message || 'Operación fallida'});
    } finally {
      setSaving(false);
    }
  }

  const entity = editing?.entity;
  const [deleteOpen, setDeleteOpen] = React.useState(false);

  async function handleDelete() {
    if (!entity) return;
    try {
      await deletePerson(entity.publicId);
      push({ variant:'success', title:'Eliminado', message:'Persona eliminada'});
      queryClient.invalidateQueries({ queryKey: ['people'] });
      setDeleteOpen(false);
      closeSheet();
    } catch (err:any) {
      push({ variant:'error', title:'Error', message: err?.message || 'No se pudo eliminar'});
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">Personas</h2>
        <Button size="sm" onClick={openCreate} className="gap-1"><Plus className="h-4 w-4" /> Nueva</Button>
      </div>
      <DataTable<FriendlyPerson>
        columns={columns}
        rows={people}
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
        filterDebounceMs={400}
      />
      <Sheet open={!!editing} onOpenChange={(o)=> !o && closeSheet()}>
        <SheetContent className="sm:max-w-[520px] px-6 py-6 overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{editing?.mode === 'create' ? 'Crear Persona' : 'Editar Persona'}</SheetTitle>
          </SheetHeader>
          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            <section className="space-y-4">
              <h3 className="text-sm font-semibold tracking-tight">Datos básicos</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium">Nombre *</label>
                  <Input name="name" defaultValue={entity?.name} required autoFocus />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium">Apellido *</label>
                  <Input name="lastname" defaultValue={entity?.lastname} required />
                </div>
              </div>
            </section>
            <SheetFooter className="gap-2 pt-2">
              <Button type="submit" size="sm" className="min-w-24" disabled={saving}>{saving && <Loader2 className="h-4 w-4 animate-spin" />}Guardar</Button>
              <Button type="button" size="sm" variant="outline" onClick={closeSheet} disabled={saving}>Cancelar</Button>
              {editing?.mode === 'edit' && entity && (
                <Button type="button" size="sm" variant="destructive" onClick={()=> setDeleteOpen(true)} disabled={saving}>Eliminar…</Button>
              )}
            </SheetFooter>
          </form>
          {entity && (
            <ConfirmDeleteDialog
              open={deleteOpen}
              onOpenChange={setDeleteOpen}
              entityName={`${entity.name}-${entity.lastname}`}
              label="persona"
              onConfirm={handleDelete}
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
