import { useQuery } from '@tanstack/react-query'
import { searchApplicationDomains } from '@/api/applicationDomains'
import { mapApiApplicationDomainToFriendly } from '@/mapper/apiToFriendly'
import type { FriendlyApplicationDomain } from '@/types/FriendlyEntities'
import type { GetApplicationDomainsResponse } from '@/types/ApiResponses'

export interface ApplicationDomainsResponse { items: FriendlyApplicationDomain[]; page: Omit<GetApplicationDomainsResponse,'content'> }

export function useSearchApplicationDomains(query: string) {
  return useQuery({
    queryKey: ['search','application-domains', query],
    queryFn: () => searchApplicationDomains(query),
    enabled: !!query && query.trim().length > 0,
    staleTime: 60_000,
    select: (page): ApplicationDomainsResponse => ({
      items: page.content.map(mapApiApplicationDomainToFriendly),
      page: { totalElements: page.totalElements, totalPages: page.totalPages, size: page.size, number: page.number }
    })
  });
}
