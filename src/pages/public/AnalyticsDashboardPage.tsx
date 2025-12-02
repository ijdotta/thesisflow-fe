import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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

  const tabOptions = [
    { value: 'timeline', label: 'Barras por Año' },
    { value: 'heatmap', label: 'Mapa de Calor' },
    { value: 'network', label: 'Red' },
    { value: 'stats', label: 'Estadísticas' },
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Sidebar Filters */}
      <div className="lg:col-span-1">
        <AnalyticsFilters />
      </div>

      {/* Main Content */}
      <div className="lg:col-span-3 space-y-6">
        {/* Mobile Dropdown */}
        <div className="lg:hidden">
          <Select value={activeTab} onValueChange={setActiveTab}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {tabOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Desktop Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="hidden lg:block w-full">
          <TabsList className="grid w-full grid-cols-4">
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
        </Tabs>

        {/* Content */}
        <div>
          {activeTab === 'timeline' && <TimelineChart />}
          {activeTab === 'heatmap' && <TopicsHeatmap />}
          {activeTab === 'network' && <ProfessorNetwork />}
          {activeTab === 'stats' && (
            <div className="space-y-6">
              <DashboardStats />
              <ProjectTypeStats />
              <StatsTable />
            </div>
          )}
        </div>
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
