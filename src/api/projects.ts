import { api } from '@/api/axios'
import type {Project} from "@/types/project";

export async function getProjects(): Promise<Project[]> {
  const { data } = await api.get('/projects')
  return data
}