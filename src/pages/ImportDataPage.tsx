import { useState } from 'react'
import { Upload, Trash2, AlertCircle, CheckCircle, SkipForward } from 'lucide-react'
import AdminLayout from '@/layouts/AdminLayout'
import { toast } from 'sonner'
import type { ParseCsvResponse, ImportResult } from '@/api/import'
import { parseCsv } from '@/api/import'
import { cn } from '@/lib/utils'

interface ProjectRowData {
  result: ImportResult
}

type StatusFilter = 'ALL' | 'SUCCESS' | 'SKIPPED' | 'FAILED'

export function ImportDataPage() {
  const [file, setFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [parseResult, setParseResult] = useState<ParseCsvResponse | null>(null)
  const [rows, setRows] = useState<ProjectRowData[]>([])
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL')

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
      setStatusFilter('ALL')
      
      const message = `Se procesaron ${response.summary.success} proyectos exitosamente`
      if (response.summary.skipped > 0) {
        toast.success(`${message}, ${response.summary.skipped} omitidos`)
      } else {
        toast.success(message)
      }
    } catch {
      setParseResult(null)
      setRows([])
      setStatusFilter('ALL')
      toast.error('El procesamiento falló. Por favor intenta de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteRow = (lineNumber: number) => {
    const filtered = rows.filter((r) => r.result.lineNumber !== lineNumber)
    setRows(filtered)
    
    if (statusFilter !== 'ALL' && !filtered.some((r) => r.result.status === statusFilter)) {
      setStatusFilter('ALL')
    }
    
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

    if (statusFilter === 'FAILED') {
      setStatusFilter('ALL')
    }
    
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
    setStatusFilter('ALL')
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

  const summary = parseResult?.summary
  const filteredRows =
    statusFilter === 'ALL'
      ? rows
      : rows.filter((r) => r.result.status === statusFilter)
  const filterOptions = [
    { value: 'ALL' as StatusFilter, label: 'Todos', count: rows.length },
    { value: 'SUCCESS' as StatusFilter, label: 'Exitosos', count: summary?.success ?? 0 },
    { value: 'SKIPPED' as StatusFilter, label: 'Omitidos', count: summary?.skipped ?? 0 },
    { value: 'FAILED' as StatusFilter, label: 'Fallidos', count: summary?.failed ?? 0 },
  ].filter((option) => option.value === 'ALL' || option.count > 0)

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
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <p className="text-sm font-medium text-blue-600">Total</p>
                <p className="text-2xl font-bold text-blue-900">{summary?.total ?? 0}</p>
              </div>
              {summary?.success ? (
                <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                  <p className="text-sm font-medium text-green-600">Exitosos</p>
                  <p className="text-2xl font-bold text-green-900">{summary.success}</p>
                </div>
              ) : null}
              {summary?.skipped ? (
                <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                  <p className="text-sm font-medium text-yellow-600">Omitidos</p>
                  <p className="text-2xl font-bold text-yellow-900">{summary.skipped}</p>
                </div>
              ) : null}
              {summary?.failed ? (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                  <p className="text-sm font-medium text-red-600">Fallidos</p>
                  <p className="text-2xl font-bold text-red-900">{summary.failed}</p>
                </div>
              ) : null}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white/80 px-4 py-3">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Filtrar por estado
              </span>
              <div className="flex flex-wrap gap-2">
                {filterOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setStatusFilter(option.value)}
                    className={cn(
                      'flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition',
                      statusFilter === option.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
                        : 'border-transparent bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900'
                    )}
                  >
                    <span>{option.label}</span>
                    <span
                      className={cn(
                        'rounded-full px-2 py-0.5 text-xs',
                        statusFilter === option.value ? 'bg-blue-100 text-blue-700' : 'bg-white text-gray-600'
                      )}
                    >
                      {option.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Results Cards */}
            {filteredRows.length === 0 ? (
              <div className="rounded-lg border border-dashed p-8 text-center text-sm text-gray-500">
                {rows.length === 0
                  ? 'Sin proyectos procesados. Carga un CSV para comenzar.'
                  : 'No hay proyectos para mostrar con el filtro seleccionado.'}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredRows.map((row) => (
                  <div key={row.result.lineNumber} className={`rounded-lg border p-4 sm:p-6 overflow-hidden ${getStatusColor(row.result.status)}`}>
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                      {/* Status Icon */}
                      <div className="flex-shrink-0 pt-0.5">{getStatusIcon(row.result.status)}</div>

                      {/* Content */}
                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex flex-wrap gap-2 items-start">
                          <h3 className="line-clamp-2 text-lg font-semibold text-gray-900 break-words">{row.result.title}</h3>
                          <span className={`flex-shrink-0 rounded-full px-3 py-1 text-xs font-medium ${getStatusBadge(row.result.status)}`}>
                            {getStatusText(row.result.status)} - Línea {row.result.lineNumber}
                          </span>
                        </div>

                        {/* Message */}
                        <p className="mb-3 text-sm text-gray-600 break-words">{row.result.message}</p>

                        {/* Project Details */}
                        {row.result.project && (
                          <div className="space-y-2 rounded bg-white/70 p-3 text-sm overflow-hidden">
                            {/* Application Domain Badge */}
                            {row.result.project.applicationDomainDTO && (
                              <div className="flex flex-wrap gap-2">
                                <span className="inline-block bg-gray-200 text-gray-800 px-2.5 py-0.5 rounded-full text-xs font-medium">
                                  {row.result.project.applicationDomainDTO.name}
                                </span>
                              </div>
                            )}

                            <div className="grid gap-3 sm:grid-cols-2">
                              <div className="min-w-0">
                                <p className="font-medium text-gray-700">Tipo</p>
                                <p className="break-words text-gray-600">{row.result.project.type}</p>
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium text-gray-700">Carrera</p>
                                <p className="break-words text-gray-600">{row.result.project.career.name}</p>
                              </div>
                              {row.result.project.tags.length > 0 && (
                                <div className="min-w-0 sm:col-span-2">
                                  <p className="font-medium text-gray-700 mb-1">Etiquetas</p>
                                  <div className="flex flex-wrap gap-1">
                                    {row.result.project.tags.map((t) => (
                                      <span key={t.publicId} className="inline-block bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs border border-gray-300">
                                        {t.name}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Participants */}
                            {row.result.project.participants.length > 0 && (
                              <div className="min-w-0">
                                <p className="mb-2 font-medium text-gray-700">Participantes</p>
                                <div className="space-y-1">
                                  {row.result.project.participants.map((p, idx) => (
                                    <p key={idx} className="break-words text-gray-600">
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
                        className="flex-shrink-0 mt-3 sm:mt-0 rounded bg-red-100 px-3 py-2 text-sm text-red-600 transition hover:bg-red-200"
                        title="Eliminar proyecto"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

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
