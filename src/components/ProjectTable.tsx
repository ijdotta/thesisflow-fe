import {DataTable, type Column} from "@/components/DataTable.tsx";
import {createRestFetcher} from "@/components/restFetcher.ts";
import type {Project} from "@/types/Project.ts";
import {Button} from "@/components/ui/button.tsx";
import {Edit, Trash, EyeIcon} from "lucide-react";

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
        <Button variant="default">
          <a href={`/projects/${row.publicId}`}>< EyeIcon /></a>
        </Button>
        <Button variant="secondary">
          <a href={`/projects/${row.publicId}`}>< Edit /></a>
        </Button>
      </div>
    )
  }
]

const fetchProjects = createRestFetcher<Project>("http://localhost:8080")

export default function ProjectTable() {
  return (
    <DataTable<Project>
      columns={columns}
      fetcher={fetchProjects}
    />
  );
}