import { useQuery } from '@tanstack/react-query'
import { searchApplicationDomains } from '@/api/applicationDomains'
import { mapApiApplicationDomainToFriendly } from '@/mapper/apiToFriendly'
import type { FriendlyApplicationDomain } from '@/types/FriendlyEntities'

export function useSearchApplicationDomains(query: string) {
  return useQuery({
    queryKey: ['search','application-domains', query],
    queryFn: () => searchApplicationDomains(query),
    enabled: !!query && query.trim().length > 0,
    staleTime: 60_000,
    select: (data): FriendlyApplicationDomain[] => data.map(mapApiApplicationDomainToFriendly)
  });
}
