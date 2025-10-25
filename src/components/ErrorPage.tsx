import { AlertCircle, Home } from 'lucide-react'

interface ErrorPageProps {
  statusCode: number
  title: string
  description: string
  details?: string
  action?: {
    label: string
    href: string
  }
}

export function ErrorPage({
  statusCode,
  title,
  description,
  details,
  action = { label: 'Go Home', href: '/projects' },
}: ErrorPageProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 px-4">
      <div className="max-w-lg w-full text-center">
        {/* Error Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-red-100 rounded-full blur-xl opacity-50"></div>
            <div className="relative bg-white rounded-full p-6 shadow-lg">
              <AlertCircle className="h-12 w-12 text-red-500" />
            </div>
          </div>
        </div>

        {/* Status Code */}
        <div className="mb-4">
          <h1 className="text-6xl font-bold text-red-600">{statusCode}</h1>
        </div>

        {/* Title */}
        <h2 className="text-3xl font-bold text-gray-900 mb-2">{title}</h2>

        {/* Description */}
        <p className="text-lg text-gray-600 mb-4">{description}</p>

        {/* Details */}
        {details && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-sm text-red-800">
            {details}
          </div>
        )}

        {/* Action Button */}
        <a
          href={action.href}
          className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-6 rounded-lg transition transform hover:scale-105"
        >
          <Home className="h-5 w-5" />
          {action.label}
        </a>
      </div>
    </div>
  )
}
