import type {ApplicationDomain, Tag} from "@/types/ProjectResponse.ts";
import type {Student} from "@/types/Student.ts";
import type {Professor} from "@/types/Professor.ts";
import type {Person} from "@/types/Person.ts";

export interface Project {
  id: string,
  title: string,
  type: string,
  subtypes: string[],
  initialSubmission: string,
  completion: string,
  applicationDomain: ApplicationDomain,
  tags: Tag[],
  students: Student[],
  directors: Professor[],
  codirectors: Professor[],
  collaborators: Person[],
}