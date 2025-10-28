import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Loader2, ShieldCheck, AlertTriangle } from 'lucide-react'
import { useAuth } from '@/contexts/useAuth'
import { ROUTES } from '@/constants/routes'
import type { AxiosError } from 'axios'

type Status = 'idle' | 'loading' | 'success' | 'error'

export function ProfessorLoginVerifyPage() {
  const { verifyProfessorMagicLink, user } = useAuth()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState<Status>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      navigate('/admin/projects', { replace: true })
    }
  }, [user, navigate])

  useEffect(() => {
    const token = searchParams.get('token')
    if (!token) {
      setStatus('error')
      setErrorMessage('El enlace es inválido o está incompleto.')
      return
    }

    let isMounted = true
    setStatus('loading')

    verifyProfessorMagicLink(token)
      .then(() => {
        if (!isMounted) return
        setStatus('success')
        setTimeout(() => {
          navigate('/admin/projects', { replace: true })
        }, 1000)
      })
      .catch((err: unknown) => {
        if (!isMounted) return
        setStatus('error')
        const axiosError = err as AxiosError<{ message?: string }>
        const message =
          axiosError?.response?.data?.message || 'El enlace ya fue usado o expiró. Solicita uno nuevo.'
        setErrorMessage(message)
      })

    return () => {
      isMounted = false
    }
  }, [verifyProfessorMagicLink, searchParams, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white border border-slate-100 shadow-lg rounded-2xl p-10 text-center space-y-6">
          {status === 'loading' && (
            <>
              <Loader2 className="h-10 w-10 text-blue-600 mx-auto animate-spin" />
              <div>
                <h1 className="text-xl font-semibold text-slate-900">
                  Verificando el enlace de acceso…
                </h1>
                <p className="text-sm text-slate-600 mt-2">
                  Esto puede tardar unos segundos. No cierres esta ventana.
                </p>
              </div>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                <ShieldCheck className="h-7 w-7 text-green-600" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-slate-900">
                  Acceso confirmado
                </h1>
                <p className="text-sm text-slate-600 mt-2">
                  Te estamos redirigiendo a tus proyectos…
                </p>
              </div>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto">
                <AlertTriangle className="h-7 w-7 text-red-600" />
              </div>
              <div className="space-y-3">
                <h1 className="text-xl font-semibold text-slate-900">
                  No pudimos validar tu enlace
                </h1>
                <p className="text-sm text-slate-600">
                  {errorMessage || 'El enlace es inválido o ha expirado. Solicita uno nuevo para continuar.'}
                </p>
                <div className="flex flex-col gap-2">
                  <Link
                    to={ROUTES.professorLogin}
                    className="inline-flex justify-center items-center rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 px-4"
                  >
                    Solicitar un nuevo enlace
                  </Link>
                  <Link
                    to={ROUTES.login}
                    className="text-sm text-slate-600 hover:text-slate-700"
                  >
                    ¿Eres administrador? Volver al login clásico
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
