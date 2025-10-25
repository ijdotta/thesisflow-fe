import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ProjectsPage } from '@/pages/ProjectPage';
import { ProfessorsPage } from '@/pages/ProfessorsPage';
import { StudentsPage } from '@/pages/StudentsPage';
import { PeoplePage } from '@/pages/PeoplePage';
import { CareersPage } from '@/pages/CareersPage';
import { ApplicationDomainsPage } from '@/pages/ApplicationDomainsPage';
import { TagsPage } from '@/pages/TagsPage';
import { LoginPage } from '@/pages/LoginPage';
import { NotFoundPage, ForbiddenPage, ServerErrorPage } from '@/pages/ErrorPages'
import { ROUTES } from '@/constants/routes';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BackupPage } from '@/pages/BackupPage';
import { ImportDataPage } from '@/pages/ImportDataPage';
import { Toaster } from 'sonner'
import { AuthProvider } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { ErrorBoundary } from '@/components/ErrorBoundary'

const queryClient = new QueryClient()

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/not-found" element={<NotFoundPage />} />
        <Route path="/forbidden" element={<ForbiddenPage />} />
        <Route path="/server-error" element={<ServerErrorPage />} />
        <Route
          path={ROUTES.backup}
          element={
            <ProtectedRoute>
              <BackupPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.importData}
          element={
            <ProtectedRoute>
              <ImportDataPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.careers}
          element={
            <ProtectedRoute>
              <CareersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.applicationDomains}
          element={
            <ProtectedRoute>
              <ApplicationDomainsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.tags}
          element={
            <ProtectedRoute>
              <TagsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.professors}
          element={
            <ProtectedRoute>
              <ProfessorsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.students}
          element={
            <ProtectedRoute>
              <StudentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.people}
          element={
            <ProtectedRoute>
              <PeoplePage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.projects}
          element={
            <ProtectedRoute>
              <ProjectsPage />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to={ROUTES.projects} replace />} />
        <Route path="*" element={<NotFoundPage />} />
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
