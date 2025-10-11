import { api } from '@/api/axios'
import type { ApiCareer, Page } from '@/types/ApiEntities'
import type { GetCareersResponse } from '@/types/ApiResponses'

export async function getCareers(): Promise<GetCareersResponse> {
  const { data } = await api.get('/careers');
  if (data?.content && Array.isArray(data.content)) {
    const normalized = data.content.map((c: any, idx: number): ApiCareer => {
      if (typeof c === 'string') return { publicId: `career-${idx}-${c}`, name: c };
      return { publicId: c.publicId || c.id || `career-${idx}-${c.name}`, name: c.name, description: c.description };
    });
    return { ...(data as object), content: normalized } as GetCareersResponse;
  }
  if (Array.isArray(data)) {
    const normalized = (data as any[]).map((c: any, idx: number): ApiCareer => typeof c === 'string'
      ? { publicId: `career-${idx}-${c}`, name: c }
      : { publicId: c.publicId || c.id || `career-${idx}-${c.name}`, name: c.name, description: c.description });
    return { content: normalized, totalElements: normalized.length, totalPages: 1, size: normalized.length, number: 0 } as Page<ApiCareer>;
  }
  return { content: [], totalElements: 0, totalPages: 0, size: 0, number: 0 } as Page<ApiCareer>;
}

// NEW paginated list with sorting / filtering
export interface FetchCareerListParams { page: number; size: number; sort: { field: string; dir: 'asc'|'desc'}; filters?: Record<string,string>; }
export async function getCareersList({ page, size, sort, filters = {} }: FetchCareerListParams): Promise<GetCareersResponse> {
  const params: Record<string,string> = { page: String(page), size: String(size), sort: `${sort.field},${sort.dir}`, ...filters };
  const { data } = await api.get('/careers', { params });
  if (data?.content && Array.isArray(data.content)) return data as GetCareersResponse;
  return { content: [], totalElements: 0, totalPages: 0, size, number: page } as GetCareersResponse;
}

export async function createCareer(body: { name: string; description?: string }): Promise<ApiCareer> {
  const { data } = await api.post('/careers', body);
  return data;
}

export async function updateCareer(publicId: string, body: { name: string; description?: string }): Promise<ApiCareer> {
  const { data } = await api.put(`/careers/${publicId}`, body);
  return data;
}

export async function deleteCareer(publicId: string): Promise<void> {
  await api.delete(`/careers/${publicId}`);
}
