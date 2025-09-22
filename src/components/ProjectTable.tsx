import {Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import type {Person} from "@/types/Person.ts";
import type {Project} from "@/types/Project.ts";

type ProjectTableProps = {
  projects: Project[];
};

const mapPersonToString = (person: Person): string => {
  return `${person.lastname}, ${person.name}`;
}

const mapParticipantsToCellString = (participants: Person[]): string => {
  return participants.map(mapPersonToString).join("; ");
}

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
              <TableHead>Directores</TableHead>
              <TableHead>Co-directores</TableHead>
              <TableHead>Colaboradores</TableHead>
              <TableHead>Alumnos</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(projects ?? []).map((project) => (
              <TableRow key={project.id}>
                <TableCell>{project.title}</TableCell>
                <TableCell>{project.type}</TableCell>
                <TableCell>{project.subtypes?.join(", ")}</TableCell>
                <TableCell></TableCell>
                <TableCell>{mapParticipantsToCellString(project.directors)}</TableCell>
                <TableCell>{mapParticipantsToCellString(project.codirectors)}</TableCell>
                <TableCell>{mapParticipantsToCellString(project.collaborators)}</TableCell>
                <TableCell>{mapParticipantsToCellString(project.students)}</TableCell>
                <TableCell>{project.completion ? "Finalizado" : "En curso"}</TableCell>
                <TableCell>
                  <a
                    href={`https://repositorio.utn.edu.ar/handle/123456789/${project.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Ver en Repositorio
                  </a>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}