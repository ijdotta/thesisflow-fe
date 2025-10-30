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
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=')
    const jsonPayload = atob(padded)
    return JSON.parse(jsonPayload)
  } catch (error) {
    console.error('Failed to decode JWT payload', error)
    return null
  }
}

function isExpired(expiresAt?: string | null): boolean {
  if (!expiresAt) return false
  return new Date(expiresAt) <= new Date()
}

function clearStoredSession() {
  localStorage.removeItem('authUser')
  localStorage.removeItem('accessToken')
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = localStorage.getItem('authUser')
    if (!stored) return null
    try {
      const parsed = JSON.parse(stored) as AuthUser
      if (isExpired(parsed?.expiresAt)) {
        clearStoredSession()
        return null
      }
      return parsed
    } catch (error) {
      console.warn('Invalid stored auth session', error)
      clearStoredSession()
      return null
    }
  })
  const [isLoading, setIsLoading] = useState(false)

  const persistSession = useCallback((payload: PersistPayload) => {
    const decoded = decodeJwtPayload(payload.token)
    const derivedRole = (payload.role || decoded?.role || decoded?.authorities?.[0]) as Role | undefined
    const derivedUserId = payload.userId || decoded?.userId || decoded?.sub || decoded?.id
    const derivedProfessorId = payload.professorId || decoded?.professorId
    const expiresAt =
      payload.expiresAt || (decoded?.exp ? new Date(decoded.exp * 1000).toISOString() : null)

    const authUser: AuthUser = {
      userId: derivedUserId ?? '',
      role: (derivedRole ?? 'PROFESSOR') as Role,
      professorId: derivedProfessorId,
      token: payload.token,
      expiresAt: expiresAt ?? new Date(Date.now() + 60 * 60 * 1000).toISOString(),
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
      const response: ProfessorMagicLinkVerifyResponse = await authApi.verifyProfessorMagicLink({ token })
      persistSession({ token: response.accessToken })
      return response.redirectUrl ?? '/'
    } finally {
      setIsLoading(false)
    }
  }, [persistSession])

  const logout = useCallback(() => {
    clearStoredSession()
    setUser(null)
  }, [])

  useEffect(() => {
    if (user && isExpired(user.expiresAt)) {
      logout()
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
