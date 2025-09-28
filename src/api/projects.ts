import { api } from '@/api/axios'
import type {GetProjectsResponse} from "@/types/ProjectResponse.ts";
import type {FetchProps} from "@/hooks/useProjects.ts";

export async function getProjects(props: FetchProps): Promise<GetProjectsResponse> {
  const { page, size, sort } = props;
  const params: Record<string, string | number | undefined > = {
    page,
    size,
    sort: sort ? `${sort.field},${sort.dir}` : undefined,
    // ...(filters || {})
  };
  // Remove undefined params
  Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);
  const { data } = await api.get('/projects', { params });
  console.log("fetched:" + data)
  return data
}