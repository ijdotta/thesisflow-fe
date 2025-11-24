export type UserRole = 'ADMIN' | 'PROFESSOR'
export type Role = UserRole

export interface LoginRequest {
  username: string
  password: string
}

export interface RequestMagicLinkRequest {
  email: string
}

export interface VerifyMagicLinkRequest {
  token: string
}

export interface RequestMagicLinkResponse {
  message: string
}

export interface LoginResponse {
  token: string
  expiresAt: string
  role: UserRole
  userId: string
  professorId?: string
}

export interface ProfessorMagicLinkVerifyResponse {
  accessToken: string
  redirectUrl?: string
}

export interface AuthUser {
  userId: string
  role: UserRole
  professorId?: string
  professorPersonId?: string
  token: string
  expiresAt: string
}

export interface AuthContextType {
  user: AuthUser | null
  isLoading: boolean
  login: (username: string, password: string) => Promise<void>
  requestProfessorMagicLink: (email: string) => Promise<void>
  verifyProfessorMagicLink: (token: string) => Promise<string>
  logout: () => void
  isAuthenticated: boolean
}
