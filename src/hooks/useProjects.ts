import {useQuery} from "@tanstack/react-query";
import {getProjects} from "@/api/projects";
import mapProjectResponseToProject from "@/mapper/responseToProjectMapper.ts";
import type {Project} from "@/types/Project.ts";
import type {GetProjectsResponse} from "@/types/ProjectResponse.ts";

type Sort = { field: string; dir: "asc" | "desc" };

export type FetchProps = {
  page: number;
  size: number;
  sort: Sort;
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

export function useProjects({page, size, sort,}: FetchProps) {
  return useQuery({
    queryKey: ["projects", page, size, sort], // 👈 unique per combo
    queryFn: () => getProjects({page, size, sort}), // update your API fn
    staleTime: 60_000,
    select: (response) => transform(response),
  });
}