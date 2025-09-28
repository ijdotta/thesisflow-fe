import { useQuery } from '@tanstack/react-query'
import { searchProfessors } from '@/api/professors'

export function useSearchProfessors(query: string) {
  return useQuery({
    queryKey: ['search','professors', query],
    queryFn: () => searchProfessors(query),
    enabled: !!query && query.trim().length > 0,
    staleTime: 60_000,
  });
}

