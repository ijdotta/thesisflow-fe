import { useQuery } from '@tanstack/react-query';
import { getStudents } from '@/api/students';
import { mapApiStudentToFriendly } from '@/mapper/apiToFriendly';
import type { GetStudentsResponse } from '@/types/ApiResponses';
import type { FriendlyStudent } from '@/types/FriendlyEntities';

export interface UseStudentsParams { page: number; size: number; sort: { field: string; dir: 'asc'|'desc'}; filters?: Record<string,string>; }
export interface StudentsList { students: FriendlyStudent[]; totalElements: number; totalPages: number; size: number; number: number; }

function transform(resp: GetStudentsResponse): StudentsList {
  return {
    students: (resp.content ?? []).map(mapApiStudentToFriendly),
    totalElements: resp.totalElements,
    totalPages: resp.totalPages,
    size: resp.size,
    number: resp.number,
  };
}

export function useStudents({ page, size, sort, filters = {} }: UseStudentsParams) {
  return useQuery({
    queryKey: ['students', { page, size, sort, filters }],
    queryFn: () => getStudents({ page, size, sort, filters }),
    staleTime: 60_000,
    select: transform,
  });
}

