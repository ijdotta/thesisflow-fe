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
  status: 'success' | 'error' | 'skipped'
  error?: string
  lineNumber?: number
}

export interface PersonDTO {
  publicId: string
  name: string
  lastname: string
}

export interface TagDTO {
  publicId: string
  name: string
}

export interface ApplicationDomainDTO {
  publicId: string
  name: string
}

export interface CareerDTO {
  publicId: string
  name: string
}

export interface ParticipantDTO {
  role: 'DIRECTOR' | 'CO_DIRECTOR' | 'COLLABORATOR' | 'STUDENT'
  personDTO: PersonDTO
}

export interface ProjectDTO {
  publicId: string
  title: string
  type: string
  subtype: string[]
  initialSubmission: string
  completion?: string
  career: CareerDTO
  applicationDomainDTO?: ApplicationDomainDTO
  tags: TagDTO[]
  participants: ParticipantDTO[]
}

export interface ImportResult {
  lineNumber: number
  title: string
  status: 'SUCCESS' | 'SKIPPED' | 'FAILED'
  project: ProjectDTO | null
  message: string
}

export interface ParseCsvResponse {
  summary: {
    total: number
    success: number
    skipped: number
    failed: number
  }
  results: ImportResult[]
}

export async function parseCsv(file: File): Promise<ParseCsvResponse> {
  const formData = new FormData()
  formData.append('file', file)

  const { data } = await api.post<ParseCsvResponse>('/bulk/dataset/projects', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })

  return data
}

export async function applyProjects(_projects: ProjectFromImport[]): Promise<void> {
  // This is handled by the backend - we only display what was already imported
  // The actual import happens when parseCsv is called
  // This function is kept for consistency with the UI flow
}


