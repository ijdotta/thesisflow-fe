import { api } from '@/api/axios'

export interface ImportProjectsRequest {
  file: File
}

export interface ImportProjectsResponse {
  success: number
  failed: number
  errors?: string[]
}

export async function importProjects(
  file: File
): Promise<ImportProjectsResponse> {
  const formData = new FormData()
  formData.append('file', file)

  const { data } = await api.post<ImportProjectsResponse>(
    '/projects/import',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  )

  return data
}
