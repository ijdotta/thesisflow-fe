import { api } from '@/api/axios'
import type { ApiPerson, Page } from '@/types/ApiEntities'
import type { GetPeopleResponse } from '@/types/ApiResponses'

export async function searchPeople(query: string): Promise<GetPeopleResponse> {
  const { data } = await api.get('/people', { params: { q: query } });
  if (data?.content && Array.isArray(data.content)) return data as GetPeopleResponse;
  if (Array.isArray(data)) return { content: data as ApiPerson[], totalElements: data.length, totalPages: 1, size: data.length, number: 0 } as Page<ApiPerson>;
  return { content: [], totalElements: 0, totalPages: 0, size: 0, number: 0 } as Page<ApiPerson>;
}

export async function createPerson(body: { name: string; lastname: string; email?: string }): Promise<ApiPerson> {
  const { data } = await api.post('/people', body);
  return data;
}

// NEW: paginated list for People table
export interface FetchPeopleParams { page: number; size: number; sort: { field: string; dir: 'asc'|'desc'}; filters?: Record<string,string>; }
export async function getPeople({ page, size, sort, filters = {} }: FetchPeopleParams): Promise<GetPeopleResponse> {
  const params: Record<string,string> = { page: String(page), size: String(size), sort: `${sort.field},${sort.dir}`, ...filters };
  const { data } = await api.get('/people', { params });
  if (data?.content && Array.isArray(data.content)) return data as GetPeopleResponse;
  return { content: [], totalElements: 0, totalPages: 0, size, number: page } as GetPeopleResponse;
}

export async function updatePerson(publicId: string, body: { name: string; lastname: string; email?: string }): Promise<ApiPerson> {
  const { data } = await api.put(`/people/${publicId}`, body);
  return data;
}

export async function deletePerson(publicId: string): Promise<void> {
  await api.delete(`/people/${publicId}`);
}
