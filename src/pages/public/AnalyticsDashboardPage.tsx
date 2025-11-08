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
  const [filtersOpen, setFiltersOpen] = useState(false)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6">
      {/* Sidebar Filters */}
      <div className="lg:col-span-1">
        {/* Mobile Filter Toggle */}
        <div className="lg:hidden mb-4">
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium text-sm"
          >
            {filtersOpen ? 'Ocultar Filtros' : 'Mostrar Filtros'}
          </button>
        </div>
        {(filtersOpen || window.innerWidth >= 1024) && (
          <AnalyticsFilters />
        )}
      </div>

      {/* Main Content */}
      <div className="lg:col-span-3 space-y-4 lg:space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 gap-1 lg:gap-0 p-1 lg:p-0">
            <TabsTrigger value="timeline" className="text-xs lg:text-sm px-2 lg:px-4 py-2">
              Barras por Año
            </TabsTrigger>
            <TabsTrigger value="heatmap" className="text-xs lg:text-sm px-2 lg:px-4 py-2">
              Mapa de Calor
            </TabsTrigger>
            <TabsTrigger value="network" className="text-xs lg:text-sm px-2 lg:px-4 py-2">
              Red
            </TabsTrigger>
            <TabsTrigger value="stats" className="text-xs lg:text-sm px-2 lg:px-4 py-2">
              Estadísticas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="timeline" className="mt-4 lg:mt-6">
            <TimelineChart />
          </TabsContent>

          <TabsContent value="heatmap" className="mt-4 lg:mt-6">
            {activeTab === 'heatmap' && <TopicsHeatmap />}
          </TabsContent>

          <TabsContent value="network" className="mt-4 lg:mt-6">
            <ProfessorNetwork />
          </TabsContent>

          <TabsContent value="stats" className="mt-4 lg:mt-6">
            <div className="space-y-4 lg:space-y-6">
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
