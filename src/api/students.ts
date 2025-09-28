import { api } from '@/api/axios'
import type { ApiStudent, Page } from '@/types/ApiEntities'
import type { GetStudentsResponse } from '@/types/ApiResponses'

export async function searchStudents(query: string): Promise<GetStudentsResponse> {
  const { data } = await api.get('/students', { params: { q: query } });
  if (data?.content && Array.isArray(data.content)) return data as GetStudentsResponse;
  if (Array.isArray(data)) return { content: data as ApiStudent[], totalElements: data.length, totalPages: 1, size: data.length, number: 0 } as Page<ApiStudent>;
  return { content: [], totalElements: 0, totalPages: 0, size: 0, number: 0 } as Page<ApiStudent>;
}

export async function createStudent(body: { personPublicId: string; studentId?: string; email?: string }): Promise<ApiStudent> {
  const { data } = await api.post('/students', body);
  return data;
}

export async function setStudentCareers(studentPublicId: string, careerPublicIds: string[]): Promise<ApiStudent | null> {
  if (!careerPublicIds.length) return null;
  const { data } = await api.put(`/students/${studentPublicId}/careers`, { careers: careerPublicIds });
  return data;
}

export interface FetchStudentsParams { page: number; size: number; sort: { field: string; dir: 'asc'|'desc'}; filters?: Record<string,string>; }

export async function getStudents({ page, size, sort, filters = {} }: FetchStudentsParams): Promise<GetStudentsResponse> {
  const params: Record<string,string> = {
    page: String(page),
    size: String(size),
    sort: `${sort.field},${sort.dir}`,
    ...filters,
  };
  const { data } = await api.get('/students', { params });
  if (data?.content && Array.isArray(data.content)) return data as GetStudentsResponse;
  return { content: [], totalElements: 0, totalPages: 0, size, number: page } as GetStudentsResponse;
}
