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

export interface CreateProjectBody {
  title: string;
  type: string;
  subtypes: string[];
  initialSubmission?: string;
}

export async function createProject(body: CreateProjectBody): Promise<{ publicId: string }> {
  const { data } = await api.post('/projects', body);
  return data;
}

export async function setProjectApplicationDomain(projectPublicId: string, applicationDomainId: string): Promise<void> {
  await api.put(`/projects/${projectPublicId}/application-domain`, { applicationDomainId });
}

export async function setProjectParticipants(projectPublicId: string, participants: { personId: string; role: 'STUDENT' | 'DIRECTOR' | 'CO_DIRECTOR' | 'COLLABORATOR'}[]): Promise<void> {
  if (!participants.length) return;
  await api.put(`/projects/${projectPublicId}/participants`, { participants });
}

export async function getProject(publicId: string): Promise<GetProjectsResponse['content'][number]> {
  const { data } = await api.get(`/projects/${publicId}`);
  return data;
}

export async function setProjectTags(projectPublicId: string, tagPublicIds: string[]): Promise<void> {
  await api.put(`/projects/${projectPublicId}/tags`, { tags: tagPublicIds });
}
