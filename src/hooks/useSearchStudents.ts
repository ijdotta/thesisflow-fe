import { useQuery } from '@tanstack/react-query'
import { searchStudents } from '@/api/students'
import { mapApiStudentToFriendly } from '@/mapper/apiToFriendly'
import type { FriendlyStudent } from '@/types/FriendlyEntities'

export function useSearchStudents(query: string) {
  return useQuery({
    queryKey: ['search','students', query],
    queryFn: () => searchStudents(query),
    enabled: !!query && query.trim().length > 0,
    staleTime: 60_000,
    select: (data): FriendlyStudent[] => data.map(mapApiStudentToFriendly)
  });
}
