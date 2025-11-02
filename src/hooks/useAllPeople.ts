import { useQuery } from '@tanstack/react-query'
import { getPeople } from '@/api/people'
import { mapApiPersonToFriendly } from '@/mapper/apiToFriendly'
import type { FriendlyPerson } from '@/types/FriendlyEntities'

export interface AllPeopleResponse { items: FriendlyPerson[] }

export function useAllPeople() {
  return useQuery({
    queryKey: ['all-people'],
    queryFn: async (): Promise<AllPeopleResponse> => {
      const response = await getPeople({
        page: 0,
        size: 1000,
        sort: { field: 'lastname', dir: 'asc' }
      });
      return {
        items: response.content.map(p => mapApiPersonToFriendly(p))
      };
    },
    staleTime: 5 * 60_000,
  });
}
