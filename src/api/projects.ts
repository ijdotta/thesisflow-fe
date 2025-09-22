import { api } from '@/api/axios'
import type {ProjectResponse} from "@/types/ProjectResponse.ts";

export async function getProjects(): Promise<ProjectResponse[]> {
  const { data } = await api.get('/projects')
  console.log("fetched:" + data)
  return data
}