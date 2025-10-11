import { useQuery } from '@tanstack/react-query';
import { getCareersList, type FetchCareerListParams } from '@/api/careers';
import { mapApiCareerToFriendly } from '@/mapper/apiToFriendly';
import type { FriendlyCareer } from '@/types/FriendlyEntities';
import type { GetCareersResponse } from '@/types/ApiResponses';

interface CareersList {
  careers: FriendlyCareer[];
  totalElements: number; totalPages: number; size: number; number: number;
}

function transform(resp: GetCareersResponse): CareersList {
  return {
    careers: (resp.content || []).map(mapApiCareerToFriendly),
    totalElements: resp.totalElements,
    totalPages: resp.totalPages,
    size: resp.size,
    number: resp.number,
  }
}

export function usePagedCareers(params: FetchCareerListParams) {
  return useQuery({
    queryKey: ['careers','paged', params],
    queryFn: () => getCareersList(params),
    staleTime: 60_000,
    select: transform,
  });
}

