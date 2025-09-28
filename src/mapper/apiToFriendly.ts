import type { ApiPerson, ApiStudent, ApiApplicationDomain } from '@/types/ApiEntities'
import type { FriendlyPerson, FriendlyStudent, FriendlyApplicationDomain } from '@/types/FriendlyEntities'

function buildDisplay(name?: string, lastname?: string) {
  const parts = [lastname, name].filter(Boolean)
  return parts.length ? parts.join(', ') : (name || lastname || '')
}

export function mapApiPersonToFriendly(p: ApiPerson): FriendlyPerson {
  return {
    id: p.id,
    name: p.name,
    lastname: p.lastname,
    email: (p as any).email,
    display: buildDisplay(p.name, p.lastname)
  }
}

export function mapApiStudentToFriendly(s: ApiStudent): FriendlyStudent {
  return {
    id: s.id,
    name: s.name,
    lastname: s.lastname,
    email: (s as any).email,
    studentId: s.studentId,
    career: s.career,
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
