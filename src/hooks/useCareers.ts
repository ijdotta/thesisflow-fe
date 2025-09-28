import { useQuery } from '@tanstack/react-query'
import { getCareers } from '@/api/careers'

export function useCareers() {
  return useQuery({
    queryKey: ['careers'],
    queryFn: getCareers,
    staleTime: 5 * 60_000,
  });
}

