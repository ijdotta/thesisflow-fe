import { api } from '@/api/axios'
import type { ApiStudent, Page } from '@/types/ApiEntities'
import type { GetStudentsResponse } from '@/types/ApiResponses'

export async function searchStudents(query: string): Promise<GetStudentsResponse> {
  const { data } = await api.get('/students', { params: { q: query } });
  if (data?.content && Array.isArray(data.content)) return data as GetStudentsResponse;
  if (Array.isArray(data)) return { content: data as ApiStudent[], totalElements: data.length, totalPages: 1, size: data.length, number: 0 } as Page<ApiStudent>;
  return { content: [], totalElements: 0, totalPages: 0, size: 0, number: 0 } as Page<ApiStudent>;
}
