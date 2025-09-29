import {type Column, DataTable, type Sort} from "@/components/DataTable.tsx";
import type {Project} from "@/types/Project.ts";
import {Button} from "@/components/ui/button.tsx";
import {Edit, EyeIcon} from "lucide-react";
import {useProjects} from "@/hooks/useProjects.ts";
import * as React from "react";
import CreateProjectWizard from "@/components/CreateProjectWizard.tsx";
import { useQueryClient } from '@tanstack/react-query';
import { ProjectViewSheet } from '@/components/ProjectViewSheet';

const TYPE_LABELS: Record<string,string> = { THESIS: 'Tesis', PROJECT: 'Proyecto Final' };

export default function ProjectsTable() {
	const [page, setPage] = React.useState(0);
	const [size, setSize] = React.useState(25);
	const [sort, setSort] = React.useState<Sort>({ field: "createdAt", dir: "desc" });
	const [filters, setFilters] = React.useState<Record<string, string>>({});
	const [viewProjectId, setViewProjectId] = React.useState<string | null>(null);
	const [viewOpen, setViewOpen] = React.useState(false);
	const queryClient = useQueryClient();

	const { data, isLoading, error } = useProjects({ page, size, sort, filters });
	const { projects = [], totalElements = 0 } = data ?? {};

	function handleCreated() {
		// invalidate all project queries
		queryClient.invalidateQueries({ queryKey: ['projects'] });
	}

	// Deep link: open from ?project= param
	React.useEffect(() => {
		const url = new URL(window.location.href);
		const pid = url.searchParams.get('project');
		if (pid) {
			setViewProjectId(pid);
			setViewOpen(true);
		}
		function onPop() {
			const u = new URL(window.location.href);
			const p = u.searchParams.get('project');
			if (!p) { setViewOpen(false); setViewProjectId(null); }
			else { setViewProjectId(p); setViewOpen(true); }
		}
		window.addEventListener('popstate', onPop);
		return () => window.removeEventListener('popstate', onPop);
	}, []);

	const updateUrlParam = React.useCallback((pid: string | null) => {
		const url = new URL(window.location.href);
		if (pid) url.searchParams.set('project', pid); else url.searchParams.delete('project');
		window.history.replaceState({}, '', url.toString());
	}, []);

	const openView = React.useCallback((id: string) => { setViewProjectId(id); setViewOpen(true); updateUrlParam(id); }, [updateUrlParam]);
	const handleViewOpenChange = React.useCallback((o: boolean) => { setViewOpen(o); if (!o) { setViewProjectId(null); updateUrlParam(null); } }, [updateUrlParam]);

	const columns = React.useMemo<Column<Project>[]>(() => [
		{
			id: "title",
			header: "Título",
			accessor: (row) => row.title,
			sortField: "title",
			filter: { type: 'text', placeholder: 'Buscar título' }
		},
		{
			id: "type",
			header: "Tipo",
			accessor: (row) => TYPE_LABELS[row.type] || row.type,
			sortField: "type",
			filter: { type: 'select', placeholder: 'Todos', options: [
				{ value: 'THESIS', label: TYPE_LABELS.THESIS },
				{ value: 'PROJECT', label: TYPE_LABELS.PROJECT },
			] }
		},
		{
			id: "subtypes",
			header: "Subtipos",
			accessor: (row) => row.subtypes?.join(", "),
		},
		{
			id: "directors",
			header: "Directores",
			accessor: (row) => row.directors.map(s => `${s.lastname}, ${s.name}`).sort().join("\n"),
			sortField: "directors",
			filter: { type: 'text', placeholder: 'Filtrar director' }
		},
		{
			id: "students",
			header: "Alumnos",
			accessor: (row) => row.students.map(s => `${s.lastname}, ${s.name}`).sort().join("\n"),
			sortField: "students",
			filter: { type: 'text', placeholder: 'Filtrar alumno' }
		},
		{
			id: "status",
			header: "Estado",
			accessor: (row) => row.completion ? "Finalizado" : "En curso",
			sortField: "completion", // enable filter
			filter: { type: 'select', placeholder: 'Todos', options: [
				{ value: 'true', label: 'Finalizado' },
				{ value: 'false', label: 'En curso' },
			] }
		},
		{
			id: "actions",
			header: "Acciones",
			accessor: (row) => (
				<div className="flex gap-2">
					<Button variant="default" onClick={() => openView(row.publicId)} title="Ver detalles"><EyeIcon /></Button>
					<Button variant="secondary" disabled title="Editar (próximamente)"><Edit /></Button>
				</div>
			)
		}
	], [openView]);

	const selectedProject = React.useMemo(() => {
		return viewProjectId ? projects.find(p => p.publicId === viewProjectId) || null : null;
	}, [viewProjectId, projects]);

	return (
		<div className="space-y-4">
			<div className="flex flex-wrap items-center justify-between gap-2">
				<h2 className="text-lg font-semibold">Proyectos</h2>
				<CreateProjectWizard onCreated={handleCreated} />
			</div>
			<DataTable<Project>
				columns={columns}
				rows={projects}
				total={totalElements}
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
				filterDebounceMs={500}
			/>
			<ProjectViewSheet publicId={viewProjectId} open={viewOpen} onOpenChange={handleViewOpenChange} initial={selectedProject} />
		</div>
	);
}