import { api } from '@/api/axios'

export interface ProjectFromImport {
  id: string
  title: string
  type: string
  director: string
  codirectors: string
  collaborators: string
  students: string
  tags: string
  applicationDomain: string
  status: 'success' | 'error'
  error?: string
}

export interface ParseCsvResponse {
  projects: ProjectFromImport[]
  totalProcessed: number
  successCount: number
  errorCount: number
}

export async function parseCsv(file: File): Promise<ParseCsvResponse> {
  const formData = new FormData()
  formData.append('file', file)

  const { data } = await api.post<ParseCsvResponse>('/projects/parse-csv', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })

  return data
}

export async function applyProjects(projects: ProjectFromImport[]): Promise<void> {
  await api.post('/projects/import', {
    projects: projects.filter((p) => p.status === 'success'),
  })
}

