import React, { useState, useCallback, useEffect } from 'react'
import type {
  AuthContextType,
  AuthUser,
  LoginResponse,
  ProfessorMagicLinkVerifyResponse,
  Role,
} from '@/types/Auth'
import { authApi } from '@/api/auth'
import { AuthContext } from './AuthContextDefinition'

interface PersistPayload {
  token: string
  expiresAt?: string
  role?: Role
  userId?: string
  professorId?: string
}

function decodeJwtPayload(token: string): Record<string, any> | null {
  try {
    const base64Url = token.split('.')[1]
    if (!base64Url) return null
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=')
    const jsonPayload = atob(padded)
    return JSON.parse(jsonPayload)
  } catch (error) {
    console.error('Failed to decode JWT payload', error)
    return null
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = localStorage.getItem('authUser')
    return stored ? JSON.parse(stored) : null
  })
  const [isLoading, setIsLoading] = useState(false)

  const persistSession = useCallback((payload: PersistPayload) => {
    const decoded = decodeJwtPayload(payload.token)
    const expiresAtFromToken = decoded?.exp
      ? new Date(decoded.exp * 1000).toISOString()
      : undefined

    const derivedRole = (payload.role || decoded?.role || decoded?.authorities?.[0]) as Role | undefined
    const derivedUserId = payload.userId || decoded?.userId || decoded?.sub || decoded?.id
    const derivedProfessorId = payload.professorId || decoded?.professorId
    const expiresAt = payload.expiresAt || expiresAtFromToken || new Date(Date.now() + 60 * 60 * 1000).toISOString()

    if (!derivedRole || !derivedUserId) {
      console.warn('Missing role or user identifier when persisting session')
    }

    const authUser: AuthUser = {
      userId: derivedUserId ?? '',
      role: (derivedRole ?? 'PROFESSOR') as Role,
      professorId: derivedProfessorId,
      token: payload.token,
      expiresAt,
    }

    localStorage.setItem('accessToken', payload.token)
    localStorage.setItem('authUser', JSON.stringify(authUser))
    setUser(authUser)
  }, [])

  const login = useCallback(async (username: string, password: string) => {
    setIsLoading(true)
    try {
      const response = await authApi.login({ username, password })
      persistSession({
        token: response.token,
        expiresAt: response.expiresAt,
        role: response.role,
        userId: response.userId,
        professorId: response.professorId,
      })
    } finally {
      setIsLoading(false)
    }
  }, [persistSession])

  const requestProfessorMagicLink = useCallback(async (email: string) => {
    setIsLoading(true)
    try {
      await authApi.requestProfessorMagicLink({ email })
    } finally {
      setIsLoading(false)
    }
  }, [])

  const verifyProfessorMagicLink = useCallback(async (token: string) => {
    setIsLoading(true)
    try {
      const response = await authApi.verifyProfessorMagicLink({ token })
      persistSession({ token: response.accessToken })
      return response.redirectUrl ?? '/'
    } finally {
      setIsLoading(false)
    }
  }, [persistSession])

  const logout = useCallback(() => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('authUser')
    setUser(null)
  }, [])

  // Check if token has expired
  useEffect(() => {
    if (user) {
      const expiresAt = new Date(user.expiresAt)
      const now = new Date()
      if (now >= expiresAt) {
        logout()
      }
    }
  }, [user, logout])

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    requestProfessorMagicLink,
    verifyProfessorMagicLink,
    logout,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
