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
import { ROUTES } from '@/constants/routes'
import { useMemo } from 'react'

interface RoleRoute {
  path: string
  element: React.ReactNode
  allowedRoles: Role[]
  label: string
}

// Admin-only routes
const adminRoutes: RoleRoute[] = [
  {
    path: ROUTES.projects,
    element: <ProjectsPage />,
    allowedRoles: ['ADMIN', 'PROFESSOR'],
    label: 'Projects',
  },
  {
    path: ROUTES.people,
    element: <PeoplePage />,
    allowedRoles: ['ADMIN'],
    label: 'People',
  },
  {
    path: ROUTES.professors,
    element: <ProfessorsPage />,
    allowedRoles: ['ADMIN'],
    label: 'Professors',
  },
  {
    path: ROUTES.students,
    element: <StudentsPage />,
    allowedRoles: ['ADMIN'],
    label: 'Students',
  },
  {
    path: ROUTES.careers,
    element: <CareersPage />,
    allowedRoles: ['ADMIN'],
    label: 'Careers',
  },
  {
    path: ROUTES.applicationDomains,
    element: <ApplicationDomainsPage />,
    allowedRoles: ['ADMIN'],
    label: 'Application Domains',
  },
  {
    path: ROUTES.tags,
    element: <TagsPage />,
    allowedRoles: ['ADMIN'],
    label: 'Tags',
  },
  {
    path: ROUTES.backup,
    element: <BackupPage />,
    allowedRoles: ['ADMIN'],
    label: 'Backup',
  },
  {
    path: ROUTES.importData,
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

  const redirectPath = useMemo(() => {
    if (userRole === 'PROFESSOR') {
      return ROUTES.professorProjects
    }
    return ROUTES.projects
  }, [userRole])

  return (
    <Routes>
      {/* Admin routes - filtered by role */}
      {adminRoutes.map((route) => {
        const relativePath = route.path.startsWith('/admin/')
          ? route.path.replace('/admin/', '')
          : route.path.replace(/^\//, '')

        return (
          <Route
            key={route.path}
            path={relativePath}
            element={
              route.allowedRoles.includes(userRole) ? (
                <ProtectedRoute allowedRoles={route.allowedRoles}>{route.element}</ProtectedRoute>
              ) : (
                <ForbiddenPage />
              )
            }
          />
        )
      })}

      {/* Default redirect for authenticated users */}
      <Route index element={<Navigate to={redirectPath} replace />} />

      {/* Error pages */}
      <Route path="forbidden" element={<ForbiddenPage />} />
      <Route path="server-error" element={<ServerErrorPage />} />
      <Route path="not-found" element={<NotFoundPage />} />

      {/* Catch all */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export { adminRoutes }
export type { RoleRoute }
