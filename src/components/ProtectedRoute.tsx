import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/useAuth'
import type { Role } from '@/types/Auth'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: Role[]
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role as Role)) {
    return <Navigate to="/forbidden" replace />
  }

  return <>{children}</>
}
