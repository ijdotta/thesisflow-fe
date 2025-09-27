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
  },
  {
    id: "type",
    header: "Tipo",
    accessor: (row) => row.type,
    sortField: "type",
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
  },
  {
    id: "students",
    header: "Alumnos",
    accessor: (row) => row.students.map(s => `${s.lastname}, ${s.name}`).sort().join("\n"),
    sortField: "students",
  },
  {
    id: "status",
    header: "Estado",
    accessor: (row) => row.completion ? "Finalizado" : "En curso",
  },
  {
    id: "actions",
    header: "Acciones",
    accessor: (row) => (
      <div>
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
  const [sort, setSort] = React.useState<Sort>({ field: "createdAt", dir: "desc" as const });

  // const { data: rows = [], total = 0, isLoading, error } =
  const { data: rows = [], isLoading, error } =
    useProjects({ page, size, sort, /* filters: { ...optional } */ });
  const total = rows.length; // Temporary until API provides total

  return (
    <DataTable<Project>
      columns={columns}
      rows={rows}
      total={total}
      loading={isLoading}
      error={error ? String(error) : null}
      page={page}
      size={size}
      sort={sort}
      onPageChange={setPage}
      onSizeChange={setSize}
      onSortChange={setSort}
    />
  );
}