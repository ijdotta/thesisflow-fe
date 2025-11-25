import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AnalyticsFilters } from '@/pages/public/filters/AnalyticsFilters'
import { TimelineChart } from '@/pages/public/charts/TimelineChart'
import { TopicsHeatmap } from '@/pages/public/charts/TopicsHeatmap'
import { ProfessorNetwork } from '@/pages/public/charts/ProfessorNetwork'
import { StatsTable } from '@/pages/public/charts/StatsTable'
import { DashboardStats } from '@/pages/public/charts/DashboardStats'
import { ProjectTypeStats } from '@/pages/public/charts/ProjectTypeStats'
import { AnalyticsProvider } from '@/pages/public/AnalyticsContext'

function AnalyticsDashboardContent() {
  const [activeTab, setActiveTab] = useState('timeline')

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Sidebar Filters */}
      <div className="lg:col-span-1">
        <AnalyticsFilters />
      </div>

      {/* Main Content */}
      <div className="lg:col-span-3 space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
            <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <TabsTrigger value="timeline" className="text-xs sm:text-sm">
              Barras por Año
            </TabsTrigger>
            <TabsTrigger value="heatmap" className="text-xs sm:text-sm">
              Mapa de Calor
            </TabsTrigger>
            <TabsTrigger value="network" className="text-xs sm:text-sm">
              Red
            </TabsTrigger>
            <TabsTrigger value="stats" className="text-xs sm:text-sm">
              Estadísticas
            </TabsTrigger>
          </TabsList>
          </div>

          <TabsContent value="timeline" className="mt-6">
            <TimelineChart />
          </TabsContent>

          <TabsContent value="heatmap" className="mt-6">
            <TopicsHeatmap />
          </TabsContent>

          <TabsContent value="network" className="mt-6">
            <ProfessorNetwork />
          </TabsContent>

          <TabsContent value="stats" className="mt-6">
            <div className="space-y-6">
              <DashboardStats />
              <ProjectTypeStats />
              <StatsTable />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export function AnalyticsDashboardPage() {
  return (
    <AnalyticsProvider>
      <AnalyticsDashboardContent />
    </AnalyticsProvider>
  )
}
