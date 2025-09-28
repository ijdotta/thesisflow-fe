import { useQuery } from '@tanstack/react-query'
import { searchPeople } from '@/api/people'
import { mapApiPersonToFriendly } from '@/mapper/apiToFriendly'
import type { FriendlyPerson } from '@/types/FriendlyEntities'
import type { GetPeopleResponse } from '@/types/ApiResponses'

export interface PeopleResponse { items: FriendlyPerson[]; page: Omit<GetPeopleResponse,'content'> }

export function useSearchPeople(query: string) {
  return useQuery({
    queryKey: ['search','people', query],
    queryFn: () => searchPeople(query),
    enabled: !!query && query.trim().length > 0,
    staleTime: 60_000,
    select: (page): PeopleResponse => ({
      items: page.content.map(mapApiPersonToFriendly),
      page: { totalElements: page.totalElements, totalPages: page.totalPages, size: page.size, number: page.number }
    })
  });
}
