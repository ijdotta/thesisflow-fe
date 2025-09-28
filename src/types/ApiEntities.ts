// Central API entity type definitions (raw shapes returned by backend)
export interface ApiResource {
  publicId: string;
}

export interface ApiPerson {
  id?: string; // some endpoints
  publicId?: string; // some endpoints return publicId instead of id
  name: string;
  lastname: string;
  email?: string;
}

export interface ApiProfessor extends ApiPerson {
  email?: string;
}

export interface ApiStudent extends ApiPerson {
  studentId?: string;
  career?: string; // legacy
  careers?: string[]; // new multi-career
}

export interface ApiApplicationDomain extends ApiResource {
  name: string;
  description?: string;
}

export interface ApiCareer extends  ApiResource {
  name: string;
  description?: string;
  id?: string; // fallback local id if needed
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
