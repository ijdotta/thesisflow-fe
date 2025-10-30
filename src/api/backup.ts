import { api } from '@/api/axios'

interface CreateBackupOptions {
  prefix?: string
}

interface CreateBackupResult {
  blob: Blob
  filename: string
}

const DEFAULT_PREFIX = 'thesis-flow-backup'

function formatTimestamp(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, '0')
  const year = date.getFullYear()
  const month = pad(date.getMonth() + 1)
  const day = pad(date.getDate())
  const hours = pad(date.getHours())
  const minutes = pad(date.getMinutes())
  const seconds = pad(date.getSeconds())
  return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`
}

function extractFilenameFromHeader(headerValue?: string | null): string | undefined {
  if (!headerValue) return undefined
  const utfMatch = headerValue.match(/filename\*\s*=\s*UTF-8''([^;]+)/i)
  if (utfMatch && utfMatch[1]) {
    try {
      return decodeURIComponent(utfMatch[1])
    } catch {
      return utfMatch[1]
    }
  }
  const asciiMatch = headerValue.match(/filename\s*=\s*\"?([^\";]+)\"?/i)
  return asciiMatch?.[1]
}

export async function createBackup(options?: CreateBackupOptions): Promise<CreateBackupResult> {
  const prefix = options?.prefix ?? DEFAULT_PREFIX
  const response = await api.get<Blob>('/backup/create', { responseType: 'blob' })
  const header = (response.headers?.['content-disposition'] || response.headers?.['Content-Disposition']) as string | undefined
  const providedFilename = extractFilenameFromHeader(header)
  const timestamp = formatTimestamp(new Date())
  const filename = providedFilename && providedFilename.trim().length
    ? providedFilename
    : `${prefix}-${timestamp}.json`
  return { blob: response.data, filename }
}

export async function restoreBackup(payload: string): Promise<void> {
  await api.post('/backup/restore', payload, {
    headers: { 'Content-Type': 'application/json' },
  })
}

export { formatTimestamp }
