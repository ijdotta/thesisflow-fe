import { api } from '@/api/axios'
import type { ApiPerson, Page } from '@/types/ApiEntities'
import type { GetPeopleResponse } from '@/types/ApiResponses'

export async function searchPeople(query: string): Promise<GetPeopleResponse> {
  const { data } = await api.get('/people', { params: { q: query } });
  if (data?.content && Array.isArray(data.content)) return data as GetPeopleResponse;
  if (Array.isArray(data)) return { content: data as ApiPerson[], totalElements: data.length, totalPages: 1, size: data.length, number: 0 } as Page<ApiPerson>;
  return { content: [], totalElements: 0, totalPages: 0, size: 0, number: 0 } as Page<ApiPerson>;
}

export async function createPerson(body: { name: string; lastname: string }): Promise<ApiPerson> {
  const { data } = await api.post('/people', body);
  return data;
}
