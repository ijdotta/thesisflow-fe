import { api } from '@/api/axios'
import type { ApiStudent } from '@/types/ApiEntities'

export async function searchStudents(query: string): Promise<ApiStudent[]> {
  const { data } = await api.get('/students', { params: { q: query } });
  if (Array.isArray(data)) return data as ApiStudent[];
  if (data?.content) return data.content as ApiStudent[];
  return [];
}
