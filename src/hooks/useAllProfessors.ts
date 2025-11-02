import { useQuery } from '@tanstack/react-query'
import { getProfessors } from '@/api/professors'
import { mapApiPersonToFriendly } from '@/mapper/apiToFriendly'
import type { FriendlyPerson } from '@/types/FriendlyEntities'

export interface AllProfessorsResponse { items: FriendlyPerson[] }

export function useAllProfessors() {
  return useQuery({
    queryKey: ['all-professors'],
    queryFn: async (): Promise<AllProfessorsResponse> => {
      const response = await getProfessors({
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
