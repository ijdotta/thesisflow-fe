import { api } from '@/api/axios'
import type {ProjectResponse} from "@/types/projectResponse.ts";

export async function getProjects(): Promise<ProjectResponse[]> {
  const { data } = await api.get('/projects')
  return data
}