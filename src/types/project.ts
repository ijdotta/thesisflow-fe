interface ApplicationDomain {
  id: string,
  name: string,
  description: string,
}

interface Tag {
  id: string,
  name: string,
  description: string,
}

interface Person {
  id: string,
  name: string,
  lastname: string,
}

interface Participant {
  id: string,
  person: Person,
  role: string,
}

export interface Project {
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