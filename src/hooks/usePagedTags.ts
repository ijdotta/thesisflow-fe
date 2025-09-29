import { useQuery } from '@tanstack/react-query';
import { getTags, type FetchListParams } from '@/api/tags';
import type { GetTagsResponse } from '@/types/ApiResponses';
import { mapApiTagToFriendly } from '@/mapper/apiToFriendly';
import type { FriendlyTag } from '@/types/FriendlyEntities';

interface TagsList { tags: FriendlyTag[]; totalElements: number; totalPages: number; size: number; number: number; }

function transform(resp: GetTagsResponse): TagsList {
  return {
    tags: (resp.content || []).map(mapApiTagToFriendly),
    totalElements: resp.totalElements,
    totalPages: resp.totalPages,
    size: resp.size,
    number: resp.number,
  };
}

export function usePagedTags(params: FetchListParams) {
  return useQuery({
    queryKey: ['tags','paged', params],
    queryFn: () => getTags(params),
    staleTime: 60_000,
    select: transform,
  });
}

