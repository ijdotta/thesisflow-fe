import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3, Folder } from 'lucide-react'

export function PublicHomePage() {
  return (
    <div className="space-y-12">
      {/* Hero */}
      <section className="text-center space-y-4 py-12">
        <h1 className="text-4xl font-bold">ThesisFlow</h1>
        <p className="text-xl text-muted-foreground">Exploración de Proyectos Académicos</p>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Descubre tesis y proyectos finales, explora colaboraciones entre profesores y visualiza tendencias en investigación.
        </p>
      </section>

      {/* Features */}
      <div className="grid md:grid-cols-2 gap-6 items-stretch">
        <Card className="hover:shadow-lg transition-shadow h-full">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Folder className="h-8 w-8 text-blue-600" />
              <CardTitle>Explorar Proyectos</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 flex-1">
            <p className="text-muted-foreground">
              Navega por una biblioteca completa de proyectos académicos. Busca por título, etiquetas o dominio de aplicación.
            </p>
            <p className="text-sm text-muted-foreground">
              Filtra por carrera, profesor o rango de años para encontrar exactamente lo que buscas.
            </p>
            <Button asChild className="w-full mt-auto">
              <Link to="/projects">Ver Proyectos</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow h-full">
          <CardHeader>
            <div className="flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-emerald-600" />
              <CardTitle>Análisis y Estadísticas</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 flex-1">
            <p className="text-muted-foreground">
              Visualiza tendencias en investigación académica a través de gráficos interactivos.
            </p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Línea de tiempo de tesis por profesor</li>
              <li>• Popularidad de temas a lo largo del tiempo</li>
              <li>• Red de colaboración entre profesores</li>
              <li>• Estadísticas por carrera y año</li>
            </ul>
            <Button asChild className="w-full mt-auto" variant="default">
              <Link to="/analytics">Ver Análisis</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Stats */}
      <section className="bg-blue-50 rounded-lg p-8 border border-blue-100">
        <h2 className="text-2xl font-bold mb-6 text-center">Estadísticas Generales</h2>
        <div className="grid md:grid-cols-3 gap-6 text-center">
          <div>
            <div className="text-3xl font-bold text-blue-600">—</div>
            <p className="text-muted-foreground">Proyectos Totales</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-blue-600">—</div>
            <p className="text-muted-foreground">Profesores Involucrados</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-blue-600">—</div>
            <p className="text-muted-foreground">Años de Datos</p>
          </div>
        </div>
      </section>
    </div>
  )
}
