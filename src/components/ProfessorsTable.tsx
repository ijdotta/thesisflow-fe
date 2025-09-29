import * as React from 'react';
import { DataTable, type Column, type Sort } from '@/components/DataTable';
import { useProfessors } from '@/hooks/useProfessors';
import type { FriendlyPerson } from '@/types/FriendlyEntities';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { useQueryClient } from '@tanstack/react-query';
import { useOptionalToast } from '@/components/ui/toast';
import { useSearchPeople } from '@/hooks/useSearchPeople';
import { createPerson } from '@/api/people';
import { createProfessor } from '@/api/professors';

const columns: Column<FriendlyPerson>[] = [
	{ id: 'lastname', header: 'Apellido', accessor: r => r.lastname, sortField: 'lastname', filter: { type: 'text', placeholder: 'Filtrar apellido' } },
	{ id: 'name', header: 'Nombre', accessor: r => r.name, sortField: 'name', filter: { type: 'text', placeholder: 'Filtrar nombre' } },
	{ id: 'email', header: 'Email', accessor: r => r.email || '—', sortField: 'email', filter: { type: 'text', placeholder: 'Buscar email' } },
];

export default function ProfessorsTable() {
	const [page, setPage] = React.useState(0);
	const [size, setSize] = React.useState(25);
	const [sort, setSort] = React.useState<Sort>({ field: 'lastname', dir: 'asc' });
	const [filters, setFilters] = React.useState<Record<string, string>>({});
	const [open, setOpen] = React.useState(false);

	const queryClient = useQueryClient();
	const { data, isLoading, error } = useProfessors({ page, size, sort, filters });
	const list = data?.professors ?? [];
	const total = data?.totalElements ?? 0;

	return (
		<div className="space-y-4">
			<div className="flex flex-wrap justify-between gap-2 items-center">
				<h2 className="text-lg font-semibold">Profesores</h2>
				<Button size="sm" onClick={() => setOpen(true)} className="gap-1"><Plus className="h-4 w-4" /> Nuevo</Button>
			</div>
			<DataTable<FriendlyPerson>
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
			<CreateProfessorSheet open={open} onOpenChange={setOpen} onCreated={() => {
				queryClient.invalidateQueries({ queryKey: ['professors'] });
				queryClient.invalidateQueries({ queryKey: ['people'] });
			}} />
		</div>
	);
}

// SHEET COMPONENT
function CreateProfessorSheet({ open, onOpenChange, onCreated }: { open: boolean; onOpenChange: (o: boolean) => void; onCreated: () => void }) {
	const [name, setName] = React.useState('');
	const [lastname, setLastname] = React.useState('');
	const [email, setEmail] = React.useState('');
	const [selectedPerson, setSelectedPerson] = React.useState<{ publicId: string; display: string; name: string; lastname: string; email?: string } | null>(null);
	const [loading, setLoading] = React.useState(false);
	const { push } = useOptionalToast();

	const searchTerm = React.useMemo(() => [lastname, name].filter(Boolean).join(' ').trim(), [lastname, name]);
	const { data: search } = useSearchPeople(searchTerm);
	const people = search?.items || [];

	React.useEffect(() => { if (!open) { setName(''); setLastname(''); setEmail(''); setSelectedPerson(null); } }, [open]);

	function pickPerson(p: typeof people[number]) {
		setSelectedPerson({ publicId: p.publicId, display: p.display, name: p.name, lastname: p.lastname, email: p.email });
		setName(p.name); setLastname(p.lastname); if (p.email) setEmail(p.email); else setEmail('');
	}
	function clearSelection() { setSelectedPerson(null); if (!email) setEmail(''); }

	function validate(): boolean {
		if (!selectedPerson && (!name.trim() || !lastname.trim())) { push({ variant:'error', title:'Datos faltantes', message:'Nombre y apellido son obligatorios'}); return false; }
		if (!email.trim()) { push({ variant:'error', title:'Email requerido', message:'Debe ingresar un email'}); return false; }
		const domainOk = /@(?:cs\.uns\.edu\.ar|uns\.edu\.ar)$/i.test(email.trim());
		if (!domainOk) { push({ variant:'error', title:'Dominio inválido', message:'Email debe terminar en @cs.uns.edu.ar o @uns.edu.ar'}); return false; }
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
			await createProfessor({ personPublicId: personPublicId!, email: email.trim() });
			push({ variant:'success', title:'Profesor creado', message:'Profesor registrado correctamente'});
			onOpenChange(false); onCreated();
		} catch (err:any) {
			push({ variant:'error', title:'Error', message: err?.message || 'No se pudo crear'});
		} finally { setLoading(false); }
	}

	const showSuggestions = !selectedPerson && searchTerm.length >= 2 && people.length > 0;

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent className="sm:max-w-[560px]">
				<SheetHeader><SheetTitle>Nuevo Profesor</SheetTitle></SheetHeader>
				<form onSubmit={handleSubmit} className="mt-4 space-y-5">
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
					<div className="space-y-1">
						<label className="text-xs font-medium">Email institucional *</label>
						<Input value={email} onChange={e=> setEmail(e.target.value)} placeholder="usuario@cs.uns.edu.ar" required />
						<p className="text-[11px] text-muted-foreground">Debe terminar en @cs.uns.edu.ar o @uns.edu.ar</p>
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
