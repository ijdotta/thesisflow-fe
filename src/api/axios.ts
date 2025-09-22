import axios, {type InternalAxiosRequestConfig} from 'axios'

export const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL })

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('accessToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status
    if (status === 401) {
      localStorage.removeItem('accessToken')
    }
    return Promise.reject(err)
  }
)
