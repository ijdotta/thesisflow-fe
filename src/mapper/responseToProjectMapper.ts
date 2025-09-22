import type {Participant, ProjectResponse} from "@/types/ProjectResponse.ts";
import type {Project} from "@/types/Project.ts";
import type {Person} from "@/types/Person.ts";

const mapParticipantToPerson = (participant: Participant): Person => {
  return {
    id: participant.person.id,
    name: participant.person.name,
    lastname: participant.person.lastname,
  }
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
     case "CODIRECTOR":
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
    id: projectResponse.id,
    title: projectResponse.title,
    type: projectResponse.type,
    subtypes: projectResponse.subtypes,
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