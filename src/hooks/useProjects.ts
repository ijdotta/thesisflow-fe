import { useQuery } from "@tanstack/react-query";
import { getProjects } from "@/api/projects";
import mapProjectResponseToProject from "@/mapper/responseToProjectMapper.ts";
import type { Project } from "@/types/Project.ts";

export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: getProjects,
    staleTime: 60_000,
    select: (projects) => (projects ?? []).map(mapProjectResponseToProject) as Project[],
  });
}