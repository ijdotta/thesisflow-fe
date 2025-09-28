import { api } from '@/api/axios'

export interface ApplicationDomainDTO {
  publicId: string;
  name: string;
  description?: string;
}

export async function searchApplicationDomains(query: string): Promise<ApplicationDomainDTO[]> {
  const { data } = await api.get('/application-domains', { params: { q: query } });
  return data?.content || data || [];
}

