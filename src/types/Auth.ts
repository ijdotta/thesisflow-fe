export type UserRole = 'ADMIN' | 'PROFESSOR'
export type Role = UserRole

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
  expiresAt: string
  role: UserRole
  userId: string
  professorId?: string
}

export interface AuthUser {
  userId: string
  role: UserRole
  professorId?: string
  token: string
  expiresAt: string
}

export interface AuthContextType {
  user: AuthUser | null
  isLoading: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}
