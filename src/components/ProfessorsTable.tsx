import * as React from 'react';
import { DataTable, type Column, type Sort } from '@/components/DataTable';
import { useProfessors } from '@/hooks/useProfessors';
import type { FriendlyPerson } from '@/types/FriendlyEntities';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { useQueryClient } from '@tanstack/react-query';
import { useOptionalToast } from '@/components/ui/toast';
import { useSearchPeople } from '@/hooks/useSearchPeople';
import { createPerson } from '@/api/people';
import { createProfessor, updateProfessor, deleteProfessor } from '@/api/professors';
import { ConfirmDeleteDialog } from '@/components/ConfirmDeleteDialog';


export default function ProfessorsTable() {
	const [page, setPage] = React.useState(0);
	const [size, setSize] = React.useState(25);
	const [sort, setSort] = React.useState<Sort>({ field: 'lastname', dir: 'asc' });
	const [filters, setFilters] = React.useState<Record<string, string>>({});
	const [open, setOpen] = React.useState(false);
	const [editingProfessor, setEditingProfessor] = React.useState<FriendlyPerson | null>(null);
	const [deleteOpen, setDeleteOpen] = React.useState(false);
	const [professorToDelete, setProfessorToDelete] = React.useState<FriendlyPerson | null>(null);

	const queryClient = useQueryClient();
	const { data, isLoading, error } = useProfessors({ page, size, sort, filters });
	const list = data?.professors ?? [];
	const total = data?.totalElements ?? 0;

	const columns = React.useMemo<Column<FriendlyPerson>[]>(() => [
		{ id: 'lastname', header: 'Apellido', accessor: r => r.lastname, sortField: 'lastname', filter: { type: 'text', placeholder: 'Filtrar apellido' } },
		{ id: 'name', header: 'Nombre', accessor: r => r.name, sortField: 'name', filter: { type: 'text', placeholder: 'Filtrar nombre' } },
		{ id: 'email', header: 'Email', accessor: r => r.email || '—', sortField: 'email', filter: { type: 'text', placeholder: 'Buscar email' } },
		{
			id: 'actions',
			header: 'Acciones',
			accessor: (row) => (
				<div className="flex gap-2 justify-end">
					<Button variant="outline" size="sm" onClick={() => setEditingProfessor(row)} title="Editar">
						<Edit className="h-4 w-4" />
					</Button>
					<Button variant="destructive" size="sm" onClick={() => { setProfessorToDelete(row); setDeleteOpen(true); }} title="Eliminar">
						<Trash2 className="h-4 w-4" />
					</Button>
				</div>
			),
			className: "whitespace-nowrap text-right",
		},
	], []);

	async function handleDelete() {
		if (!professorToDelete) return;
		try {
			await deleteProfessor(professorToDelete.publicId);
			setDeleteOpen(false);
			setProfessorToDelete(null);
			queryClient.invalidateQueries({ queryKey: ['professors'] });
		} catch (err: any) {
			alert('Error: ' + (err?.message || 'Failed to delete professor'));
		}
	}

	return (
		<div className="space-y-4">
			<div className="flex flex-wrap justify-between gap-2 items-center">
				<h2 className="text-lg font-semibold">Profesores</h2>
				<Button size="sm" onClick={() => { setEditingProfessor(null); setOpen(true); }} className="gap-1"><Plus className="h-4 w-4" /> Nuevo</Button>
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
			<CreateProfessorSheet open={open && !editingProfessor} onOpenChange={setOpen} onCreated={() => {
				queryClient.invalidateQueries({ queryKey: ['professors'] });
				queryClient.invalidateQueries({ queryKey: ['people'] });
			}} />
			{editingProfessor && (
				<EditProfessorSheet open={true} professor={editingProfessor} onOpenChange={(o) => { if (!o) setEditingProfessor(null); }} onUpdated={() => {
					setEditingProfessor(null);
					queryClient.invalidateQueries({ queryKey: ['professors'] });
				}} />
			)}
			<ConfirmDeleteDialog
				open={deleteOpen}
				onOpenChange={setDeleteOpen}
				title="Eliminar Profesor"
				description={`¿Está seguro de que desea eliminar a ${professorToDelete?.lastname}, ${professorToDelete?.name}?`}
				onConfirm={handleDelete}
			/>
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
			<SheetContent className="sm:max-w-[620px] px-6 py-6 overflow-y-auto">
				<SheetHeader><SheetTitle>Nuevo Profesor</SheetTitle></SheetHeader>
				<form onSubmit={handleSubmit} className="mt-6 space-y-7">
					<section className="space-y-4">
						<div className="flex items-center justify-between">
							<h3 className="text-sm font-semibold tracking-tight">Datos de la persona</h3>
							{selectedPerson && (
								<button type="button" onClick={clearSelection} className="text-xs underline text-muted-foreground hover:text-foreground transition-colors">Cambiar selección</button>
							)}
						</div>
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
						<p className="text-[11px] text-muted-foreground">Escribe nombre y apellido para sugerencias de personas existentes.</p>
						{showSuggestions && (
							<div className="rounded-md border bg-background shadow-sm max-h-44 overflow-auto divide-y text-xs">
								{people.map(p => (
									<button
										type="button"
										key={p.publicId}
										onClick={()=> pickPerson(p)}
										className="w-full text-left px-3 py-1.5 hover:bg-accent focus:bg-accent focus:outline-none transition-colors"
									>{p.display}{p.email ? ` • ${p.email}`:''}</button>
								))}
							</div>
						)}
						{selectedPerson && (
							<div className="text-xs bg-muted/60 border rounded-md px-3 py-2 flex flex-wrap gap-2 items-center">
								<span className="font-medium">Seleccionado:</span>
								<span>{selectedPerson.display}</span>
								{selectedPerson.email && <span className="text-muted-foreground">({selectedPerson.email})</span>}
							</div>
						)}
					</section>

					<section className="space-y-3">
						<h3 className="text-sm font-semibold tracking-tight">Credenciales</h3>
						<div className="space-y-1">
							<label className="text-xs font-medium">Email institucional *</label>
							<Input value={email} onChange={e=> setEmail(e.target.value)} placeholder="usuario@cs.uns.edu.ar" required />
							<p className="text-[11px] text-muted-foreground">Debe terminar en <code>@cs.uns.edu.ar</code> o <code>@uns.edu.ar</code>.</p>
						</div>
					</section>

					<SheetFooter className="gap-2 pt-2">
						<Button type="submit" size="sm" disabled={loading} className="min-w-24">{loading? 'Creando…':'Crear'}</Button>
						<Button type="button" size="sm" variant="outline" onClick={()=> onOpenChange(false)}>Cancelar</Button>
					</SheetFooter>
				</form>
			</SheetContent>
		</Sheet>
	);
}

function EditProfessorSheet({ open, professor, onOpenChange, onUpdated }: { open: boolean; professor: FriendlyPerson; onOpenChange: (o: boolean) => void; onUpdated: () => void }) {
const [email, setEmail] = React.useState(professor.email || '');
const [loading, setLoading] = React.useState(false);
const { push } = useOptionalToast();

React.useEffect(() => { 
if (open) setEmail(professor.email || '');
}, [open, professor]);

function validate(): boolean {
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
await updateProfessor(professor.publicId, { personPublicId: professor.publicId, email: email.trim() });
push({ variant:'success', title:'Profesor actualizado', message:'Los cambios fueron guardados'});
onOpenChange(false); onUpdated();
} catch (err:any) {
push({ variant:'error', title:'Error', message: err?.message || 'No se pudo actualizar'});
} finally { setLoading(false); }
}

return (
<Sheet open={open} onOpenChange={onOpenChange}>
<SheetContent className="sm:max-w-[620px] px-6 py-6 overflow-y-auto">
<SheetHeader><SheetTitle>Editar Profesor</SheetTitle></SheetHeader>
<form onSubmit={handleSubmit} className="mt-6 space-y-7">
<section className="space-y-4">
<h3 className="text-sm font-semibold tracking-tight">Datos personales</h3>
<div className="grid sm:grid-cols-2 gap-4">
<div className="space-y-1">
<label className="text-xs font-medium">Nombre</label>
<Input value={professor.name} disabled className="bg-muted" />
</div>
<div className="space-y-1">
<label className="text-xs font-medium">Apellido</label>
<Input value={professor.lastname} disabled className="bg-muted" />
</div>
</div>
</section>

<section className="space-y-3">
<h3 className="text-sm font-semibold tracking-tight">Credenciales</h3>
<div className="space-y-1">
<label className="text-xs font-medium">Email institucional *</label>
<Input value={email} onChange={e=> setEmail(e.target.value)} placeholder="usuario@cs.uns.edu.ar" required />
<p className="text-[11px] text-muted-foreground">Debe terminar en <code>@cs.uns.edu.ar</code> o <code>@uns.edu.ar</code>.</p>
</div>
</section>

<SheetFooter className="gap-2 pt-2">
<Button type="submit" size="sm" disabled={loading} className="min-w-24">{loading? 'Guardando…':'Guardar'}</Button>
<Button type="button" size="sm" variant="outline" onClick={()=> onOpenChange(false)}>Cancelar</Button>
</SheetFooter>
</form>
</SheetContent>
</Sheet>
);
}
