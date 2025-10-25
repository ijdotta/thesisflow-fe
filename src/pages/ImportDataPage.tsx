import { useState } from 'react'
import { Upload, FileJson, AlertCircle, CheckCircle, Loader } from 'lucide-react'
import AdminLayout from '@/layouts/AdminLayout'
import { toast } from 'sonner'
import { api } from '@/api/axios'
import type { AxiosError } from 'axios'

interface ImportResult {
  success: number
  failed: number
  errors?: string[]
}

interface ImportProgress {
  isImporting: boolean
  progress: number
  result: ImportResult | null
}

export function ImportDataPage() {
  const [fileInput, setFileInput] = useState<File | null>(null)
  const [importState, setImportState] = useState<ImportProgress>({
    isImporting: false,
    progress: 0,
    result: null,
  })

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.name.endsWith('.json') && file.type !== 'application/json') {
      toast.error('Please select a valid JSON file')
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB')
      return
    }

    setFileInput(file)
    setImportState({ isImporting: false, progress: 0, result: null })
  }

  const handleImport = async () => {
    if (!fileInput) {
      toast.error('Please select a file first')
      return
    }

    try {
      setImportState({ isImporting: true, progress: 0, result: null })

      const formData = new FormData()
      formData.append('file', fileInput)

      // Simulate progress
      const progressInterval = setInterval(() => {
        setImportState((prev) => ({
          ...prev,
          progress: Math.min(prev.progress + 10, 90),
        }))
      }, 500)

      const response = await api.post('/projects/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      clearInterval(progressInterval)

      const result = response.data as ImportResult
      setImportState({
        isImporting: false,
        progress: 100,
        result,
      })

      if (result.failed === 0) {
        toast.success(`✨ Successfully imported ${result.success} projects!`)
      } else {
        toast.warning(
          `Imported ${result.success} projects, ${result.failed} failed`
        )
      }

      setFileInput(null)
    } catch (error: unknown) {
      setImportState({ isImporting: false, progress: 0, result: null })
      const err = error as AxiosError<{ message?: string }>
      const message =
        err?.response?.data?.message || 'Import failed. Please try again.'
      toast.error(message)
    }
  }

  const handleReset = () => {
    setFileInput(null)
    setImportState({ isImporting: false, progress: 0, result: null })
  }

  return (
    <AdminLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Import Projects</h1>
          <p className="text-gray-600 mt-2">
            Upload a JSON file to import projects into the system
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          {!importState.result ? (
            <>
              {/* File Upload Area */}
              <div className="space-y-4">
                <label className="block">
                  <div className="flex items-center justify-center w-full px-6 py-10 border-2 border-dashed border-blue-300 rounded-lg bg-blue-50 cursor-pointer hover:bg-blue-100 transition">
                    <div className="text-center">
                      {fileInput ? (
                        <>
                          <FileJson className="h-12 w-12 text-blue-600 mx-auto mb-2" />
                          <p className="font-medium text-gray-900">
                            {fileInput.name}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {(fileInput.size / 1024).toFixed(2)} KB
                          </p>
                        </>
                      ) : (
                        <>
                          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                          <p className="font-medium text-gray-900">
                            Click to upload or drag and drop
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            JSON file (max 10MB)
                          </p>
                        </>
                      )}
                    </div>
                    <input
                      type="file"
                      accept=".json,application/json"
                      onChange={handleFileSelect}
                      disabled={importState.isImporting}
                      className="hidden"
                    />
                  </div>
                </label>
              </div>

              {/* Instructions */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="font-medium text-gray-900 mb-2">
                  File Format Instructions:
                </h3>
                <ul className="text-sm text-gray-600 space-y-1 ml-4 list-disc">
                  <li>File must be a valid JSON document</li>
                  <li>Must contain an array of project objects</li>
                  <li>Each project requires: title, type, and participants</li>
                  <li>Optional fields: description, tags, applicationDomain</li>
                  <li>Maximum file size: 10MB</li>
                </ul>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleImport}
                  disabled={!fileInput || importState.isImporting}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-medium py-3 px-4 rounded-lg transition"
                >
                  {importState.isImporting && (
                    <Loader className="h-5 w-5 animate-spin" />
                  )}
                  {importState.isImporting ? 'Importing...' : 'Import Projects'}
                </button>
                {fileInput && (
                  <button
                    onClick={() => setFileInput(null)}
                    disabled={importState.isImporting}
                    className="bg-gray-200 hover:bg-gray-300 disabled:bg-gray-300 text-gray-900 font-medium py-3 px-6 rounded-lg transition"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Progress Bar */}
              {importState.isImporting && (
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Uploading...</span>
                    <span className="text-gray-900 font-medium">
                      {importState.progress}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${importState.progress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Results */}
              <div className="space-y-4">
                {importState.result.failed === 0 ? (
                  <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-green-900">
                        Import Successful!
                      </p>
                      <p className="text-sm text-green-800">
                        {importState.result.success} projects imported
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <AlertCircle className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-yellow-900">
                        Import Partially Completed
                      </p>
                      <p className="text-sm text-yellow-800">
                        {importState.result.success} succeeded,{' '}
                        {importState.result.failed} failed
                      </p>
                    </div>
                  </div>
                )}

                {/* Error Details */}
                {importState.result.errors && importState.result.errors.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">Errors:</h4>
                    <div className="space-y-1 max-h-48 overflow-y-auto">
                      {importState.result.errors.map((error, idx) => (
                        <div
                          key={idx}
                          className="text-sm text-red-700 bg-red-50 p-2 rounded border border-red-200"
                        >
                          {error}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Summary Stats */}
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-600 font-medium">
                      Successful
                    </p>
                    <p className="text-2xl font-bold text-blue-900">
                      {importState.result.success}
                    </p>
                  </div>
                  {importState.result.failed > 0 && (
                    <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                      <p className="text-sm text-red-600 font-medium">Failed</p>
                      <p className="text-2xl font-bold text-red-900">
                        {importState.result.failed}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={handleReset}
                className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition"
              >
                Import Another File
              </button>
            </>
          )}
        </div>

        {/* Sample Format */}
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <h3 className="font-medium text-gray-900 mb-3">Sample JSON Format:</h3>
          <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-xs overflow-x-auto">
            {`[
  {
    "title": "AI Research Project",
    "type": "Research",
    "subtypes": ["Investigation"],
    "description": "Study of artificial intelligence",
    "director": { "name": "John", "lastname": "Doe", "email": "john@example.com" },
    "participants": [],
    "tags": ["AI", "ML"],
    "applicationDomain": "Machine Learning"
  }
]`}
          </pre>
        </div>
      </div>
    </AdminLayout>
  )
}

