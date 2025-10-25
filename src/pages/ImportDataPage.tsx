import { useState } from 'react'
import { Upload, Trash2, AlertCircle, CheckCircle } from 'lucide-react'
import AdminLayout from '@/layouts/AdminLayout'
import { toast } from 'sonner'
import { api } from '@/api/axios'
import type { AxiosError } from 'axios'

interface ProjectFromImport {
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

interface ParseResponse {
  projects: ProjectFromImport[]
  totalProcessed: number
  successCount: number
  errorCount: number
}

export function ImportDataPage() {
  const [file, setFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [parseResult, setParseResult] = useState<ParseResponse | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<Partial<ProjectFromImport>>({})

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    if (!selectedFile.name.endsWith('.csv')) {
      toast.error('Please select a valid CSV file')
      return
    }

    if (selectedFile.size > 50 * 1024 * 1024) {
      toast.error('File size must be less than 50MB')
      return
    }

    setFile(selectedFile)
  }

  const handleParse = async () => {
    if (!file) {
      toast.error('Please select a file first')
      return
    }

    try {
      setIsLoading(true)

      const formData = new FormData()
      formData.append('file', file)

      const response = await api.post<ParseResponse>('/projects/parse-csv', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      setParseResult(response.data)
      toast.success(`Parsed ${response.data.successCount} projects`)
    } catch (error: unknown) {
      setParseResult(null)
      const err = error as AxiosError<{ message?: string }>
      const message = err?.response?.data?.message || 'Parse failed. Please try again.'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (project: ProjectFromImport) => {
    setEditingId(project.id)
    setEditValues(project)
  }

  const handleSaveEdit = (id: string) => {
    if (!parseResult) return

    const updatedProjects = parseResult.projects.map((p) =>
      p.id === id ? { ...p, ...editValues } : p
    )

    setParseResult({
      ...parseResult,
      projects: updatedProjects,
    })

    setEditingId(null)
    setEditValues({})
    toast.success('Project updated')
  }

  const handleDeleteRow = (id: string) => {
    if (!parseResult) return

    const updated = parseResult.projects.filter((p) => p.id !== id)
    setParseResult({
      ...parseResult,
      projects: updated,
      successCount: updated.filter((p) => p.status === 'success').length,
      errorCount: updated.filter((p) => p.status === 'error').length,
    })

    toast.success('Project removed')
  }

  const handleRemoveAllErrors = () => {
    if (!parseResult) return

    const successOnly = parseResult.projects.filter((p) => p.status === 'success')
    setParseResult({
      ...parseResult,
      projects: successOnly,
      errorCount: 0,
    })

    toast.success('Removed all failed projects')
  }

  const handleRemoveAll = () => {
    setParseResult(null)
    setFile(null)
    setEditingId(null)
    setEditValues({})
    toast.success('Cleared all data')
  }

  const handleApply = async () => {
    if (!parseResult || parseResult.projects.length === 0) {
      toast.error('No projects to apply')
      return
    }

    try {
      setIsLoading(true)

      await api.post('/projects/import', {
        projects: parseResult.projects.filter((p) => p.status === 'success'),
      })

      toast.success(`Applied ${parseResult.successCount} projects`)
      handleRemoveAll()
    } catch (error: unknown) {
      const err = error as AxiosError<{ message?: string }>
      const message = err?.response?.data?.message || 'Apply failed. Please try again.'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Import Projects</h1>
          <p className="text-gray-600 mt-2">Upload a CSV file and review projects before applying</p>
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
                        Click to upload or drag and drop
                      </p>
                      <p className="text-sm text-gray-600 mt-1">CSV file (max 50MB)</p>
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
                {isLoading ? 'Parsing...' : 'Parse CSV'}
              </button>
              {file && (
                <button
                  onClick={() => setFile(null)}
                  disabled={isLoading}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium py-3 px-6 rounded-lg transition"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Summary */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-green-600 font-medium">Success</p>
                <p className="text-2xl font-bold text-green-900">{parseResult.successCount}</p>
              </div>
              {parseResult.errorCount > 0 && (
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-sm text-red-600 font-medium">Failed</p>
                  <p className="text-2xl font-bold text-red-900">{parseResult.errorCount}</p>
                </div>
              )}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-600 font-medium">Total</p>
                <p className="text-2xl font-bold text-blue-900">{parseResult.totalProcessed}</p>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Status</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Title</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Type</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Director</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Students</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parseResult.projects.map((project) => (
                      <tr key={project.id} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="px-6 py-3">
                          {project.status === 'success' ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-red-600" />
                          )}
                        </td>
                        <td className="px-6 py-3">
                          {editingId === project.id ? (
                            <input
                              type="text"
                              value={editValues.title || ''}
                              onChange={(e) => setEditValues({ ...editValues, title: e.target.value })}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                          ) : (
                            <span className="text-sm text-gray-900">{project.title}</span>
                          )}
                        </td>
                        <td className="px-6 py-3">
                          {editingId === project.id ? (
                            <input
                              type="text"
                              value={editValues.type || ''}
                              onChange={(e) => setEditValues({ ...editValues, type: e.target.value })}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                          ) : (
                            <span className="text-sm text-gray-900">{project.type}</span>
                          )}
                        </td>
                        <td className="px-6 py-3">
                          {editingId === project.id ? (
                            <input
                              type="text"
                              value={editValues.director || ''}
                              onChange={(e) => setEditValues({ ...editValues, director: e.target.value })}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                          ) : (
                            <span className="text-sm text-gray-600">{project.director}</span>
                          )}
                        </td>
                        <td className="px-6 py-3">
                          {editingId === project.id ? (
                            <input
                              type="text"
                              value={editValues.students || ''}
                              onChange={(e) => setEditValues({ ...editValues, students: e.target.value })}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                          ) : (
                            <span className="text-sm text-gray-600">{project.students}</span>
                          )}
                        </td>
                        <td className="px-6 py-3 flex gap-2">
                          {editingId === project.id ? (
                            <>
                              <button
                                onClick={() => handleSaveEdit(project.id)}
                                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingId(null)}
                                className="px-3 py-1 bg-gray-300 hover:bg-gray-400 text-gray-900 text-sm rounded transition"
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => handleEdit(project)}
                                className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-900 text-sm rounded transition"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteRow(project.id)}
                                className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-600 text-sm rounded transition"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleApply}
                disabled={parseResult.projects.length === 0 || isLoading}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-medium py-3 px-4 rounded-lg transition"
              >
                {isLoading ? 'Applying...' : `Apply ${parseResult.successCount} Projects`}
              </button>
              {parseResult.errorCount > 0 && (
                <button
                  onClick={handleRemoveAllErrors}
                  className="bg-red-100 hover:bg-red-200 text-red-600 font-medium py-3 px-4 rounded-lg transition"
                >
                  Remove Failed
                </button>
              )}
              <button
                onClick={handleRemoveAll}
                className="bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium py-3 px-4 rounded-lg transition"
              >
                Clear All
              </button>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  )
}

