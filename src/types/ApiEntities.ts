// Central API entity type definitions (raw shapes returned by backend)
export interface ApiResource {
  publicId: string;
}

export interface ApiPerson extends ApiResource {
  name: string;
  lastname: string;
}

export interface ApiProfessor extends ApiPerson {
  person: ApiPerson;
  email: string;
}

export interface ApiStudent extends ApiPerson {
  email: string;
  studentId: string;
  careers: ApiCareer[];
}

export interface ApiApplicationDomain extends ApiResource {
  name: string;
  description?: string;
}

export interface ApiCareer extends  ApiResource {
  name: string;
  description?: string;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
