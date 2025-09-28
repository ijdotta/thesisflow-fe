import { api } from '@/api/axios'
import type { ApiPerson } from '@/types/ApiEntities'

export async function searchPeople(query: string): Promise<ApiPerson[]> {
  const { data } = await api.get('/people', { params: { q: query } });
  if (Array.isArray(data)) return data as ApiPerson[];
  if (data?.content) return data.content as ApiPerson[];
  return [];
}
