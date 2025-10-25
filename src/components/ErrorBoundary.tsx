import React from 'react'
import { AlertTriangle, Home } from 'lucide-react'

interface Props {
  children: React.ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error) {
    console.error('Error caught by boundary:', error)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 px-4">
          <div className="max-w-lg w-full text-center">
            {/* Error Icon */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-purple-100 rounded-full blur-xl opacity-50"></div>
                <div className="relative bg-white rounded-full p-6 shadow-lg">
                  <AlertTriangle className="h-12 w-12 text-purple-600" />
                </div>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Oops! Something Went Wrong</h1>

            {/* Description */}
            <p className="text-lg text-gray-600 mb-4">
              An unexpected error occurred. Our team has been notified.
            </p>

            {/* Error Details */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6 text-sm">
              <p className="text-purple-900 font-mono break-words">
                {this.state.error?.message || 'Unknown error'}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => window.location.href = '/projects'}
                className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-6 rounded-lg transition transform hover:scale-105"
              >
                <Home className="h-5 w-5" />
                Go Home
              </button>
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium py-3 px-6 rounded-lg transition"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
