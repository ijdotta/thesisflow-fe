import type { ProjectResponse } from "@/types/projectResponse.ts";
import {Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";

type ProjectTableProps = {
  projects: ProjectResponse[];
};

export function ProjectTable({ projects }: ProjectTableProps) {
  return (
    <div className="flex justify-center p-8">
      <div className="w-full max-w-6xl">
        <Table>
          <TableCaption>Trabajos finales</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Subtipos</TableHead>
              <TableHead>Participantes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(projects ?? []).map((project) => (
              <TableRow key={project.id}>
                <TableCell>{project.title}</TableCell>
                <TableCell>{project.type}</TableCell>
                <TableCell>{project.subtypes?.join(", ")}</TableCell>
                <TableCell>{project.participants?.map(p => p.person.name + " " + p.person.lastname).join("; ")}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}