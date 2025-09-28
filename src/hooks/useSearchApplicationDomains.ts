import { useQuery } from '@tanstack/react-query'
import { searchApplicationDomains } from '@/api/applicationDomains'

export function useSearchApplicationDomains(query: string) {
  return useQuery({
    queryKey: ['search','application-domains', query],
    queryFn: () => searchApplicationDomains(query),
    enabled: !!query && query.trim().length > 0,
    staleTime: 60_000,
  });
}

