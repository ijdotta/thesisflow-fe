// Project Wizard shared types
export interface PersonBase {
  publicId?: string; // local temp for manual entities
  name: string;
  lastname: string;
  email?: string;
}

export interface StudentDraft extends PersonBase {
  studentId?: string;
}

export interface Domain { publicId: string; name: string; }

export interface ProjectDraft {
  title: string;
  type: string;
  subtypes: string[];
  applicationDomain?: Domain | null;
  initialSubmission?: string;
  directors: PersonBase[];
  codirectors: PersonBase[];
  collaborators: PersonBase[];
  students: StudentDraft[];
}

export const SUBTYPE_OPTIONS = ['Investigación', 'Extensión', 'Vinculación'];

export const emptyDraft: ProjectDraft = {
  title: '',
  type: '',
  subtypes: [],
  applicationDomain: null,
  initialSubmission: undefined,
  directors: [],
  codirectors: [],
  collaborators: [],
  students: [],
};
