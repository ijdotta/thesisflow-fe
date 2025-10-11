import { useQuery } from '@tanstack/react-query';
import { searchTags } from '@/api/tags';
import { mapApiTagToFriendly } from '@/mapper/apiToFriendly';
import type { FriendlyTag } from '@/types/FriendlyEntities';

export function useSearchTags(query: string) {
  return useQuery({
    queryKey: ['search','tags', query],
    queryFn: () => searchTags(query),
    enabled: !!query && query.trim().length > 0,
    staleTime: 60_000,
    select: (items): FriendlyTag[] => items.map(mapApiTagToFriendly),
  });
}

