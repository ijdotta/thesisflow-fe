import axios, {type InternalAxiosRequestConfig} from 'axios'
import { toast } from 'sonner'

export const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL })

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('accessToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Simple in-memory dedupe to avoid flooding with identical error toasts
const recentErrors: { msg: string; ts: number }[] = []
function shouldToast(message: string): boolean {
  const now = Date.now()
  // keep last 10
  while (recentErrors.length > 10) recentErrors.shift()
  const existing = recentErrors.find(r => r.msg === message && (now - r.ts) < 4000)
  if (existing) return false
  recentErrors.push({ msg: message, ts: now })
  return true
}

function extractErrorMessage(err: any): string {
  const status = err?.response?.status
  const path = err?.config?.url || ''
  const backendMsg = err?.response?.data?.message || err?.response?.data?.error || err?.message
  if (status) return `[${status}] ${backendMsg || 'Error de la API'}${path ? ` (${path})` : ''}`
  return backendMsg || 'Error de red'
}

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status
    if (status === 401) {
      localStorage.removeItem('accessToken')
    }
    const message = extractErrorMessage(err)
    if (shouldToast(message)) {
      toast.error(message, { duration: 5000 })
    }
    return Promise.reject(err)
  }
)
