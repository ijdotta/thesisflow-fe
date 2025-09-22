export interface ApplicationDomain {
  id: string,
  name: string,
  description: string,
}

export interface Tag {
  id: string,
  name: string,
  description: string,
}

export interface Person {
  id: string,
  name: string,
  lastname: string,
}

export interface Participant {
  id: string,
  person: Person,
  role: string,
}

export interface ProjectResponse {
  id: string,
  title: string,
  type: string,
  subtypes: string[],
  initialSubmission: string,
  completion: string,
  applicationDomain: ApplicationDomain,
  tags: Tag[],
  participants: Participant[],
}