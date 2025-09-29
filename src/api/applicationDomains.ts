import { api } from '@/api/axios'
import type { ApiApplicationDomain, Page } from '@/types/ApiEntities'
import type { GetApplicationDomainsResponse } from '@/types/ApiResponses'

export async function searchApplicationDomains(query: string): Promise<GetApplicationDomainsResponse> {
  const { data } = await api.get('/application-domains', { params: { q: query } });
  if (data?.content && Array.isArray(data.content)) return data as GetApplicationDomainsResponse;
  if (Array.isArray(data)) return { content: data as ApiApplicationDomain[], totalElements: data.length, totalPages: 1, size: data.length, number: 0 } as Page<ApiApplicationDomain>;
  return { content: [], totalElements: 0, totalPages: 0, size: 0, number: 0 } as Page<ApiApplicationDomain>;
}

// NEW: paginated list with sorting / filtering
export interface FetchDomainListParams { page: number; size: number; sort: { field: string; dir: 'asc'|'desc'}; filters?: Record<string,string>; }
export async function getApplicationDomainsList({ page, size, sort, filters = {} }: FetchDomainListParams): Promise<GetApplicationDomainsResponse> {
  const params: Record<string,string> = { page: String(page), size: String(size), sort: `${sort.field},${sort.dir}`, ...filters };
  const { data } = await api.get('/application-domains', { params });
  if (data?.content && Array.isArray(data.content)) return data as GetApplicationDomainsResponse;
  return { content: [], totalElements: 0, totalPages: 0, size, number: page } as GetApplicationDomainsResponse;
}

export async function createApplicationDomain(body: { name: string; description?: string }): Promise<ApiApplicationDomain> {
  const { data } = await api.post('/application-domains', body);
  return data;
}

export async function updateApplicationDomain(publicId: string, body: { name: string; description?: string }): Promise<ApiApplicationDomain> {
  const { data } = await api.put(`/application-domains/${publicId}`, body);
  return data;
}
