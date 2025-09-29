import * as React from 'react';
import { DataTable, type Column, type Sort } from '@/components/DataTable';
import { useStudents } from '@/hooks/useStudents';
import type { FriendlyStudent } from '@/types/FriendlyEntities';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { useSearchPeople } from '@/hooks/useSearchPeople';
import { createPerson } from '@/api/people';
import { createStudent, setStudentCareers } from '@/api/students';
import { useOptionalToast } from '@/components/ui/toast';
import { useQueryClient } from '@tanstack/react-query';
import { useCareers } from '@/hooks/useCareers';

const columns: Column<FriendlyStudent>[] = [
  { id: 'lastname', header: 'Apellido', accessor: r => r.lastname, sortField: 'lastname', filter: { type: 'text', placeholder: 'Filtrar apellido'} },
  { id: 'name', header: 'Nombre', accessor: r => r.name, sortField: 'name', filter: { type: 'text', placeholder: 'Filtrar nombre'} },
  { id: 'studentId', header: 'Legajo', accessor: r => r.studentId || '—', sortField: 'studentId', filter: { type: 'text', placeholder: 'Legajo'} },
  { id: 'careers', header: 'Carreras', accessor: r => (r.careers||[]).join(', ') },
];

export default function StudentsTable() {
  const [page, setPage] = React.useState(0);
  const [size, setSize] = React.useState(25);
  const [sort, setSort] = React.useState<Sort>({ field: 'lastname', dir: 'asc' });
  const [filters, setFilters] = React.useState<Record<string,string>>({});
  const [open, setOpen] = React.useState(false);

  const { data, isLoading, error } = useStudents({ page, size, sort, filters });
  const list = data?.students ?? [];
  const total = data?.totalElements ?? 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">Alumnos</h2>
        <Button size="sm" onClick={()=> setOpen(true)} className="gap-1"><Plus className="h-4 w-4"/> Nuevo</Button>
      </div>
      <DataTable<FriendlyStudent>
        columns={columns}
        rows={list}
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
      <CreateStudentSheet open={open} onOpenChange={setOpen} />
    </div>
  );
}

function CreateStudentSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (o:boolean)=>void }) {
  const [mode, setMode] = React.useState<'select'|'new'>('select');
  const [query, setQuery] = React.useState('');
  const [selectedPerson, setSelectedPerson] = React.useState<{ publicId: string; display: string } | null>(null);
  const [selectedCareers, setSelectedCareers] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(false);
  const { push } = useOptionalToast();
  const queryClient = useQueryClient();
  const { data: peopleSearch } = useSearchPeople(query);
  const people = peopleSearch?.items || [];
  const { data: careersData } = useCareers();
  const careers = careersData?.items || [];

  React.useEffect(()=> { if (!open) { setMode('select'); setQuery(''); setSelectedPerson(null); setSelectedCareers([]); } }, [open]);

  function toggleCareer(id: string) {
    setSelectedCareers(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setLoading(true);
      let personPublicId = selectedPerson?.publicId;
      const form = e.currentTarget as HTMLFormElement;
      const fd = new FormData(form);
      const studentId = String(fd.get('studentId')||'').trim() || undefined;
      if (mode === 'new' && !personPublicId) {
        const name = String(fd.get('name')||'').trim();
        const lastname = String(fd.get('lastname')||'').trim();
        if (!name || !lastname) { push({ variant:'error', title:'Faltan datos', message:'Nombre y apellido son obligatorios'}); setLoading(false); return; }
        const created = await createPerson({ name, lastname });
        personPublicId = created.publicId || created.id;
      }
      if (!personPublicId) { push({ variant:'error', title:'Seleccione persona', message:'Debe seleccionar o crear una persona'}); setLoading(false); return; }
      const student = await createStudent({ personPublicId, studentId });
      if (student?.publicId && selectedCareers.length) {
        await setStudentCareers(student.publicId, selectedCareers);
      }
      push({ variant:'success', title:'Alumno creado', message:'Se creó el alumno correctamente'});
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['people'] });
      onOpenChange(false);
    } catch (err:any) {
      push({ variant:'error', title:'Error', message: err?.message || 'No se pudo crear'});
    } finally { setLoading(false); }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[600px]">
        <SheetHeader>
          <SheetTitle>Nuevo Alumno</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="mt-4 space-y-6">
          <div className="flex gap-2 text-xs">
            <button type="button" className={`px-2 py-1 rounded border ${mode==='select'? 'bg-primary text-primary-foreground border-primary':'bg-muted'}`} onClick={()=> setMode('select')}>Elegir existente</button>
            <button type="button" className={`px-2 py-1 rounded border ${mode==='new'? 'bg-primary text-primary-foreground border-primary':'bg-muted'}`} onClick={()=> { setMode('new'); setSelectedPerson(null);} }>Crear persona</button>
          </div>
          {mode==='select' && (
            <div className="space-y-2">
              <label className="text-xs font-medium">Buscar persona</label>
              <Input value={query} onChange={e=> setQuery(e.target.value)} placeholder="Escriba para buscar" />
              <div className="max-h-40 overflow-auto rounded border divide-y text-xs">
                {query.trim().length>0 && people.map(p => (
                  <button type="button" key={p.publicId} onClick={()=> setSelectedPerson({ publicId: p.publicId, display: p.display })} className={`w-full text-left px-2 py-1 hover:bg-accent ${selectedPerson?.publicId===p.publicId? 'bg-accent/60':''}`}>{p.display}</button>
                ))}
                {query.trim().length>0 && people.length===0 && <div className="px-2 py-1 text-muted-foreground">Sin resultados</div>}
              </div>
              {selectedPerson && <div className="text-xs">Seleccionado: <span className="font-medium">{selectedPerson.display}</span></div>}
            </div>
          )}
          {mode==='new' && (
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium">Nombre *</label>
                <Input name="name" required />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">Apellido *</label>
                <Input name="lastname" required />
              </div>
            </div>
          )}
          <div className="space-y-1">
            <label className="text-xs font-medium">Legajo (opcional)</label>
            <Input name="studentId" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium">Carreras</label>
            <div className="flex flex-wrap gap-2">
              {careers.map(c => {
                const active = selectedCareers.includes(c.publicId);
                return (
                  <button key={c.publicId} type="button" onClick={()=> toggleCareer(c.publicId)} className={`px-2 py-1 rounded border text-xs ${active? 'bg-primary text-primary-foreground border-primary':'bg-muted hover:bg-muted/70'}`}>{c.name}</button>
                );
              })}
              {careers.length===0 && <span className="text-xs text-muted-foreground">(Sin carreras)</span>}
            </div>
            {selectedCareers.length>0 && (
              <div className="text-[11px] text-muted-foreground">Seleccionadas: {selectedCareers.length}</div>
            )}
          </div>
          <SheetFooter className="gap-2">
            <Button type="submit" size="sm" disabled={loading}>{loading? 'Creando…':'Crear'}</Button>
            <Button type="button" size="sm" variant="outline" onClick={()=> onOpenChange(false)}>Cancelar</Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
