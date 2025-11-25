import { useCallback, useEffect, useMemo, useState } from 'react'
import { Download, UploadCloud, ShieldAlert, Loader2, CheckCircle2, AlertTriangle, FileWarning, Lock, RefreshCw } from 'lucide-react'
import type { AxiosError } from 'axios'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { createBackup, restoreBackup, formatTimestamp } from '@/api/backup'

type RestoreStep =
  | 'idle'
  | 'warning'
  | 'auto-backup'
  | 'security-challenge'
  | 'file-upload'
  | 'final-confirm'
  | 'restoring'
  | 'complete'

type AsyncStatus = 'idle' | 'pending' | 'success' | 'error'

interface PreBackupInfo {
  filename: string
  blob: Blob
  createdAt: Date
}

interface Challenge {
  question: string
  answer: number
}

interface TableSummary {
  table: string
  count: number
}

interface BackupSummary {
  totalRecords: number
  tableSummaries: TableSummary[]
}

const REQUIRED_TABLES = [
  'career',
  'person',
  'professor',
  'student',
  'student_career',
  'application_domain',
  'tag',
  'project',
  'project_participant',
]

const PUZZLE_POOL: Challenge[] = [
  { question: '¿Cuánto es 7 + 5?', answer: 12 },
  { question: '¿Cuánto es 15 ÷ 3?', answer: 5 },
  { question: '¿Cuánto es 3 × 4?', answer: 12 },
  { question: '¿Cuánto es 20 - 8?', answer: 12 },
  { question: '¿Cuánto es 6 + 7?', answer: 13 },
  { question: '¿Cuánto es 9 + 11?', answer: 20 },
  { question: '¿Cuánto es 36 ÷ 6?', answer: 6 },
]

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

function extractErrorMessage(error: unknown, defaultMessage: string): string {
  const axiosError = error as AxiosError<{ message?: string; error?: string }>
  return (
    axiosError?.response?.data?.message ||
    axiosError?.response?.data?.error ||
    axiosError?.message ||
    defaultMessage
  )
}

function validateBackupStructure(json: any) {
  if (!json || typeof json !== 'object') {
    throw new Error('El archivo seleccionado no contiene un JSON válido.')
  }
  for (const table of REQUIRED_TABLES) {
    if (!Array.isArray(json[table])) {
      throw new Error(`El backup es inválido: falta la tabla "${table}" o no es un arreglo.`)
    }
  }
}

function buildBackupSummary(json: Record<string, unknown>): BackupSummary {
  const tableSummaries: TableSummary[] = Object.entries(json)
    .filter(([, value]) => Array.isArray(value))
    .map(([table, value]) => ({ table, count: (value as unknown[]).length }))
    .sort((a, b) => a.table.localeCompare(b.table))

  const totalRecords = tableSummaries.reduce((acc, item) => acc + item.count, 0)

  return { totalRecords, tableSummaries }
}

function pickChallenge(): Challenge {
  const index = Math.floor(Math.random() * PUZZLE_POOL.length)
  return PUZZLE_POOL[index]
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
}

export function BackupManager() {
  const [isCreatingBackup, setIsCreatingBackup] = useState(false)
  const [restoreStep, setRestoreStep] = useState<RestoreStep>('idle')
  const [restoreError, setRestoreError] = useState<string | null>(null)

  const [preBackupStatus, setPreBackupStatus] = useState<AsyncStatus>('idle')
  const [preBackupInfo, setPreBackupInfo] = useState<PreBackupInfo | null>(null)

  const [challenge, setChallenge] = useState<Challenge | null>(null)
  const [challengeAnswer, setChallengeAnswer] = useState('')
  const [securityError, setSecurityError] = useState<string | null>(null)

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedFileText, setSelectedFileText] = useState<string | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [restoreSummary, setRestoreSummary] = useState<BackupSummary | null>(null)

  const [isRestoring, setIsRestoring] = useState(false)

  const resetRestoreFlow = useCallback(() => {
    setRestoreError(null)
    setPreBackupStatus('idle')
    setPreBackupInfo(null)
    setChallenge(null)
    setChallengeAnswer('')
    setSecurityError(null)
    setSelectedFile(null)
    setSelectedFileText(null)
    setFileError(null)
    setRestoreSummary(null)
    setIsRestoring(false)
  }, [])

  const handleManualBackup = useCallback(async () => {
    setIsCreatingBackup(true)
    try {
      const { blob, filename } = await createBackup()
      downloadBlob(blob, filename)
      toast.success(`Backup creado: ${filename}`)
    } catch (error) {
      const message = extractErrorMessage(error, 'No se pudo crear el backup.')
      setRestoreError(message)
      toast.error(message)
    } finally {
      setIsCreatingBackup(false)
    }
  }, [])

  const beginRestoreFlow = useCallback(() => {
    resetRestoreFlow()
    setRestoreStep('warning')
  }, [resetRestoreFlow])

  const cancelRestoreFlow = useCallback(() => {
    resetRestoreFlow()
    setRestoreStep('idle')
  }, [resetRestoreFlow])

  const startPreRestoreBackup = useCallback(async () => {
    setPreBackupStatus('pending')
    try {
      const { blob, filename } = await createBackup({ prefix: 'thesis-flow-backup-safe' })
      const createdAt = new Date()
      setPreBackupInfo({ filename, blob, createdAt })
      downloadBlob(blob, filename)
      setPreBackupStatus('success')
      toast.info(`Backup previo creado: ${filename}`)
    } catch (error) {
      const message = extractErrorMessage(
        error,
        'No se pudo crear el backup de seguridad previo a la restauración.'
      )
      setPreBackupStatus('error')
      setRestoreError(message)
      toast.error(message)
    }
  }, [])

  useEffect(() => {
    if (restoreStep === 'auto-backup' && preBackupStatus === 'idle') {
      void startPreRestoreBackup()
    }
  }, [restoreStep, preBackupStatus, startPreRestoreBackup])

  useEffect(() => {
    if (restoreStep === 'security-challenge' && !challenge) {
      setChallenge(pickChallenge())
      setChallengeAnswer('')
      setSecurityError(null)
    }
  }, [restoreStep, challenge])

  useEffect(() => {
    if (restoreStep === 'complete') {
      const timer = window.setTimeout(() => {
        window.location.reload()
      }, 3000)
      return () => window.clearTimeout(timer)
    }
    return undefined
  }, [restoreStep])

  const handleSecurityContinue = () => {
    if (!challenge) {
      setSecurityError('No se pudo generar el desafío de seguridad. Vuelve a intentarlo.')
      return
    }
    const numericAnswer = Number(challengeAnswer)
    if (Number.isNaN(numericAnswer) || numericAnswer !== challenge.answer) {
      setSecurityError('Respuesta incorrecta. Resuelve el desafío para continuar.')
      return
    }
    setSecurityError(null)
    setRestoreStep('file-upload')
  }

  const handleFileSelection = async (file: File | null) => {
    if (!file) {
      setSelectedFile(null)
      setSelectedFileText(null)
      setRestoreSummary(null)
      setFileError(null)
      return
    }
    setFileError(null)
    setRestoreError(null)
    setSelectedFile(file)
    try {
      const text = await file.text()
      const parsed = JSON.parse(text)
      validateBackupStructure(parsed)
      const summary = buildBackupSummary(parsed)
      setSelectedFileText(text)
      setRestoreSummary(summary)
      toast.success(`Backup validado: ${file.name}`)
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'El archivo seleccionado no es un backup válido.'
      setFileError(message)
      setRestoreSummary(null)
      setSelectedFileText(null)
      toast.error(message)
    }
  }

  const handleProceedToFinalConfirmation = () => {
    if (!restoreSummary || !selectedFileText) {
      setFileError('Selecciona un archivo de backup válido antes de continuar.')
      return
    }
    setRestoreStep('final-confirm')
  }

  const handleExecuteRestore = async () => {
    if (!selectedFileText) {
      setRestoreError('No hay un backup válido seleccionado para restaurar.')
      return
    }
    setIsRestoring(true)
    setRestoreStep('restoring')
    try {
      await restoreBackup(selectedFileText)
      toast.success('Restauración completada correctamente.')
      setRestoreStep('complete')
    } catch (error) {
      const message = extractErrorMessage(error, 'No se pudo restaurar el backup.')
      setRestoreError(message)
      toast.error(message)
      setIsRestoring(false)
      setRestoreStep('final-confirm')
    }
  }

  const restoreSummaryEntries = useMemo(() => {
    if (!restoreSummary) return []
    return restoreSummary.tableSummaries.filter((item) => item.count > 0)
  }, [restoreSummary])

  const renderRestoreModalContent = () => {
    switch (restoreStep) {
      case 'warning':
        return (
          <>
            <div className="flex items-center gap-3 text-amber-700">
              <ShieldAlert className="h-6 w-6" />
              <div>
                <h3 className="text-lg font-semibold">Restaurar eliminará los datos actuales</h3>
                <p className="text-sm">
                  Esta acción reemplazará todos los registros del sistema. Crearemos un backup automático antes de continuar para que puedas resguardar la información actual.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={cancelRestoreFlow}>
                Cancelar
              </Button>
              <Button onClick={() => setRestoreStep('auto-backup')} className="bg-amber-600 hover:bg-amber-700">
                Sí, continuar
              </Button>
            </div>
          </>
        )
      case 'auto-backup':
        return (
          <>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Download className="h-6 w-6 text-blue-600" />
                <div>
                  <h3 className="text-lg font-semibold">Creando backup de seguridad</h3>
                  <p className="text-sm text-muted-foreground">
                    Estamos generando una copia completa antes de restaurar. Descárgala y guárdala cuando finalice para continuar.
                  </p>
                </div>
              </div>
              {preBackupStatus === 'pending' && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generando backup...
                </div>
              )}
              {preBackupStatus === 'success' && preBackupInfo && (
                <div className="rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">
                  <p className="font-medium">Backup creado correctamente.</p>
                  <p>Archivo: <span className="font-mono">{preBackupInfo.filename}</span></p>
                  <p>Generado: {formatTimestamp(preBackupInfo.createdAt)}</p>
                  <div className="mt-3 flex gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => downloadBlob(preBackupInfo.blob, preBackupInfo.filename)}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Descargar nuevamente
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => setRestoreStep('security-challenge')}
                      className="bg-amber-600 hover:bg-amber-700"
                    >
                      Continuar a verificación
                    </Button>
                  </div>
                </div>
              )}
              {preBackupStatus === 'error' && (
                <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-900">
                  <p className="font-medium">No se pudo crear la copia de seguridad previa.</p>
                  {restoreError && <p>{restoreError}</p>}
                  <div className="mt-3 flex gap-2">
                    <Button variant="outline" onClick={cancelRestoreFlow}>
                      Cancelar
                    </Button>
                    <Button onClick={() => setPreBackupStatus('idle')}>
                      Reintentar
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </>
        )
      case 'security-challenge':
        return (
          <>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Lock className="h-6 w-6 text-slate-700" />
                <div>
                  <h3 className="text-lg font-semibold">Verificación de seguridad</h3>
                  <p className="text-sm text-muted-foreground">
                    Resuelve el siguiente desafío rápido para confirmar que eres un administrador autorizado.
                  </p>
                </div>
              </div>
              <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-medium text-slate-700">{challenge?.question}</p>
                <Input
                  className="mt-3"
                  inputMode="numeric"
                  type="number"
                  placeholder="Ingresa la respuesta"
                  value={challengeAnswer}
                  onChange={(event) => setChallengeAnswer(event.target.value)}
                />
                <p className="mt-2 text-xs text-muted-foreground">
                  Este paso sustituye la confirmación de contraseña hasta que esté disponible.
                </p>
              </div>
              {securityError && (
                <div className="rounded-md border border-red-200 bg-red-50 p-2 text-sm text-red-700">
                  {securityError}
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-between">
              <Button variant="outline" onClick={cancelRestoreFlow}>
                Cancelar
              </Button>
              <Button onClick={handleSecurityContinue}>
                Continuar
              </Button>
            </div>
          </>
        )
      case 'file-upload':
        return (
          <>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <UploadCloud className="h-6 w-6 text-blue-600" />
                <div>
                  <h3 className="text-lg font-semibold">Selecciona el archivo de backup</h3>
                  <p className="text-sm text-muted-foreground">
                    El archivo debe ser un JSON generado por ThesisFlow. Validaremos el formato antes de continuar.
                  </p>
                </div>
              </div>
              <label
                className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center hover:border-blue-400 hover:bg-blue-50"
              >
                <UploadCloud className="mb-3 h-8 w-8 text-blue-500" />
                <p className="font-medium">Arrastra y suelta tu archivo aquí</p>
                <p className="text-sm text-muted-foreground">
                  o haz clic para seleccionarlo (JSON)
                </p>
                <Input
                  type="file"
                  accept="application/json,.json"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0] ?? null
                    void handleFileSelection(file)
                  }}
                />
              </label>
              {selectedFile && restoreSummary && (
                <div className="rounded-md border border-slate-200 bg-white p-4 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">{selectedFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Tamaño: {formatBytes(selectedFile.size)} · Registros totales: {restoreSummary.totalRecords}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              {fileError && (
                <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                  <div className="flex items-center gap-2">
                    <FileWarning className="h-4 w-4" />
                    <span>{fileError}</span>
                  </div>
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-between">
              <Button variant="outline" onClick={cancelRestoreFlow}>
                Cancelar
              </Button>
              <Button onClick={handleProceedToFinalConfirmation} disabled={!restoreSummary}>
                Continuar
              </Button>
            </div>
          </>
        )
      case 'final-confirm':
        return (
          <>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-6 w-6 text-amber-600" />
                <div>
                  <h3 className="text-lg font-semibold">Confirmación final de restauración</h3>
                  <p className="text-sm text-muted-foreground">
                    Estás a punto de restaurar el sistema utilizando{' '}
                    <span className="font-medium">{selectedFile?.name}</span>. Este proceso no se puede deshacer.
                  </p>
                </div>
              </div>
              {restoreSummary && (
                <div className="rounded-md border border-slate-200 bg-white p-4">
                  <p className="text-sm font-medium text-slate-700">Resumen del backup</p>
                  <ul className="mt-3 max-h-40 space-y-1 overflow-auto text-sm">
                    {restoreSummaryEntries.map((item) => (
                      <li key={item.table} className="flex justify-between">
                        <span className="font-mono text-xs uppercase text-slate-500">{item.table}</span>
                        <span>{item.count.toLocaleString()}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 text-sm font-semibold">
                    Total de registros: {restoreSummary.totalRecords.toLocaleString()}
                  </p>
                </div>
              )}
              {restoreError && (
                <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-900">
                  {restoreError}
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-between">
              <Button variant="outline" onClick={() => setRestoreStep('file-upload')}>
                Volver
              </Button>
              <Button onClick={handleExecuteRestore} className="bg-red-600 hover:bg-red-700">
                Restaurar ahora
              </Button>
            </div>
          </>
        )
      case 'restoring':
        return (
          <div className="flex flex-col items-center gap-4 text-center">
            <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
            <div>
              <h3 className="text-lg font-semibold">Restaurando sistema…</h3>
              <p className="text-sm text-muted-foreground">
                Este proceso puede demorar dependiendo del tamaño del backup.
              </p>
            </div>
          </div>
        )
      case 'complete':
        return (
          <div className="flex flex-col items-center gap-4 text-center">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
            <div>
              <h3 className="text-lg font-semibold">Restauración completada</h3>
              <p className="text-sm text-muted-foreground">
                Actualizaremos la aplicación automáticamente en unos segundos para reflejar los nuevos datos.
              </p>
            </div>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Refrescar ahora
            </Button>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-blue-600" />
            Crear backup
          </CardTitle>
          <CardDescription>
            Genera un archivo JSON con todos los datos actuales del sistema. Recomendado antes de realizar cambios grandes.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-muted-foreground max-w-xl">
            El archivo se descargará automáticamente con un nombre que incluye la fecha y hora actuales.
          </div>
          <Button onClick={handleManualBackup} disabled={isCreatingBackup}>
            {isCreatingBackup ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generando…
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Crear backup
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <RefreshCw className="h-5 w-5" />
            Restaurar sistema desde backup
          </CardTitle>
          <CardDescription>
            Reemplaza completamente la base de datos actual con la información contenida en un archivo de backup válido.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-muted-foreground max-w-xl">
            Esta acción está disponible solo para administradores y requiere completar un flujo guiado de seguridad.
          </div>
          <Button variant="destructive" onClick={beginRestoreFlow}>
            <UploadCloud className="mr-2 h-4 w-4" />
            Restaurar backup
          </Button>
        </CardContent>
      </Card>

      {restoreStep !== 'idle' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-8">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {restoreStep === 'warning' && 'Confirmar restauración'}
                {restoreStep === 'auto-backup' && 'Backup de seguridad'}
                {restoreStep === 'security-challenge' && 'Verificación de seguridad'}
                {restoreStep === 'file-upload' && 'Seleccionar backup'}
                {restoreStep === 'final-confirm' && 'Confirmación final'}
                {restoreStep === 'restoring' && 'Restaurando…'}
                {restoreStep === 'complete' && 'Restauración completada'}
              </h2>
            </div>
            <div className="space-y-4">{renderRestoreModalContent()}</div>
          </div>
        </div>
      )}
    </div>
  )
}
