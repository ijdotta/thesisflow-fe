import { useQuery } from '@tanstack/react-query'
import { getCareers } from '@/api/careers'
import { mapApiCareerToFriendly } from '@/mapper/apiToFriendly'
import type { FriendlyCareer } from '@/types/FriendlyEntities'
import type { GetCareersResponse } from '@/types/ApiResponses'

export interface CareersResponse { items: FriendlyCareer[]; page: Omit<GetCareersResponse,'content'> }

export function useCareers() {
  return useQuery({
    queryKey: ['careers'],
    queryFn: getCareers,
    staleTime: 5 * 60_000,
    select: (page: GetCareersResponse): CareersResponse => ({
      items: page.content.map(c => mapApiCareerToFriendly(c)),
      page: { totalElements: page.totalElements, totalPages: page.totalPages, size: page.size, number: page.number }
    })
  });
}
