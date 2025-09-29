import { useQuery } from '@tanstack/react-query';
import { getProject } from '@/api/projects';
import mapProjectResponseToProject from '@/mapper/responseToProjectMapper';
import type { Project } from '@/types/Project';

export function useProject(publicId: string | null) {
  return useQuery<Project | null>({
    queryKey: ['project', publicId],
    enabled: !!publicId,
    queryFn: async () => {
      if (!publicId) return null;
      const resp = await getProject(publicId);
      return mapProjectResponseToProject(resp);
    },
    staleTime: 60_000,
  });
}

