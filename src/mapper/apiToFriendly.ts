import type {ApiPerson, ApiStudent, ApiApplicationDomain, ApiCareer} from '@/types/ApiEntities'
import type { FriendlyPerson, FriendlyStudent, FriendlyApplicationDomain } from '@/types/FriendlyEntities'

function buildDisplay(name?: string, lastname?: string) {
  const parts = [lastname, name].filter(Boolean)
  return parts.length ? parts.join(', ') : (name || lastname || '')
}

export function mapApiPersonToFriendly(p: ApiPerson): FriendlyPerson {
  return {
    id: p.publicId,
    name: p.name,
    lastname: p.lastname,
    display: buildDisplay(p.name, p.lastname)
  }
}

export function mapApiStudentToFriendly(s: ApiStudent): FriendlyStudent {
  return {
    id: s.publicId,
    name: s.name,
    lastname: s.lastname,
    email: s.email,
    studentId: s.studentId,
    career: s.careers,
    display: buildDisplay(s.name, s.lastname)
  }
}

export function mapApiApplicationDomainToFriendly(d: ApiApplicationDomain): FriendlyApplicationDomain {
  return {
    publicId: d.publicId,
    name: d.name,
    description: d.description,
    display: d.name
  }
}

export function mapApiCareerToFriendly(c: ApiCareer): import('@/types/FriendlyEntities').FriendlyCareer {
  return {
    id: c.publicId,
    name: c.name,
    description: c.description,
    display: c.name
  }
}
