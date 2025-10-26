import { Routes, Route, Navigate } from 'react-router-dom'
import { PublicLayout } from '@/pages/public/PublicLayout'
import { PublicHomePage } from '@/pages/public/PublicHomePage'
import { BrowseProjectsPage } from '@/pages/public/BrowseProjectsPage'
import { AnalyticsDashboardPage } from '@/pages/public/AnalyticsDashboardPage'
import { AnalyticsProvider } from '@/pages/public/AnalyticsContext'
import { RoleBasedRouter } from '@/router/RoleBasedRouter'
import { useAuth } from '@/contexts/useAuth'

export function PublicRouter() {
  const { user } = useAuth()

  // If authenticated, redirect to admin area
  if (user) {
    return <RoleBasedRouter />
  }

  return (
    <PublicLayout>
      <Routes>
        <Route path="/" element={<PublicHomePage />} />
        <Route
          path="/projects"
          element={
            <AnalyticsProvider>
              <BrowseProjectsPage />
            </AnalyticsProvider>
          }
        />
        <Route path="/analytics" element={<AnalyticsDashboardPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </PublicLayout>
  )
}
