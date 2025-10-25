import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { LoginPage } from '@/pages/LoginPage'
import { NotFoundPage, ForbiddenPage, ServerErrorPage } from '@/pages/ErrorPages'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { AuthProvider } from '@/contexts/AuthContext'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { RoleBasedRouter } from '@/router/RoleBasedRouter'

const queryClient = new QueryClient()

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/not-found" element={<NotFoundPage />} />
        <Route path="/forbidden" element={<ForbiddenPage />} />
        <Route path="/server-error" element={<ServerErrorPage />} />

        {/* Protected routes - handled by RoleBasedRouter */}
        <Route path="/*" element={<RoleBasedRouter />} />
      </Routes>
    </BrowserRouter>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <App />
          <Toaster position="top-right" richColors expand={false} closeButton />
        </QueryClientProvider>
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>,
)
