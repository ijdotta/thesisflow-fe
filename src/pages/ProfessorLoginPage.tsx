import { useEffect, useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Sparkles } from 'lucide-react'
import { useAuth } from '@/contexts/useAuth'
import { ROUTES } from '@/constants/routes'
import type { AxiosError } from 'axios'

const EMAIL_REGEX =
  /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i

export function ProfessorLoginPage() {
  const { requestProfessorMagicLink, isLoading, user } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [countdown, setCountdown] = useState(0)

  useEffect(() => {
    if (user) {
      navigate('/admin/projects', { replace: true })
    }
  }, [user, navigate])

  useEffect(() => {
    if (countdown <= 0) return
    const timer = window.setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => window.clearInterval(timer)
  }, [countdown])

  const validateEmail = useCallback((value: string) => EMAIL_REGEX.test(value), [])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!validateEmail(email)) {
      setError('Ingresa un correo válido.')
      return
    }
    try {
      setError(null)
      await requestProfessorMagicLink(email)
      setSuccess(true)
      setCountdown(60)
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>
      const message = axiosError?.response?.data?.message || 'No se pudo enviar el enlace. Intenta nuevamente.'
      setError(message)
    }
  }

  const handleResend = async () => {
    if (countdown > 0 || !validateEmail(email)) return
    try {
      setError(null)
      await requestProfessorMagicLink(email)
      setSuccess(true)
      setCountdown(60)
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>
      const message = axiosError?.response?.data?.message || 'No se pudo reenviar el enlace. Intenta nuevamente.'
      setError(message)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-3">
          <div className="mx-auto w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center">
            <Sparkles className="h-7 w-7 text-blue-600" />
          </div>
          <h1 className="text-3xl font-semibold text-slate-900">Acceso para Profesores</h1>
          <p className="text-sm text-slate-600">
            Recibe un enlace mágico para gestionar tus proyectos sin contraseña.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-lg rounded-xl border border-slate-100 p-8 space-y-6"
        >
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <Mail className="h-4 w-4 text-blue-600" />
              Correo institucional
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value)
                if (error) setError(null)
              }}
              placeholder="profesor@universidad.edu"
              className="w-full px-4 py-3 border border-slate-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:bg-slate-100"
              autoComplete="email"
              disabled={isLoading}
              required
            />
            {error && <p className="text-xs text-red-600">{error}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading || !email || !validateEmail(email)}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-semibold py-3 rounded-lg transition duration-200"
          >
            {isLoading ? 'Enviando enlace…' : 'Enviar enlace mágico'}
          </button>

          {success && (
            <div className="rounded-md bg-blue-50 border border-blue-100 p-4 text-sm text-blue-700 space-y-2">
              <p className="font-medium">Revisa tu correo</p>
              <p>
                Te enviamos un enlace para iniciar sesión. El enlace expira en 15 minutos. Si no lo
                encuentras, revisa tu carpeta de spam.
              </p>
              <div className="flex items-center justify-between text-xs">
                <span>¿No llegó el correo?</span>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={countdown > 0 || isLoading}
                  className="text-blue-600 hover:text-blue-700 disabled:text-slate-400 font-semibold"
                >
                  {countdown > 0 ? `Reintentar en ${countdown}s` : 'Reenviar enlace'}
                </button>
              </div>
            </div>
          )}
        </form>

        <div className="text-center text-sm text-slate-600 space-y-2">
          <Link to={ROUTES.login} className="text-blue-600 hover:text-blue-700 font-medium">
            Volver al acceso de administradores
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
