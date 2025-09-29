// Basic Tags API helpers
import { api } from '@/api/axios';
import type { ApiTag, Page } from '@/types/ApiEntities';
import type { GetTagsResponse } from '@/types/ApiResponses';

export interface FetchListParams { page: number; size: number; sort: { field: string; dir: 'asc'|'desc'}; filters?: Record<string,string>; }

export async function getTags({ page, size, sort, filters = {} }: FetchListParams): Promise<GetTagsResponse> {
  const params: Record<string,string> = {
    page: String(page),
    size: String(size),
    sort: `${sort.field},${sort.dir}`,
    ...filters,
  };
  const { data } = await api.get('/tags', { params });
  if (data?.content && Array.isArray(data.content)) return data as GetTagsResponse;
  if (Array.isArray(data)) return { content: data as ApiTag[], totalElements: data.length, totalPages: 1, size: data.length, number: 0 } as Page<ApiTag>;
  return { content: [], totalElements: 0, totalPages: 0, size, number: page } as GetTagsResponse;
}

export async function createTag(body: { name: string; description?: string }): Promise<ApiTag> {
  const { data } = await api.post('/tags', body);
  return data;
}

export async function updateTag(publicId: string, body: { name: string; description?: string }): Promise<ApiTag> {
  const { data } = await api.put(`/tags/${publicId}`, body);
  return data;
}

