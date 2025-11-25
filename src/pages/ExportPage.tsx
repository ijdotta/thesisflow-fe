import { useState } from 'react'
import { Download, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import AdminLayout from '@/layouts/AdminLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { exportProjects } from '@/api/export'

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  URL.revokeObjectURL(url)
}

export function ExportPage() {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const { blob, filename } = await exportProjects()
      downloadBlob(blob, filename)
      toast.success(`Exportación creada: ${filename}`)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo exportar los proyectos.'
      toast.error(message)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Exportar Proyectos</h1>
          <p className="text-sm text-muted-foreground">
            Descarga todos los proyectos en formato CSV para análisis y reportes.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5 text-blue-600" />
              Exportar a CSV
            </CardTitle>
            <CardDescription>
              Genera un archivo CSV con todos los proyectos. Incluye títulos, fechas, carreras, dominios, etiquetas, participantes (por rol) y recursos.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <p className="mb-3">El archivo contiene las siguientes columnas:</p>
              <ul className="list-inside list-disc space-y-1 text-xs">
                <li><strong>publicId:</strong> Identificador único del proyecto</li>
                <li><strong>title:</strong> Título del proyecto</li>
                <li><strong>type:</strong> Tipo (THESIS o FINAL_PROJECT)</li>
                <li><strong>subTypes:</strong> Subtipos (separados por ;)</li>
                <li><strong>initialSubmission:</strong> Fecha de presentación inicial</li>
                <li><strong>completion:</strong> Fecha de finalización</li>
                <li><strong>career:</strong> Carrera asociada</li>
                <li><strong>applicationDomain:</strong> Dominio de aplicación</li>
                <li><strong>tags:</strong> Etiquetas (separadas por ;)</li>
                <li><strong>directors:</strong> Directores (nombres separados por ;)</li>
                <li><strong>coDirectors:</strong> Co-directores (nombres separados por ;)</li>
                <li><strong>collaborators:</strong> Colaboradores (nombres separados por ;)</li>
                <li><strong>students:</strong> Estudiantes (nombres separados por ;)</li>
                <li><strong>resources:</strong> Recursos en formato JSON</li>
              </ul>
            </div>
            <Button onClick={handleExport} disabled={isExporting} size="lg" className="w-full">
              {isExporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Exportando…
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Descargar CSV
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
