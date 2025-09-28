import { api } from '@/api/axios'
import type { ApiCareer, Page } from '@/types/ApiEntities'
import type { GetCareersResponse } from '@/types/ApiResponses'

export async function getCareers(): Promise<GetCareersResponse> {
  const { data } = await api.get('/careers');
  if (data?.content && Array.isArray(data.content)) {
    // content may be objects or simple strings
    const normalized = data.content.map((c: any): ApiCareer => typeof c === 'string' ? { name: c } : c);
    return { ...(data as object), content: normalized } as GetCareersResponse;
  }
  if (Array.isArray(data)) {
    const normalized = (data as any[]).map((c: any): ApiCareer => typeof c === 'string' ? { name: c } : c);
    return { content: normalized, totalElements: normalized.length, totalPages: 1, size: normalized.length, number: 0 } as Page<ApiCareer>;
  }
  return { content: [], totalElements: 0, totalPages: 0, size: 0, number: 0 } as Page<ApiCareer>;
}
