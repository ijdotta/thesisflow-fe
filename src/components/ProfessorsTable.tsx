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
	const { push } = useOptionalToast();

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
	const [mode, setMode] = React.useState<'select' | 'new'>('select');
	const [personQuery, setPersonQuery] = React.useState('');
	const [selectedPerson, setSelectedPerson] = React.useState<{ publicId: string; display: string } | null>(null);
	const [loading, setLoading] = React.useState(false);
	const { push } = useOptionalToast();
	const { data: search } = useSearchPeople(personQuery);
	const people = search?.items || [];

	React.useEffect(() => { if (!open) { setMode('select'); setPersonQuery(''); setSelectedPerson(null); } }, [open]);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		try {
			setLoading(true);
			let personPublicId = selectedPerson?.publicId;
			const form = e.currentTarget as HTMLFormElement;
			const fd = new FormData(form);
			const email = String(fd.get('email') || '').trim() || undefined;
			if (mode === 'new' && !personPublicId) {
				const name = String(fd.get('name') || '').trim();
				const lastname = String(fd.get('lastname') || '').trim();
				if (!name || !lastname) { push({ variant: 'error', title: 'Faltan datos', message: 'Nombre y apellido son obligatorios' }); setLoading(false); return; }
				const created = await createPerson({ name, lastname });
				personPublicId = created.publicId || created.id;
			}
			if (!personPublicId) { push({ variant: 'error', title: 'Seleccione persona', message: 'Debe seleccionar o crear una persona' }); setLoading(false); return; }
			await createProfessor({ personPublicId, email });
			push({ variant: 'success', title: 'Profesor creado', message: 'Se creó el profesor correctamente' });
			onOpenChange(false);
			onCreated();
		} catch (err: any) {
			push({ variant: 'error', title: 'Error', message: err?.message || 'No se pudo crear' });
		} finally { setLoading(false); }
	}

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent className="sm:max-w-[560px]">
				<SheetHeader>
					<SheetTitle>Nuevo Profesor</SheetTitle>
				</SheetHeader>
				<form onSubmit={handleSubmit} className="mt-4 space-y-5">
					<div className="flex gap-2 text-xs">
						<button type="button" className={`px-2 py-1 rounded border ${mode === 'select' ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted'}`} onClick={() => setMode('select')}>Elegir existente</button>
						<button type="button" className={`px-2 py-1 rounded border ${mode === 'new' ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted'}`} onClick={() => { setMode('new'); setSelectedPerson(null); }}>Crear persona</button>
					</div>
					{mode === 'select' && (
						<div className="space-y-2">
							<label className="text-xs font-medium">Buscar persona</label>
							<Input value={personQuery} onChange={e => setPersonQuery(e.target.value)} placeholder="Escriba para buscar" />
							<div className="max-h-40 overflow-auto rounded border divide-y text-xs">
								{personQuery.trim().length > 0 && people.map(p => (
									<button type="button" key={p.publicId} onClick={() => { setSelectedPerson({ publicId: p.publicId, display: p.display }); }} className={`w-full text-left px-2 py-1 hover:bg-accent ${selectedPerson?.publicId === p.publicId ? 'bg-accent/60' : ''}`}>{p.display}</button>
								))}
								{personQuery.trim().length > 0 && people.length === 0 && <div className="px-2 py-1 text-muted-foreground">Sin resultados</div>}
							</div>
							{selectedPerson && <div className="text-xs">Seleccionado: <span className="font-medium">{selectedPerson.display}</span></div>}
						</div>
					)}
					{mode === 'new' && (
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
						<label className="text-xs font-medium">Email (opcional)</label>
						<Input name="email" type="email" />
					</div>
					<SheetFooter className="gap-2">
						<Button type="submit" size="sm" disabled={loading}>{loading ? 'Creando…' : 'Crear'}</Button>
						<Button type="button" size="sm" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
					</SheetFooter>
				</form>
			</SheetContent>
		</Sheet>
	);
}
