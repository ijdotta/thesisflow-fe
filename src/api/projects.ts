import { api } from '@/api/axios'
import type {GetProjectsResponse} from "@/types/ProjectResponse.ts";
import type {FetchProps} from "@/hooks/useProjects.ts";

export async function getProjects(props: FetchProps): Promise<GetProjectsResponse> {
  const { page, size, sort, filters = {} } = props;
  const params: Record<string, string | number > = {
    page: String(page),
    size: String(size),
    ...(sort ? { sort: `${sort.field},${sort.dir}` } : {}),
    ...filters, // spread filters directly (ensure backend expects these names)
  };
  const { data } = await api.get('/projects', { params });
  return data
}