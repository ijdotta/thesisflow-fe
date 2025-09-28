import { api } from '@/api/axios'

export interface SimpleStudent {
  id?: string;
  name: string;
  lastname: string;
  studentId?: string;
  career?: string;
}

export async function searchStudents(query: string): Promise<SimpleStudent[]> {
  const { data } = await api.get('/students', { params: { q: query } });
  return data?.content || data || [];
}

