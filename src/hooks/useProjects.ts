import {useQuery} from "@tanstack/react-query";
import {getProjects} from "@/api/projects";
import mapProjectResponseToProject from "@/mapper/responseToProjectMapper.ts";
import type {Project} from "@/types/Project.ts";

type Sort = { field: string; dir: "asc" | "desc" };

export type FetchProps = {
  page: number;
  size: number;
  sort: Sort;
};

export function useProjects({page, size, sort,}: FetchProps) {
  return useQuery({
    queryKey: ["projects", page, size, sort], // 👈 unique per combo
    queryFn: () => getProjects({page, size, sort}), // update your API fn
    staleTime: 60_000,
    select: (projects) =>
      (projects ?? []).map(mapProjectResponseToProject) as Project[],
    // keepPreviousData: true,
  });
}