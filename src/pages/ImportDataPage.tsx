import { useState } from 'react'
import { Upload, Trash2, AlertCircle, CheckCircle, SkipForward } from 'lucide-react'
import AdminLayout from '@/layouts/AdminLayout'
import { toast } from 'sonner'
import type { ParseCsvResponse, ImportResult } from '@/api/import'
import { parseCsv } from '@/api/import'

interface ProjectRowData {
  result: ImportResult
}

export function ImportDataPage() {
  const [file, setFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [parseResult, setParseResult] = useState<ParseCsvResponse | null>(null)
  const [rows, setRows] = useState<ProjectRowData[]>([])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    if (!selectedFile.name.endsWith('.csv')) {
      toast.error('Por favor selecciona un archivo CSV válido')
      return
    }

    if (selectedFile.size > 50 * 1024 * 1024) {
      toast.error('El archivo debe ser menor a 50MB')
      return
    }

    setFile(selectedFile)
  }

  const handleParse = async () => {
    if (!file) {
      toast.error('Por favor selecciona un archivo primero')
      return
    }

    try {
      setIsLoading(true)
      const response = await parseCsv(file)
      setParseResult(response)
      setRows(response.results.map((result) => ({ result })))
      
      const message = `Se procesaron ${response.summary.success} proyectos exitosamente`
      if (response.summary.skipped > 0) {
        toast.success(`${message}, ${response.summary.skipped} omitidos`)
      } else {
        toast.success(message)
      }
    } catch {
      setParseResult(null)
      setRows([])
      toast.error('El procesamiento falló. Por favor intenta de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteRow = (lineNumber: number) => {
    const filtered = rows.filter((r) => r.result.lineNumber !== lineNumber)
    setRows(filtered)
    
    if (parseResult) {
      const result = parseResult.results.find((r) => r.lineNumber === lineNumber)
      if (result) {
        const newSummary = { ...parseResult.summary }
        if (result.status === 'SUCCESS') newSummary.success -= 1
        else if (result.status === 'SKIPPED') newSummary.skipped -= 1
        else if (result.status === 'FAILED') newSummary.failed -= 1
        newSummary.total -= 1
        
        setParseResult({
          ...parseResult,
          summary: newSummary,
          results: parseResult.results.filter((r) => r.lineNumber !== lineNumber),
        })
      }
    }
    toast.success('Proyecto eliminado')
  }

  const handleRemoveAllErrors = () => {
    const filtered = rows.filter((r) => r.result.status !== 'FAILED')
    setRows(filtered)
    
    if (parseResult) {
      const failedCount = parseResult.summary.failed
      setParseResult({
        ...parseResult,
        summary: {
          ...parseResult.summary,
          total: parseResult.summary.total - failedCount,
          failed: 0,
        },
        results: parseResult.results.filter((r) => r.status !== 'FAILED'),
      })
    }
    toast.success('Se eliminaron todos los proyectos fallidos')
  }

  const handleRemoveAll = () => {
    setParseResult(null)
    setRows([])
    setFile(null)
    toast.success('Se limpió todo')
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'SKIPPED':
        return <SkipForward className="h-5 w-5 text-yellow-600" />
      default:
        return <AlertCircle className="h-5 w-5 text-red-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return 'bg-green-50 border-green-200'
      case 'SKIPPED':
        return 'bg-yellow-50 border-yellow-200'
      default:
        return 'bg-red-50 border-red-200'
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return 'bg-green-100 text-green-800'
      case 'SKIPPED':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-red-100 text-red-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return 'Exitoso'
      case 'SKIPPED':
        return 'Omitido'
      default:
        return 'Fallido'
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Importar Proyectos</h1>
          <p className="text-gray-600 mt-2">Sube un archivo CSV y revisa los proyectos antes de aplicar</p>
        </div>

        {/* Upload Area */}
        {!parseResult ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <label className="block">
              <div className="flex items-center justify-center w-full px-6 py-12 border-2 border-dashed border-blue-300 rounded-lg bg-blue-50 cursor-pointer hover:bg-blue-100 transition">
                <div className="text-center">
                  {file ? (
                    <>
                      <Upload className="h-12 w-12 text-blue-600 mx-auto mb-2" />
                      <p className="font-medium text-gray-900">{file.name}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {(file.size / 1024).toFixed(2)} KB
                      </p>
                    </>
                  ) : (
                    <>
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="font-medium text-gray-900">
                        Haz clic para cargar o arrastra y suelta
                      </p>
                      <p className="text-sm text-gray-600 mt-1">Archivo CSV (máx 50MB)</p>
                    </>
                  )}
                </div>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  disabled={isLoading}
                  className="hidden"
                />
              </div>
            </label>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleParse}
                disabled={!file || isLoading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-medium py-3 px-4 rounded-lg transition"
              >
                {isLoading ? 'Procesando...' : 'Procesar CSV'}
              </button>
              {file && (
                <button
                  onClick={() => setFile(null)}
                  disabled={isLoading}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium py-3 px-6 rounded-lg transition"
                >
                  Limpiar
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Summary */}
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${Object.values(parseResult.summary).filter((v) => v > 0 || Object.values(parseResult.summary).indexOf(v) === 0).length}, 1fr)` }}>
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-600 font-medium">Total</p>
                <p className="text-2xl font-bold text-blue-900">{parseResult.summary.total}</p>
              </div>
              {parseResult.summary.success > 0 && (
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-green-600 font-medium">Exitosos</p>
                  <p className="text-2xl font-bold text-green-900">{parseResult.summary.success}</p>
                </div>
              )}
              {parseResult.summary.skipped > 0 && (
                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-sm text-yellow-600 font-medium">Omitidos</p>
                  <p className="text-2xl font-bold text-yellow-900">{parseResult.summary.skipped}</p>
                </div>
              )}
              {parseResult.summary.failed > 0 && (
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-sm text-red-600 font-medium">Fallidos</p>
                  <p className="text-2xl font-bold text-red-900">{parseResult.summary.failed}</p>
                </div>
              )}
            </div>

            {/* Results Cards */}
            <div className="space-y-4">
              {rows.map((row) => (
                <div key={row.result.lineNumber} className={`p-6 rounded-lg border ${getStatusColor(row.result.status)}`}>
                  <div className="flex items-start gap-4">
                    {/* Status Icon */}
                    <div className="flex-shrink-0 pt-1">{getStatusIcon(row.result.status)}</div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">{row.result.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusBadge(row.result.status)}`}>
                          {getStatusText(row.result.status)} - Línea {row.result.lineNumber}
                        </span>
                      </div>

                      {/* Message */}
                      <p className="text-sm text-gray-600 mb-3">{row.result.message}</p>

                      {/* Project Details */}
                      {row.result.project && (
                        <div className="bg-white bg-opacity-50 rounded p-3 space-y-2 text-sm">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="font-medium text-gray-700">Tipo</p>
                              <p className="text-gray-600">{row.result.project.type}</p>
                            </div>
                            <div>
                              <p className="font-medium text-gray-700">Carrera</p>
                              <p className="text-gray-600">{row.result.project.career.name}</p>
                            </div>
                            {row.result.project.applicationDomainDTO && (
                              <div>
                                <p className="font-medium text-gray-700">Dominio</p>
                                <p className="text-gray-600">{row.result.project.applicationDomainDTO.name}</p>
                              </div>
                            )}
                            {row.result.project.tags.length > 0 && (
                              <div>
                                <p className="font-medium text-gray-700">Etiquetas</p>
                                <p className="text-gray-600 truncate">{row.result.project.tags.map((t) => t.name).join(', ')}</p>
                              </div>
                            )}
                          </div>

                          {/* Participants */}
                          {row.result.project.participants.length > 0 && (
                            <div>
                              <p className="font-medium text-gray-700 mb-2">Participantes</p>
                              <div className="space-y-1">
                                {row.result.project.participants.map((p, idx) => (
                                  <p key={idx} className="text-gray-600">
                                    <span className="font-medium">{p.role}:</span> {p.personDTO.name} {p.personDTO.lastname}
                                  </p>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={() => handleDeleteRow(row.result.lineNumber)}
                      className="flex-shrink-0 px-3 py-2 bg-red-100 hover:bg-red-200 text-red-600 text-sm rounded transition"
                      title="Eliminar proyecto"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleRemoveAll}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium py-3 px-4 rounded-lg transition"
              >
                Limpiar Todo
              </button>
              {parseResult.summary.failed > 0 && (
                <button
                  onClick={handleRemoveAllErrors}
                  className="flex-1 bg-red-100 hover:bg-red-200 text-red-600 font-medium py-3 px-4 rounded-lg transition"
                >
                  Eliminar Fallidos ({parseResult.summary.failed})
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  )
}
