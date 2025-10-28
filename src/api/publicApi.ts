import { api } from '@/api/axios'

// ============ Request/Response Types ============

export interface PersonDTO {
  publicId: string
  name: string
  lastname: string
}

export interface TagDTO {
  publicId: string
  name: string
}

export interface ApplicationDomainDTO {
  publicId: string
  name: string
}

export interface CareerDTO {
  publicId: string
  name: string
}

export interface ParticipantDTO {
  role: 'DIRECTOR' | 'CO_DIRECTOR' | 'COLLABORATOR' | 'STUDENT'
  personDTO: PersonDTO
}

export interface ProjectDTO {
  publicId: string
  title: string
  type: 'THESIS' | 'FINAL_PROJECT'
  subtype: string[]
  initialSubmission: string
  completion?: string
  career: CareerDTO
  applicationDomainDTO?: ApplicationDomainDTO
  tags: TagDTO[]
  participants: ParticipantDTO[]
}

export interface BrowseProjectsResponse {
  content: ProjectDTO[]
  totalElements: number
  totalPages: number
  currentPage: number
  size: number
}

export interface AnalyticsFilters {
  careerIds?: string[]
  professorIds?: string[]
  fromYear?: number
  toYear?: number
}

export interface FilterMetadata {
  careers: { id: string; name: string }[]
  professors: { id: string; name: string }[]
  yearRange: { minYear: number; maxYear: number }
}

export interface ThesisTimelineData {
  professorId: string
  professorName: string
  year: number
  count: number
}

export interface TopicHeatmapData {
  topic: string
  year: number
  count: number
}

export interface ProfessorNetworkNode {
  id: string
  name: string
  projectCount: number
}

export interface ProfessorNetworkEdge {
  source: string
  target: string
  weight: number
  collaborations: number
}

export interface ProfessorNetworkData {
  nodes: ProfessorNetworkNode[]
  edges: ProfessorNetworkEdge[]
}

export interface CareerYearStatsData {
  careerId: string
  careerName: string
  year: number
  projectCount: number
}

export interface ProjectTypeStatsData {
  projectType: string
  displayName: string
  year: number
  projectCount: number
  percentage: number
}

export interface TopItemData {
  id: string
  name: string
  count: number
}

export interface TopProfessorData {
  id: string
  name: string
  projectCount: number
}

export interface OverviewStats {
  totalProjects: number
  filteredProjects: number
  uniqueDomains: number
  uniqueTags: number
  uniqueProfessors: number
}

export interface DashboardStatsResponse {
  overview: OverviewStats
  topDomains: TopItemData[]
  topTags: TopItemData[]
  topProfessors: TopProfessorData[]
}

// ============ API Functions ============

function buildQueryParams(filters?: AnalyticsFilters & Record<string, any>): Record<string, any> {
  const params: Record<string, any> = {}

  if (filters?.careerIds?.length) {
    params.careerIds = filters.careerIds.join(',')
  }
  if (filters?.professorIds?.length) {
    params.professorIds = filters.professorIds.join(',')
  }
  if (filters?.fromYear) {
    params.fromYear = filters.fromYear
  }
  if (filters?.toYear) {
    params.toYear = filters.toYear
  }

  // Pass through other params (like search, page, size)
  Object.keys(filters || {}).forEach((key) => {
    if (!['careerIds', 'professorIds', 'fromYear', 'toYear'].includes(key)) {
      params[key] = filters![key]
    }
  })

  return params
}

export const publicAPI = {
  // Browse projects (paginated, filterable)
  browseProjects: async (
    filters?: AnalyticsFilters & { search?: string; page?: number; size?: number }
  ): Promise<BrowseProjectsResponse> => {
    const { data } = await api.get<BrowseProjectsResponse>('/projects/public', {
      params: buildQueryParams(filters),
    })
    return data
  },

  // Get available filter metadata
  getFilters: async (): Promise<FilterMetadata> => {
    const { data } = await api.get<FilterMetadata>('/analytics/filters')
    return data
  },

  // Timeline: Thesis per professor over time
  getThesisTimeline: async (filters?: AnalyticsFilters): Promise<{ data: ThesisTimelineData[] }> => {
    const { data } = await api.get('/analytics/thesis-timeline', {
      params: buildQueryParams(filters),
    })
    return data
  },

  // Heatmap: Topic popularity over time
  getTopicHeatmap: async (filters?: AnalyticsFilters): Promise<{ data: TopicHeatmapData[] }> => {
    const { data } = await api.get('/analytics/topic-heatmap', {
      params: buildQueryParams(filters),
    })
    return data
  },

  // Network: Professor collaborations
  getProfessorNetwork: async (filters?: AnalyticsFilters): Promise<ProfessorNetworkData> => {
    const { data } = await api.get<ProfessorNetworkData>('/analytics/professor-network', {
      params: buildQueryParams(filters),
    })
    return data
  },

  // Stats: Projects per career per year
  getCareerYearStats: async (filters?: AnalyticsFilters): Promise<{ data: CareerYearStatsData[] }> => {
    const { data } = await api.get('/analytics/career-year-stats', {
      params: buildQueryParams(filters),
    })
    return data
  },

  // Stats: Projects per type (THESIS/FINAL_PROJECT) per year
  getProjectTypeStats: async (filters?: AnalyticsFilters): Promise<{ data: ProjectTypeStatsData[] }> => {
    const { data } = await api.get('/analytics/project-type-stats', {
      params: buildQueryParams(filters),
    })
    return data
  },

  // Stats: Dashboard overview with top-K items
  getDashboardStats: async (filters?: AnalyticsFilters): Promise<DashboardStatsResponse> => {
    const { data } = await api.get('/analytics/dashboard-stats', {
      params: buildQueryParams(filters),
    })
    return data
  },
}
