import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/useAuth'
import { ProjectsPage } from '@/pages/ProjectPage'
import { ProfessorsPage } from '@/pages/ProfessorsPage'
import { StudentsPage } from '@/pages/StudentsPage'
import { PeoplePage } from '@/pages/PeoplePage'
import { CareersPage } from '@/pages/CareersPage'
import { ApplicationDomainsPage } from '@/pages/ApplicationDomainsPage'
import { TagsPage } from '@/pages/TagsPage'
import { BackupPage } from '@/pages/BackupPage'
import { ImportDataPage } from '@/pages/ImportDataPage'
import { NotFoundPage, ForbiddenPage, ServerErrorPage } from '@/pages/ErrorPages'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import type { Role } from '@/types/Auth'

interface RoleRoute {
  path: string
  element: React.ReactNode
  allowedRoles: Role[]
  label: string
}

// Admin-only routes
const adminRoutes: RoleRoute[] = [
  {
    path: 'projects',
    element: <ProjectsPage />,
    allowedRoles: ['ADMIN', 'PROFESSOR'],
    label: 'Projects',
  },
  {
    path: 'people',
    element: <PeoplePage />,
    allowedRoles: ['ADMIN'],
    label: 'People',
  },
  {
    path: 'professors',
    element: <ProfessorsPage />,
    allowedRoles: ['ADMIN'],
    label: 'Professors',
  },
  {
    path: 'students',
    element: <StudentsPage />,
    allowedRoles: ['ADMIN'],
    label: 'Students',
  },
  {
    path: 'careers',
    element: <CareersPage />,
    allowedRoles: ['ADMIN'],
    label: 'Careers',
  },
  {
    path: 'application-domains',
    element: <ApplicationDomainsPage />,
    allowedRoles: ['ADMIN'],
    label: 'Application Domains',
  },
  {
    path: 'tags',
    element: <TagsPage />,
    allowedRoles: ['ADMIN'],
    label: 'Tags',
  },
  {
    path: 'backup',
    element: <BackupPage />,
    allowedRoles: ['ADMIN'],
    label: 'Backup',
  },
  {
    path: 'import-data',
    element: <ImportDataPage />,
    allowedRoles: ['ADMIN'],
    label: 'Import Data',
  },
]

export function RoleBasedRouter() {
  const { user } = useAuth()

  if (!user) {
    return (
      <Routes>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  const userRole = user.role as Role

  return (
    <Routes>
      {/* Admin routes - filtered by role */}
      {adminRoutes.map((route) => (
        <Route
          key={route.path}
          path={route.path}
          element={
            route.allowedRoles.includes(userRole) ? (
              <ProtectedRoute allowedRoles={route.allowedRoles}>{route.element}</ProtectedRoute>
            ) : (
              <ForbiddenPage />
            )
          }
        />
      ))}

      {/* Default redirect for authenticated users */}
      <Route path="/" element={<Navigate to="/projects" replace />} />

      {/* Error pages */}
      <Route path="/forbidden" element={<ForbiddenPage />} />
      <Route path="/server-error" element={<ServerErrorPage />} />
      <Route path="/not-found" element={<NotFoundPage />} />

      {/* Catch all */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export { adminRoutes }
export type { RoleRoute }
