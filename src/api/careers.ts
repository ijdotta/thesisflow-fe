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
