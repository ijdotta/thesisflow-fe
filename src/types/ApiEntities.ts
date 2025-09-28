// Central API entity type definitions (raw shapes returned by backend)
export interface ApiPerson {
  id: string;
  name: string;
  lastname: string;
  email?: string;
}

export interface ApiProfessor extends ApiPerson {
  email: string;
}

export interface ApiStudent extends ApiPerson {
  studentId?: string;
  career?: string;
}

export interface ApiApplicationDomain {
  publicId: string;
  name: string;
  description?: string;
}

export interface ApiCareer {
  id?: string;
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
