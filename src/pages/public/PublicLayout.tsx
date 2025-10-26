import { Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { BarChart3, Folder } from 'lucide-react'

export function PublicLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation()

  const isOnProjects = location.pathname === '/public/projects'
  const isOnAnalytics = location.pathname === '/public/analytics'

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/public" className="text-xl font-bold text-blue-600">
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
                <Link to="/public/projects">
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
                <Link to="/public/analytics">
                  <BarChart3 className="h-4 w-4" />
                  Análisis
                </Link>
              </Button>
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
