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
  { id: 'email', header: 'Email', accessor: r => r.email || '—', sortField: 'email', filter: { type: 'text', placeholder: 'Email'} },
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
  const [name, setName] = React.useState('');
  const [lastname, setLastname] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [studentId, setStudentId] = React.useState('');
  const [selectedPerson, setSelectedPerson] = React.useState<{ publicId: string; display: string; name: string; lastname: string; email?: string } | null>(null);
  const [selectedCareers, setSelectedCareers] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(false);
  const { push } = useOptionalToast();
  const queryClient = useQueryClient();
  // build search term same as professors (lastname + name)
  const searchTerm = React.useMemo(() => [lastname, name].filter(Boolean).join(' ').trim(), [lastname, name]);
  const { data: peopleSearch } = useSearchPeople(searchTerm);
  const people = peopleSearch?.items || [];
  const { data: careersData } = useCareers();
  const careers = careersData?.items || [];

  React.useEffect(()=> { if (!open) { setName(''); setLastname(''); setEmail(''); setStudentId(''); setSelectedPerson(null); setSelectedCareers([]); } }, [open]);

  function toggleCareer(id: string) { setSelectedCareers(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]); }

  function pickPerson(p: typeof people[number]) {
    setSelectedPerson({ publicId: p.publicId, display: p.display, name: p.name, lastname: p.lastname, email: p.email });
    setName(p.name); setLastname(p.lastname); setEmail(p.email || '');
  }
  function clearSelection() { setSelectedPerson(null); }

  function validate(): boolean {
    if (!selectedPerson && (!name.trim() || !lastname.trim())) { push({ variant:'error', title:'Datos faltantes', message:'Nombre y apellido son obligatorios'}); return false; }
    if (!studentId.trim()) { push({ variant:'error', title:'Legajo requerido', message:'Debe ingresar el legajo del alumno'}); return false; }
    if (!email.trim()) { push({ variant:'error', title:'Email requerido', message:'Debe ingresar un email de alumno'}); return false; }
    // For students no domain restriction per requirement.
    return true;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    try {
      setLoading(true);
      let personPublicId = selectedPerson?.publicId;
      if (!personPublicId) {
        const created = await createPerson({ name: name.trim(), lastname: lastname.trim(), email: email.trim() });
        personPublicId = created.publicId || created.id;
      }
      const student = await createStudent({ personPublicId: personPublicId!, studentId: studentId.trim(), email: email.trim() });
      if (student?.publicId && selectedCareers.length) await setStudentCareers(student.publicId, selectedCareers);
      push({ variant:'success', title:'Alumno creado', message:'Alumno registrado correctamente'});
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['people'] });
      onOpenChange(false);
    } catch (err:any) {
      push({ variant:'error', title:'Error', message: err?.message || 'No se pudo crear'});
    } finally { setLoading(false); }
  }

  const showSuggestions = !selectedPerson && searchTerm.length >= 2 && people.length > 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[600px]">
        <SheetHeader><SheetTitle>Nuevo Alumno</SheetTitle></SheetHeader>
        <form onSubmit={handleSubmit} className="mt-4 space-y-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium">Nombre *</label>
              <Input value={name} onChange={e=> { setName(e.target.value); if (selectedPerson) clearSelection(); }} required disabled={!!selectedPerson} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Apellido *</label>
              <Input value={lastname} onChange={e=> { setLastname(e.target.value); if (selectedPerson) clearSelection(); }} required disabled={!!selectedPerson} />
            </div>
          </div>
          {showSuggestions && (
            <div className="rounded border max-h-40 overflow-auto divide-y text-xs">
              {people.map(p => (
                <button type="button" key={p.publicId} onClick={()=> pickPerson(p)} className="w-full text-left px-2 py-1 hover:bg-accent">{p.display}{p.email ? ` • ${p.email}`:''}</button>
              ))}
            </div>
          )}
          {selectedPerson && (
            <div className="flex items-center gap-2 text-xs">
              <span className="font-medium">Seleccionado:</span>
              <span>{selectedPerson.display}</span>
              <button type="button" onClick={clearSelection} className="underline text-muted-foreground">Cambiar</button>
            </div>
          )}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium">Legajo *</label>
              <Input value={studentId} onChange={e=> setStudentId(e.target.value)} required />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Email *</label>
              <Input value={email} onChange={e=> setEmail(e.target.value)} required />
            </div>
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
            {selectedCareers.length>0 && <div className="text-[11px] text-muted-foreground">Seleccionadas: {selectedCareers.length}</div>}
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
