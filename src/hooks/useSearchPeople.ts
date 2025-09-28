import { useQuery } from '@tanstack/react-query'
import { searchPeople } from '@/api/people'

export function useSearchPeople(query: string) {
  return useQuery({
    queryKey: ['search','people', query],
    queryFn: () => searchPeople(query),
    enabled: !!query && query.trim().length > 0,
    staleTime: 60_000,
  });
}

