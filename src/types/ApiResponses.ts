import type {ApiPerson, ApiStudent, ApiApplicationDomain, ApiCareer, ApiProfessor, ApiTag} from '@/types/ApiEntities'
import type { Page } from '@/types/ApiEntities'

export type GetProfessorsResponse = Page<ApiProfessor>
export type GetPeopleResponse = Page<ApiPerson>
export type GetStudentsResponse = Page<ApiStudent>
export type GetApplicationDomainsResponse = Page<ApiApplicationDomain>
export type GetCareersResponse = Page<ApiCareer>
export type GetTagsResponse = Page<ApiTag>

// Helper to coerce arbitrary backend responses into a Page<T>
export function ensurePage<T>(raw: any, mapItem: (x:any)=>T): Page<T> {
  if (raw && Array.isArray(raw.content)) {
    return {
      content: raw.content.map(mapItem),
      totalElements: typeof raw.totalElements === 'number' ? raw.totalElements : raw.content.length,
      totalPages: typeof raw.totalPages === 'number' ? raw.totalPages : 1,
      size: typeof raw.size === 'number' ? raw.size : raw.content.length,
      number: typeof raw.number === 'number' ? raw.number : 0,
    }
  }
  if (Array.isArray(raw)) {
    return { content: raw.map(mapItem), totalElements: raw.length, totalPages: 1, size: raw.length, number: 0 }
  }
  return { content: [], totalElements: 0, totalPages: 0, size: 0, number: 0 }
}
