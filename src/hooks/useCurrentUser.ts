import { useQuery } from '@tanstack/react-query'
import { authApi } from '@/api/auth'

export function useCurrentUser() {
  return useQuery({
    queryKey: ['current-user'],
    queryFn: () => authApi.getCurrentUser(),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })
}
