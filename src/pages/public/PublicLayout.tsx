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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-sm text-muted-foreground">
          <p>© 2024 ThesisFlow - Acceso Público</p>
        </div>
      </footer>
    </div>
  )
}
