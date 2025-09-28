import { useQuery } from '@tanstack/react-query'
import { searchStudents } from '@/api/students'

export function useSearchStudents(query: string) {
  return useQuery({
    queryKey: ['search','students', query],
    queryFn: () => searchStudents(query),
    enabled: !!query && query.trim().length > 0,
    staleTime: 60_000,
  });
}

