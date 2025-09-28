import { useQuery } from '@tanstack/react-query';
import { getProfessors } from '@/api/professors';
import { mapApiPersonToFriendly } from '@/mapper/apiToFriendly';
import type { GetProfessorsResponse } from '@/types/ApiResponses';
import type { FriendlyPerson } from '@/types/FriendlyEntities';

export interface UseProfessorsParams {
  page: number; size: number; sort: { field: string; dir: 'asc'|'desc'}; filters?: Record<string,string>;
}

export interface ProfessorsList {
  professors: FriendlyPerson[];
  totalElements: number; totalPages: number; size: number; number: number;
}

function transform(resp: GetProfessorsResponse): ProfessorsList {
  return {
    professors: (resp.content ?? []).map(mapApiPersonToFriendly),
    totalElements: resp.totalElements,
    totalPages: resp.totalPages,
    size: resp.size,
    number: resp.number,
  };
}

export function useProfessors({ page, size, sort, filters = {} }: UseProfessorsParams) {
  return useQuery({
    queryKey: ['professors', { page, size, sort, filters }],
    queryFn: () => getProfessors({ page, size, sort, filters }),
    staleTime: 60_000,
    select: transform,
  });
}

