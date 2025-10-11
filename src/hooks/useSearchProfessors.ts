import { useQuery } from '@tanstack/react-query'
import { searchProfessors } from '@/api/professors'
import { mapApiPersonToFriendly } from '@/mapper/apiToFriendly'
import type { FriendlyPerson } from '@/types/FriendlyEntities'
import type { GetProfessorsResponse } from '@/types/ApiResponses'

export interface ProfessorsResponse {
  items: FriendlyPerson[];
  page: Omit<GetProfessorsResponse, 'content'>;
}

export function useSearchProfessors(query: string) {
  return useQuery({
    queryKey: ['search','professors', query],
    queryFn: () => searchProfessors(query),
    enabled: !!query && query.trim().length > 0,
    staleTime: 60_000,
    select: (page): ProfessorsResponse => ({
      items: page.content.map(mapApiPersonToFriendly),
      page: { totalElements: page.totalElements, totalPages: page.totalPages, size: page.size, number: page.number }
    })
  });
}
