import { useMemo } from "react";
import {useQuery} from "@tanstack/react-query";
import {getProjects} from "@/api/projects";
import mapProjectResponseToProject from "@/mapper/responseToProjectMapper.ts";
import type {Project} from "@/types/Project.ts";
import type {GetProjectsResponse} from "@/types/ProjectResponse.ts";
import {useAuth} from "@/contexts/useAuth";

type Sort = { field: string; dir: "asc" | "desc" };

export type FetchProps = {
  page: number;
  size: number;
  sort: Sort;
  filters?: Record<string, string>; // optional filters keyed by backend field
};

export type TransformedProjectsResponse = {
  projects: Project[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
};

function transform(response: GetProjectsResponse): TransformedProjectsResponse {
  return {
    projects: (response.content ?? []).map(mapProjectResponseToProject) as Project[],
    totalElements: response.totalElements,
    totalPages: response.totalPages,
    size: response.size,
    number: response.number,
  }
}

export function useProjects({page, size, sort, filters = {}}: FetchProps) {
  const { user } = useAuth()

  const mergedFilters = useMemo(() => {
    const base = { ...filters }
    // Always add professorId filter for professors (use person's publicId, not professor's publicId)
    if (user) {
      console.log('[useProjects] user.role:', user.role, 'user.professorPersonId:', (user as any).professorPersonId)
      if (user.role === 'PROFESSOR') {
        // Use professorPersonId (the Person's publicId) for filtering
        const personId = (user as any).professorPersonId
        if (personId) {
          base.professorId = personId
          console.log('[useProjects] Added professorId filter (person):', personId)
        } else {
          console.warn('[useProjects] Professor logged in but has no professorPersonId - cannot filter projects')
        }
      }
    }
    return base
  }, [filters, user?.role, (user as any)?.professorPersonId])

  return useQuery({
    queryKey: ["projects", { page, size, sort, filters: mergedFilters }],
    queryFn: () => getProjects({page, size, sort, filters: mergedFilters}),
    staleTime: 60_000,
    select: (response) => transform(response),
    enabled: user !== null, // Only run query when user is loaded
  });
}
