import { useQuery } from '@tanstack/react-query'
import { getApplicationDomainsList } from '@/api/applicationDomains'
import { mapApiApplicationDomainToFriendly } from '@/mapper/apiToFriendly'
import type { FriendlyApplicationDomain } from '@/types/FriendlyEntities'

export interface AllDomainsResponse { items: FriendlyApplicationDomain[] }

export function useAllApplicationDomains() {
  return useQuery({
    queryKey: ['all-application-domains'],
    queryFn: async (): Promise<AllDomainsResponse> => {
      const response = await getApplicationDomainsList({
        page: 0,
        size: 1000,
        sort: { field: 'name', dir: 'asc' }
      });
      return {
        items: response.content.map(d => mapApiApplicationDomainToFriendly(d))
      };
    },
    staleTime: 5 * 60_000,
  });
}
