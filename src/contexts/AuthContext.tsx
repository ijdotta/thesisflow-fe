import React, { useState, useCallback, useEffect } from 'react'
import type { AuthContextType, AuthUser, LoginResponse } from '@/types/Auth'
import { authApi } from '@/api/auth'
import { AuthContext } from './AuthContextDefinition'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = localStorage.getItem('authUser')
    return stored ? JSON.parse(stored) : null
  })
  const [isLoading, setIsLoading] = useState(false)

  const persistSession = useCallback((response: LoginResponse) => {
    const authUser: AuthUser = {
      userId: response.userId,
      role: response.role,
      professorId: response.professorId,
      token: response.token,
      expiresAt: response.expiresAt,
    }
    localStorage.setItem('accessToken', response.token)
    localStorage.setItem('authUser', JSON.stringify(authUser))
    setUser(authUser)
  }, [])

  const login = useCallback(async (username: string, password: string) => {
    setIsLoading(true)
    try {
      const response = await authApi.login({ username, password })
      persistSession(response)
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
      persistSession(response)
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
