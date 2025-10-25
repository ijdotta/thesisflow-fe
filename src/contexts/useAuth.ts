import { useContext } from 'react'
import type { AuthContextType } from '@/types/Auth'
import { AuthContext } from './AuthContextDefinition'

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
