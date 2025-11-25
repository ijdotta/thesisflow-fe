import { api } from '@/api/axios'

export interface ExportFilters {
  careerIds?: string[]
  applicationDomainIds?: string[]
  tagIds?: string[]
  professorIds?: string[]
  projectTypes?: string[]
  fromYear?: number
  toYear?: number
}

interface ExportResult {
  blob: Blob
  filename: string
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

export async function exportProjects(filters?: ExportFilters): Promise<ExportResult> {
  const params: Record<string, any> = {}

  if (filters?.careerIds?.length) {
    params.careerIds = filters.careerIds.join(',')
  }
  if (filters?.applicationDomainIds?.length) {
    params.applicationDomainIds = filters.applicationDomainIds.join(',')
  }
  if (filters?.tagIds?.length) {
    params.tagIds = filters.tagIds.join(',')
  }
  if (filters?.professorIds?.length) {
    params.professorIds = filters.professorIds.join(',')
  }
  if (filters?.projectTypes?.length) {
    params.projectTypes = filters.projectTypes.join(',')
  }
  if (filters?.fromYear) {
    params.fromYear = filters.fromYear
  }
  if (filters?.toYear) {
    params.toYear = filters.toYear
  }

  const response = await api.get<Blob>('/export/projects', {
    params,
    responseType: 'blob',
  })

  const header = (response.headers?.['content-disposition'] ||
    response.headers?.['Content-Disposition']) as string | undefined
  const providedFilename = extractFilenameFromHeader(header)
  const filename = providedFilename && providedFilename.trim().length ? providedFilename : 'projects-export.csv'

  return { blob: response.data, filename }
}
