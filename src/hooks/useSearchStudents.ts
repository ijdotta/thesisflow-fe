import { useQuery } from '@tanstack/react-query'
import { searchStudents } from '@/api/students'
import { mapApiStudentToFriendly } from '@/mapper/apiToFriendly'
import type { FriendlyStudent } from '@/types/FriendlyEntities'
import type { GetStudentsResponse } from '@/types/ApiResponses'

export interface StudentsResponse { items: FriendlyStudent[]; page: Omit<GetStudentsResponse,'content'> }

export function useSearchStudents(query: string) {
  return useQuery({
    queryKey: ['search','students', query],
    queryFn: () => searchStudents(query),
    enabled: !!query && query.trim().length > 0,
    staleTime: 60_000,
    select: (page): StudentsResponse => ({
      items: page.content.map(mapApiStudentToFriendly),
      page: { totalElements: page.totalElements, totalPages: page.totalPages, size: page.size, number: page.number }
    })
  });
}
