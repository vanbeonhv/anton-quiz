import { Difficulty, QuestionWithTags } from './index'

// Common API response wrapper
export interface ApiResponse<T = any> {
  data?: T
  error?: string
  message?: string
}

// Pagination metadata
export interface PaginationMeta {
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

// Generic paginated response
export interface PaginatedApiResponse<T = any> {
  data: T[]
  pagination: PaginationMeta
}

// Questions API specific types
export interface QuestionsSearchParams {
  tags?: string
  difficulty?: string
  status?: 'all' | 'solved' | 'unsolved'
  search?: string
  page?: string
  pageSize?: string
  limit?: string // backward compatibility
  sortBy?: 'newest' | 'difficulty' | 'number' | 'most-attempted'
  sortOrder?: 'asc' | 'desc'
}

export interface ParsedQuestionsParams {
  tags: string[]
  difficulty: Difficulty[]
  status: 'all' | 'solved' | 'unsolved'
  search: string
  page: number
  pageSize: number
  sortBy: 'newest' | 'difficulty' | 'number' | 'most-attempted'
  sortOrder: 'asc' | 'desc'
}

export interface QuestionsApiResponse {
  questions: any[]
  pagination: PaginationMeta
}

// Helper function to parse and validate search params
export function parseQuestionsSearchParams(searchParams: URLSearchParams): ParsedQuestionsParams {
  const tags = searchParams.get('tags')?.split(',').filter(Boolean) || []
  const difficulty = searchParams.get('difficulty')?.split(',').filter(Boolean) as Difficulty[] || []
  const status = (searchParams.get('status') as 'all' | 'solved' | 'unsolved') || 'all'
  const search = searchParams.get('search') || ''
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
  const pageSize = Math.max(1, Math.min(100, parseInt(searchParams.get('pageSize') || searchParams.get('limit') || '20')))
  const sortBy = (searchParams.get('sortBy') as 'newest' | 'difficulty' | 'number' | 'most-attempted') || 'newest'
  const sortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc'

  return {
    tags,
    difficulty,
    status,
    search,
    page,
    pageSize,
    sortBy,
    sortOrder
  }
}

// Daily Question API types
export interface DailyQuestionInfo {
  id: string
  number: number
  difficulty: Difficulty
  resetTime: string
  timeUntilReset: string
  hasAttempted: boolean
  isCompleted: boolean
}

// Utility function to build query parameters for questions API
export function buildQuestionsQueryParams(filters: {
  tags?: string[]
  difficulty?: Difficulty[]
  status?: 'all' | 'solved' | 'unsolved'
  search?: string
  page?: number
  pageSize?: number
  sortBy?: 'newest' | 'difficulty' | 'number' | 'most-attempted'
  sortOrder?: 'asc' | 'desc'
}): URLSearchParams {
  const params = new URLSearchParams()
  
  if (filters.tags && filters.tags.length > 0) {
    params.append('tags', filters.tags.join(','))
  }
  
  if (filters.difficulty && filters.difficulty.length > 0) {
    params.append('difficulty', filters.difficulty.join(','))
  }
  
  if (filters.status && filters.status !== 'all') {
    params.append('status', filters.status)
  }
  
  if (filters.search && filters.search.trim()) {
    params.append('search', filters.search.trim())
  }

  if (filters.page) {
    params.append('page', filters.page.toString())
  }

  if (filters.pageSize) {
    params.append('pageSize', filters.pageSize.toString())
  }

  if (filters.sortBy) {
    params.append('sortBy', filters.sortBy)
  }

  if (filters.sortOrder) {
    params.append('sortOrder', filters.sortOrder)
  }

  return params
}