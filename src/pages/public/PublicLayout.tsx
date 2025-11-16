import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { BarChart3, Folder, LogIn, LogOut, UserCircle2 } from 'lucide-react'
import { useAuth } from '@/contexts/useAuth'
import { ROUTES } from '@/constants/routes'

export function PublicLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout, user } = useAuth()

  const isOnProjects = location.pathname === '/projects'
  const isOnAnalytics = location.pathname === '/analytics'

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const dashboardPath = user?.role === 'PROFESSOR' ? ROUTES.professorProjects : ROUTES.projects

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="text-xl font-bold text-blue-600">
              ThesisFlow
            </Link>

            {/* Navigation */}
            <nav className="flex items-center gap-2">
              <Button
                variant={isOnProjects ? 'default' : 'ghost'}
                size="sm"
                asChild
                className="flex items-center gap-2"
              >
                <Link to="/projects">
                  <Folder className="h-4 w-4" />
                  Proyectos
                </Link>
              </Button>

              <Button
                variant={isOnAnalytics ? 'default' : 'ghost'}
                size="sm"
                asChild
                className="flex items-center gap-2"
              >
                <Link to="/analytics">
                  <BarChart3 className="h-4 w-4" />
                  Análisis
                </Link>
              </Button>

              <div className="ml-4 border-l border-slate-200 pl-4">
                {!user ? (
                  <Button
                    onClick={() => navigate('/login')}
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <LogIn className="h-4 w-4" />
                    Iniciar Sesión
                  </Button>
                ) : (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                      onClick={() => navigate(dashboardPath)}
                    >
                      <UserCircle2 className="h-4 w-4" />
                      {user.role === 'PROFESSOR' ? 'Ver mis proyectos' : 'Panel administrador'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-2"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-4 w-4" />
                      Cerrar sesión
                    </Button>
                  </div>
                )}
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid md:grid-cols-3 gap-8 mb-6">
            {/* Logo */}
            <div className="flex flex-col items-center justify-center md:items-start">
              <a href="https://cs.uns.edu.ar" target="_blank" rel="noopener noreferrer">
                <img src="/dcic-logo.png" alt="DCIC-UNS Logo" className="h-12 mb-2" />
              </a>
            </div>

            {/* Credits */}
            <div className="flex flex-col items-center justify-center">
              <p className="text-sm font-medium mb-1">Desarrollado por:</p>
              <p className="text-sm text-muted-foreground">Ignacio Dotta</p>
              <a 
                href="mailto:ij.dotta@gmail.com"
                className="text-blue-600 hover:underline text-sm"
              >
                ij.dotta@gmail.com
              </a>
            </div>

            {/* Social Links */}
            <div className="flex flex-col items-center justify-center md:items-end gap-2">
              <p className="text-sm font-medium text-muted-foreground">Sígueme:</p>
              <div className="flex gap-3">
                <a 
                  href="https://linkedin.com/in/ijdotta"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm flex items-center gap-1"
                  title="LinkedIn"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.475-2.236-1.668-2.236-1.086 0-1.698.734-1.976 1.441-.102.248-.127.594-.127.94v5.424h-3.554s.05-8.806 0-9.714h3.554v1.377c.43-.664 1.199-1.609 2.922-1.609 2.135 0 3.731 1.395 3.731 4.398v5.548zM5.337 8.855a2.064 2.064 0 1 1 0-4.13 2.063 2.063 0 0 1 0 4.13zm1.782 11.597H3.555V9.738h3.564v10.714zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
                  </svg>
                  LinkedIn
                </a>
                <a 
                  href="https://github.com/ijdotta"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm flex items-center gap-1"
                  title="GitHub"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v 3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                  GitHub
                </a>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-slate-200 pt-6 text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} ThesisFlow - Acceso Público</p>
            <p className="text-xs mt-2">Trabajo Final de Carrera - DCIC, Universidad Nacional del Sur</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
