import type {ApiPerson, ApiStudent, ApiApplicationDomain, ApiCareer, ApiTag} from '@/types/ApiEntities'
import type { FriendlyPerson, FriendlyStudent, FriendlyApplicationDomain } from '@/types/FriendlyEntities'

function buildDisplay(name?: string, lastname?: string) {
  const parts = [lastname, name].filter(Boolean)
  return parts.length ? parts.join(', ') : (name || lastname || '')
}

export function mapApiPersonToFriendly(p: ApiPerson): FriendlyPerson {
  return {
    publicId: p.publicId || p.id || '',
    name: p.name,
    lastname: p.lastname,
    email: p.email,
    display: buildDisplay(p.name, p.lastname)
  }
}

export function mapApiStudentToFriendly(s: ApiStudent): FriendlyStudent {
  const careers: string[] = Array.isArray(s.careers) ? [...s.careers] : [];
  if (s.career && !careers.includes(s.career)) careers.push(s.career);
  return {
    publicId: s.publicId || s.id || '',
    name: s.name,
    lastname: s.lastname,
    studentId: s.studentId,
    careers,
    email: s.email, // added email mapping
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
    publicId: c.publicId,
    name: c.name,
    description: c.description,
    display: c.name
  }
}

export function mapApiTagToFriendly(t: ApiTag): import('@/types/FriendlyEntities').FriendlyTag {
  return { publicId: t.publicId, name: t.name, description: t.description, display: t.name };
}
