import type {ApplicationDomain, Tag} from "@/types/ProjectResponse.ts";
import type {Person} from "@/types/Person.ts";

export interface Career {
  publicId: string;
  name: string;
  description?: string;
}

export interface Project {
  publicId: string,
  title: string,
  type: string,
  subtypes: string[],
  initialSubmission: string,
  completion: string,
  applicationDomain: ApplicationDomain,
  career: Career,
  tags: Tag[],
  students: Person[],
  directors: Person[],
  codirectors: Person[],
  collaborators: Person[],
}