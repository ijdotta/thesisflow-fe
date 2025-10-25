import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import type { AxiosError } from 'axios'

interface ApiErrorResponse {
  message?: string
  error?: string
  details?: string
}

export function useErrorHandler() {
  const navigate = useNavigate()

  const handleError = useCallback((error: unknown) => {
    const axiosError = error as AxiosError<ApiErrorResponse>
    const status = axiosError?.response?.status
    const data = axiosError?.response?.data
    const message = data?.message || data?.error || axiosError?.message || 'An error occurred'

    switch (status) {
      case 400:
        toast.error(`Bad Request: ${message}`)
        break

      case 401:
        toast.error('Session expired. Please log in again.')
        navigate('/login')
        break

      case 403:
        toast.error(`Access Denied: ${message}`)
        navigate('/forbidden')
        break

      case 404:
        toast.error('Resource not found.')
        navigate('/not-found')
        break

      case 409:
        toast.error(`Conflict: ${message}`)
        break

      case 422:
        toast.error(`Validation Error: ${message}`)
        break

      case 429:
        toast.error('Too many requests. Please try again later.')
        break

      case 500:
        toast.error('Server error. Please try again later.')
        navigate('/server-error')
        break

      case 503:
        toast.error('Service unavailable. Please try again later.')
        break

      default:
        toast.error(message)
    }
  }, [navigate])

  return { handleError }
}
