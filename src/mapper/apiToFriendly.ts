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
  const careers: string[] = [];

  // Handle new careers array format (array of career objects)
  if (Array.isArray(s.careers)) {
    s.careers.forEach(c => {
      if (typeof c === 'object' && c.name) {
        // Career object with name property
        if (!careers.includes(c.name)) careers.push(c.name);
      } else if (typeof c === 'string') {
        // Legacy: career as string
        if (!careers.includes(c)) careers.push(c);
      }
    });
  }

  // Handle legacy single career object format from backend
  if (s.career && typeof s.career === 'object' && s.career.name) {
    if (!careers.includes(s.career.name)) careers.push(s.career.name);
  }

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
  // Fallbacks: some backends may send id instead of publicId
  const pid = (t as any).publicId || (t as any).id || `${t.name}`;
  return { publicId: pid, name: t.name, description: (t as any).description, display: t.name };
}
