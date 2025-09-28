import {type Column, DataTable, type Sort} from "@/components/DataTable.tsx";
import type {Project} from "@/types/Project.ts";
import {Button} from "@/components/ui/button.tsx";
import {Edit, EyeIcon} from "lucide-react";
import {useProjects} from "@/hooks/useProjects.ts";
import * as React from "react";

const columns: Column<Project>[] = [
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
		accessor: (row) => row.type,
		sortField: "type",
		filter: { type: 'select', placeholder: 'Todos', options: [
			{ value: 'THESIS', label: 'Tesis' },
			{ value: 'PROJECT', label: 'Proyecto' },
			{ value: 'OTHER', label: 'Otro' },
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
				<a href={`/projects/${row.publicId}`}>
					<Button variant="default">< EyeIcon /></Button>
				</a>
				<a href={`/projects/${row.publicId}`}>
					<Button variant="secondary">< Edit /></Button>
				</a>
			</div>
		)
	}
]

export default function ProjectsTable() {
	const [page, setPage] = React.useState(0);
	const [size, setSize] = React.useState(25);
	const [sort, setSort] = React.useState<Sort>({ field: "createdAt", dir: "desc" });
	const [filters, setFilters] = React.useState<Record<string, string>>({});

	const { data, isLoading, error } = useProjects({ page, size, sort, filters });
	const { projects = [], totalElements = 0 } = data ?? {};

	return (
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
	);
}