import { useQuery } from '@tanstack/react-query';
import { getApplicationDomainsList, type FetchDomainListParams } from '@/api/applicationDomains';
import { mapApiApplicationDomainToFriendly } from '@/mapper/apiToFriendly';
import type { GetApplicationDomainsResponse } from '@/types/ApiResponses';
import type { FriendlyApplicationDomain } from '@/types/FriendlyEntities';

interface DomainsList { domains: FriendlyApplicationDomain[]; totalElements: number; totalPages: number; size: number; number: number; }

function transform(resp: GetApplicationDomainsResponse): DomainsList {
  return {
    domains: (resp.content || []).map(mapApiApplicationDomainToFriendly),
    totalElements: resp.totalElements,
    totalPages: resp.totalPages,
    size: resp.size,
    number: resp.number,
  };
}

export function usePagedApplicationDomains(params: FetchDomainListParams) {
  return useQuery({
    queryKey: ['application-domains','paged', params],
    queryFn: () => getApplicationDomainsList(params),
    staleTime: 60_000,
    select: transform,
  });
}

