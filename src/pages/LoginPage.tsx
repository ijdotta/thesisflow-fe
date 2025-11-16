import { useState } from 'react'
import { useAuth } from '@/contexts/useAuth'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { ROUTES } from '@/constants/routes'
import { Lock, User } from 'lucide-react'
import type { AxiosError } from 'axios'

export function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const { login, isLoading } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setError(null)
      await login(username, password)
      navigate(ROUTES.projects)
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message?: string }>
      const message = axiosError?.response?.data?.message || 'Login failed'
      setError(message)
      toast.error(message)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-3">
          <div className="mx-auto w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center">
            <User className="h-7 w-7 text-blue-600" />
          </div>
          <h1 className="text-3xl font-semibold text-slate-900">Acceso de Administrador</h1>
          <p className="text-sm text-slate-600">
            Ingresa tus credenciales para gestionar el sistema.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-lg rounded-xl border border-slate-100 p-8 space-y-6"
        >
          <div className="space-y-2">
            <label htmlFor="username" className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <User className="h-4 w-4 text-blue-600" />
              Usuario
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value)
                if (error) setError(null)
              }}
              disabled={isLoading}
              placeholder="admin"
              className="w-full px-4 py-3 border border-slate-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:bg-slate-100"
              required
            />
            {error && <p className="text-xs text-red-600">{error}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <Lock className="h-4 w-4 text-blue-600" />
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (error) setError(null)
              }}
              disabled={isLoading}
              placeholder="••••••••"
              className="w-full px-4 py-3 border border-slate-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:bg-slate-100"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !username || !password}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-semibold py-3 rounded-lg transition duration-200"
          >
            {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="text-center text-sm text-slate-600 space-y-2">
          <Link to={ROUTES.professorLogin} className="text-blue-600 hover:text-blue-700 font-medium">
            ¿Eres profesor? Solicita acceso con enlace mágico
          </Link>
          <div>
            <span>¿Necesitas ayuda? </span>
            <a href="mailto:soporte@thesisflow.edu" className="underline">
              Contacta soporte
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
