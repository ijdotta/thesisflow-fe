import { api } from '@/api/axios'
import type { ApiApplicationDomain } from '@/types/ApiEntities'

export async function searchApplicationDomains(query: string): Promise<ApiApplicationDomain[]> {
  const { data } = await api.get('/application-domains', { params: { q: query } });
  if (Array.isArray(data)) return data as ApiApplicationDomain[];
  if (data?.content) return data.content as ApiApplicationDomain[];
  return [];
}
