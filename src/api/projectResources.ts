import type { ProjectResourceRequest } from '@/types/ProjectResource';
import type { ProjectResponse } from '@/types/ProjectResponse';

export async function updateProjectResources(
  projectId: string,
  resources: ProjectResourceRequest[]
): Promise<ProjectResponse> {
  const response = await fetch(`/api/projects/${projectId}/resources`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(resources),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update resources');
  }

  return response.json();
}
