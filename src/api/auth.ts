import { api } from './axios'
import type {
  LoginRequest,
  LoginResponse,
  RequestMagicLinkRequest,
  RequestMagicLinkResponse,
  VerifyMagicLinkRequest,
  ProfessorMagicLinkVerifyResponse,
} from '@/types/Auth'

export const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/login', credentials)
    return response.data
  },
  requestProfessorMagicLink: async (
    payload: RequestMagicLinkRequest
  ): Promise<RequestMagicLinkResponse> => {
    const response = await api.post<RequestMagicLinkResponse>(
      '/auth/professor/request-login-link',
      payload
    )
    return response.data
  },
  verifyProfessorMagicLink: async (
    payload: VerifyMagicLinkRequest
  ): Promise<ProfessorMagicLinkVerifyResponse> => {
    const response = await api.post<ProfessorMagicLinkVerifyResponse>(
      '/auth/professor/verify-login-link',
      payload
    )
    return response.data
  },
}
