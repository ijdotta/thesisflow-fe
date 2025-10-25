import { api } from './axios'
import type { LoginRequest, LoginResponse } from '@/types/Auth'

export const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/login', credentials)
    return response.data
  },
}
