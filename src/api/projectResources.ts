import { api } from '@/api/axios';
import type { ProjectResourceRequest } from '@/types/ProjectResource';
import type { ProjectResponse } from '@/types/ProjectResponse';

export async function updateProjectResources(
  projectId: string,
  resources: ProjectResourceRequest[]
): Promise<ProjectResponse> {
  const { data } = await api.put<ProjectResponse>(`/projects/${projectId}/resources`, resources);
  return data;
}
