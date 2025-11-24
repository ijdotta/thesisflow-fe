export interface ApplicationDomain {
  publicId: string,
  name: string,
  description: string,
}

export interface Tag {
  publicId: string,
  name: string,
  description: string,
}

export interface Person {
  id: string,
  publicId: string,
  name: string,
  lastname: string,
}

export interface Participant {
  // publicId: string,
  personDTO: Person,
  role: string,
}

export interface ProjectResponse {
  publicId: string,
  title: string,
  type: string,
  subtypes: string[],
  initialSubmission: string,
  completion: string,
  applicationDomain: ApplicationDomain,
  career: { publicId: string; name: string; description?: string },
  tags: Tag[],
  participants: Participant[],
  resources?: string, // JSON string of resources (stored as string in DB)
}

export interface GetProjectsResponse {
  content: ProjectResponse[],
  totalElements: number,
  totalPages: number,
  size: number,
  number: number,
}