import { api } from '@/api/axios'

export interface SimpleProfessor {
  id: string;
  name: string;
  lastname: string;
  email?: string;
}

export async function searchProfessors(query: string): Promise<SimpleProfessor[]> {
  const { data } = await api.get('/professors', { params: { q: query } });
  return data?.content || data || [];
}

