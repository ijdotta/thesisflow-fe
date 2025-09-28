import { api } from '@/api/axios'
import type { ApiApplicationDomain, Page } from '@/types/ApiEntities'
import type { GetApplicationDomainsResponse } from '@/types/ApiResponses'

export async function searchApplicationDomains(query: string): Promise<GetApplicationDomainsResponse> {
  const { data } = await api.get('/application-domains', { params: { q: query } });
  if (data?.content && Array.isArray(data.content)) return data as GetApplicationDomainsResponse;
  if (Array.isArray(data)) return { content: data as ApiApplicationDomain[], totalElements: data.length, totalPages: 1, size: data.length, number: 0 } as Page<ApiApplicationDomain>;
  return { content: [], totalElements: 0, totalPages: 0, size: 0, number: 0 } as Page<ApiApplicationDomain>;
}
