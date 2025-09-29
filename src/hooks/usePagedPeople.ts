import { useQuery } from '@tanstack/react-query';
import { getPeople, type FetchPeopleParams } from '@/api/people';
import { mapApiPersonToFriendly } from '@/mapper/apiToFriendly';
import type { GetPeopleResponse } from '@/types/ApiResponses';
import type { FriendlyPerson } from '@/types/FriendlyEntities';

interface PeopleList { people: FriendlyPerson[]; totalElements: number; totalPages: number; size: number; number: number; }

function transform(resp: GetPeopleResponse): PeopleList {
  return {
    people: (resp.content || []).map(mapApiPersonToFriendly),
    totalElements: resp.totalElements,
    totalPages: resp.totalPages,
    size: resp.size,
    number: resp.number,
  };
}

export function usePagedPeople(params: FetchPeopleParams) {
  return useQuery({
    queryKey: ['people','paged', params],
    queryFn: () => getPeople(params),
    staleTime: 60_000,
    select: transform,
  });
}

