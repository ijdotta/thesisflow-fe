import { api } from '@/api/axios'

export async function getCareers(): Promise<string[]> {
  const { data } = await api.get('/careers');
  if (Array.isArray(data)) return data as string[];
  if (data?.content) {
    // content could be array of { name: string } or direct strings
    return data.content.map((c: any) => typeof c === 'string' ? c : c.name).filter(Boolean);
  }
  return [];
}

