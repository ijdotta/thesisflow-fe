import { useQuery } from '@tanstack/react-query'
import { getStudents } from '@/api/students'
import { mapApiStudentToFriendly } from '@/mapper/apiToFriendly'
import type { FriendlyStudent } from '@/types/FriendlyEntities'

export interface AllStudentsResponse { items: FriendlyStudent[] }

export function useAllStudents() {
  return useQuery({
    queryKey: ['all-students'],
    queryFn: async (): Promise<AllStudentsResponse> => {
      const response = await getStudents({
        page: 0,
        size: 1000,
        sort: { field: 'lastname', dir: 'asc' }
      });
      return {
        items: response.content.map(s => mapApiStudentToFriendly(s))
      };
    },
    staleTime: 5 * 60_000,
  });
}
