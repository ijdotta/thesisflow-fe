import { api } from '@/api/axios'

export interface SimplePerson {
  id?: string;
  name: string;
  lastname: string;
  email?: string;
}

export async function searchPeople(query: string): Promise<SimplePerson[]> {
  const { data } = await api.get('/people', { params: { q: query } });
  return data?.content || data || [];
}

