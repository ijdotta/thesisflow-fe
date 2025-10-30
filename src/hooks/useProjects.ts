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
    if (user?.role === 'PROFESSOR' && user.professorId) {
      return { ...filters, professorId: user.professorId }
    }
    return filters
  }, [filters, user?.professorId, user?.role])

  return useQuery({
    queryKey: ["projects", { page, size, sort, filters: mergedFilters }],
    queryFn: () => getProjects({page, size, sort, filters: mergedFilters}),
    staleTime: 60_000,
    select: (response) => transform(response),
  });
}
