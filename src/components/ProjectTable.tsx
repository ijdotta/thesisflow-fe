import {type Column, DataTable, type Sort} from "@/components/DataTable.tsx";
import type {Project} from "@/types/Project.ts";
import {Button} from "@/components/ui/button.tsx";
import {Edit, EyeIcon, Tag as TagIcon, CalendarCheck} from "lucide-react";
import { ProjectManageSheet } from '@/components/ProjectManageSheet';
import {useProjects} from "@/hooks/useProjects.ts";
import * as React from "react";
import CreateProjectWizard from "@/components/CreateProjectWizard.tsx";
import { useQueryClient } from '@tanstack/react-query';
import { ProjectViewSheet } from '@/components/ProjectViewSheet';
import { ProjectTagsSheet } from '@/components/ProjectTagsSheet';
import { ProjectCompletionSheet } from '@/components/ProjectCompletionSheet';

const TYPE_LABELS: Record<string,string> = { THESIS: 'Tesis', FINAL_PROJECT: 'Proyecto Final' };
const SUBTYPE_LABELS: Record<string,string> = { 
  INVESTIGACION: 'Investigación', 
  EXTENSION: 'Extensión', 
  VINCULACION: 'Vinculación' 
};

export default function ProjectsTable() {
	const [page, setPage] = React.useState(0);
	const [size, setSize] = React.useState(25);
	const [sort, setSort] = React.useState<Sort>({ field: "createdAt", dir: "desc" });
	const [filters, setFilters] = React.useState<Record<string, string>>({});
	const [viewProjectId, setViewProjectId] = React.useState<string | null>(null);
	const [viewOpen, setViewOpen] = React.useState(false);
	const [tagsProject, setTagsProject] = React.useState<{ publicId: string; title: string; tags: Project['tags'] } | null>(null);
	const [tagsOpen, setTagsOpen] = React.useState(false);
	const [completionProject, setCompletionProject] = React.useState<Project | null>(null);
	const [completionOpen, setCompletionOpen] = React.useState(false);
	const [manageProject, setManageProject] = React.useState<Project | null>(null);
	const [manageOpen, setManageOpen] = React.useState(false);
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
	const openTags = React.useCallback((p: Project) => { setTagsProject({ publicId: p.publicId, title: p.title, tags: p.tags }); setTagsOpen(true); }, []);
	const openCompletion = React.useCallback((p: Project) => { setCompletionProject(p); setCompletionOpen(true); }, []);
	const openManage = React.useCallback((p: Project) => { setManageProject(p); setManageOpen(true); }, []);

	const columns = React.useMemo<Column<Project>[]>(() => [
		{
			id: "title",
			header: "Título",
			accessor: (row) => (
				<div className="font-medium leading-snug whitespace-normal">
					{row.title}
				</div>
			),
			sortField: "title",
			className: "max-w-[320px] whitespace-normal",
			filter: { type: 'text', placeholder: 'Buscar título' }
		},
		{
			id: "type",
			header: "Tipo",
			accessor: (row) => TYPE_LABELS[row.type] || row.type,
			sortField: "type",
			className: "whitespace-nowrap",
			filter: { type: 'select', placeholder: 'Todos', options: [
				{ value: 'THESIS', label: TYPE_LABELS.THESIS },
				{ value: 'FINAL_PROJECT', label: TYPE_LABELS.FINAL_PROJECT },
			] }
		},
		{
			id: "career",
			header: "Carrera",
			accessor: (row) => (
				<div className="whitespace-normal leading-snug text-sm">
					{row.career?.name || '-'}
				</div>
			),
			sortField: "career",
			className: "max-w-[220px] whitespace-normal",
			filter: { type: 'text', placeholder: 'Filtrar carrera' }
		},
		{
			id: "subtypes",
			header: "Subtipos",
			accessor: (row) => (
				<div className="flex flex-wrap gap-1">
					{row.subtypes && row.subtypes.length > 0
						? row.subtypes.map(subtype => (
							<span key={subtype} className="inline-block px-2 py-1 text-xs bg-muted rounded">
								{SUBTYPE_LABELS[subtype] || subtype}
							</span>
						))
						: <span className="text-muted-foreground text-xs">—</span>
					}
				</div>
			),
			className: "max-w-[280px]",
		},
		{
			id: "people",
			header: "Directores / Co-directores / Colaboradores",
			accessor: (row) => {
				const allPeople = [
					...row.directors.map(p => ({ ...p, role: 'Director' })),
					...row.codirectors.map(p => ({ ...p, role: 'Co-director' })),
					...row.collaborators.map(p => ({ ...p, role: 'Colaborador' }))
				];
				
				return (
					<div className="whitespace-normal text-sm leading-snug space-y-1">
						{allPeople.length === 0 ? (
							<span className="text-muted-foreground">—</span>
						) : (
							allPeople.map((person) => (
								<div key={`${person.publicId}-${person.role}`} className="flex gap-2">
									<span className="text-xs bg-muted px-1.5 py-0.5 rounded whitespace-nowrap">{person.role}</span>
									<span>{person.lastname}, {person.name}</span>
								</div>
							))
						)}
					</div>
				);
			},
			sortField: "directors",
			className: "max-w-[320px] whitespace-normal",
			filter: { type: 'text', placeholder: 'Filtrar persona' }
		},
		{
			id: "students",
			header: "Alumnos",
			accessor: (row) => (
				<div className="whitespace-normal text-sm leading-snug">
					{row.students.length === 0
						? <span className="text-muted-foreground">—</span>
						: row.students
							.map(s => `${s.lastname}, ${s.name}`)
							.sort()
							.map((name) => (
								<div key={name}>{name}</div>
							))}
				</div>
			),
			sortField: "students",
			className: "max-w-[240px] whitespace-normal",
			filter: { type: 'text', placeholder: 'Filtrar alumno' }
		},
		{
			id: "status",
			header: "Estado",
			accessor: (row) => row.completion ? "Finalizado" : "En curso",
			sortField: "completion", // enable filter
			className: "whitespace-nowrap text-center",
			filter: { type: 'select', placeholder: 'Todos', options: [
				{ value: 'true', label: 'Finalizado' },
				{ value: 'false', label: 'En curso' },
			] }
		},
		{
			id: "actions",
			header: "Acciones",
			accessor: (row) => (
				<div className="flex gap-2 justify-end">
					<Button variant="default" size="sm" onClick={() => openView(row.publicId)} title="Ver detalles"><EyeIcon className="h-4 w-4" /></Button>
					<Button variant="outline" size="sm" onClick={() => openTags(row)} title="Gestionar etiquetas"><TagIcon className="h-4 w-4" /></Button>
					<Button variant="outline" size="sm" onClick={() => openCompletion(row)} title="Definir fecha de finalización"><CalendarCheck className="h-4 w-4" /></Button>
					<Button variant="soft" size="sm" onClick={() => openManage(row)} title="Editar / Eliminar"><Edit className="h-4 w-4" /></Button>
				</div>
			),
			className: "whitespace-nowrap text-right"
		}
	], [openView, openTags, openCompletion, openManage]);

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
			<ProjectTagsSheet project={tagsProject} open={tagsOpen} onOpenChange={setTagsOpen} />
			<ProjectCompletionSheet project={completionProject} open={completionOpen} onOpenChange={(open) => {
				setCompletionOpen(open);
				if (!open) setCompletionProject(null);
			}} />
			<ProjectManageSheet project={manageProject} open={manageOpen} onOpenChange={setManageOpen} onDeleted={() => {
				setManageOpen(false); setManageProject(null); queryClient.invalidateQueries({ queryKey:['projects'] });
			}} />
		</div>
	);
}
