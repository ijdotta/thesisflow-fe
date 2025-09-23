import type {Participant, ProjectResponse} from "@/types/ProjectResponse.ts";
import type {Project} from "@/types/Project.ts";
import type {Person} from "@/types/Person.ts";

const mapParticipantToPerson = (participant: Participant): Person => {
  return {
    id: participant.personDTO.publicId,
    name: participant.personDTO.name,
    lastname: participant.personDTO.lastname,
  }
}

const mapTypeToString = (type: string): string => {
  switch (type) {
    case "FINAL_PROJECT":
      return "Proyecto Final"
    case "THESIS":
      return "Tesis"
    default:
      return "Desconocido"
  }
}

const mapSubTypeToString = (subtype: string): string => {
  switch (subtype) {
    case "VINCULACION":
      return "Vinculación"
    case "INVESTIGACION":
      return "Investigación"
    case "EXTENSION":
      return "Extensión"
    default:
      return ""
  }
}

const mapSubtypes = (subtypes: string[]): string[] => {
  const filtered = subtypes.map(mapSubTypeToString).filter(s => s !== "")
  return filtered.length > 0 ? filtered : ["Ninguno"]
}

const mapProjectResponseToProject = (projectResponse: ProjectResponse): Project => {
  const students: Person[] = []
  const directors: Person[] = []
  const codirectors: Person[] = []
  const collaborators: Person[] = []

 projectResponse.participants.forEach(p => {
   const person = mapParticipantToPerson(p)
    switch (p.role) {
     case "STUDENT":
        students.push(person)
        break
     case "DIRECTOR":
        directors.push(person)
        break
     case "CO_DIRECTOR":
        codirectors.push(person)
        break
     case "COLLABORATOR":
        collaborators.push(person)
        break
     default:
       // ignore unknown roles
       break
    }
 })

  return {
    publicId: projectResponse.publicId,
    title: projectResponse.title,
    type: mapTypeToString(projectResponse.type ?? ""),
    subtypes: mapSubtypes(projectResponse.subtypes ?? []),
    initialSubmission: projectResponse.initialSubmission,
    completion: projectResponse.completion,
    applicationDomain: projectResponse.applicationDomain,
    tags: projectResponse.tags,
    students: students,
    directors: directors,
    codirectors: codirectors,
    collaborators: collaborators,
  }
}

export default mapProjectResponseToProject