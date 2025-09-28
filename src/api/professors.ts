import { api } from '@/api/axios'
import type { ApiPerson, Page } from '@/types/ApiEntities'
import type { GetProfessorsResponse } from '@/types/ApiResponses'

export async function searchProfessors(query: string): Promise<GetProfessorsResponse> {
  const { data } = await api.get('/professors', { params: { q: query } });
  if (data?.content && Array.isArray(data.content)) {
    return data as GetProfessorsResponse;
  }
  if (Array.isArray(data)) {
    return { content: data as ApiPerson[], totalElements: data.length, totalPages: 1, size: data.length, number: 0 } as Page<ApiPerson>;
  }
  return { content: [], totalElements: 0, totalPages: 0, size: 0, number: 0 } as Page<ApiPerson>;
}

export async function createProfessor(body: { personPublicId: string; email?: string }): Promise<ApiPerson> {
  const { data } = await api.post('/professors', body);
  return data;
}
