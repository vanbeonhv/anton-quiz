import { 
  QuestionWithTags, 
  CreateQuestionData, 
  OptionKey, 
  Difficulty,
  PaginatedResponse 
} from '@/types'
import { handleApiResponse, fetchWithNetworkHandling, createErrorContext } from '@/lib/utils/errorHandling'

// Request/Response Types
export interface UpdateQuestionData extends Partial<CreateQuestionData> {}

export interface QuestionAttemptData {
  selectedAnswer: OptionKey
  isDailyQuestion?: boolean
}

export interface AttemptResult {
  selectedAnswer: OptionKey
  isCorrect: boolean
  question: {
    correctAnswer: OptionKey
    explanation?: string
  }
}

export interface AdminQuestionFilters {
  page: number
  pageSize: number
  search?: string
  difficulty?: Difficulty | 'all'
  tagId?: string
}

// Question API functions
export const questionApi = {
  /**
   * Fetch a single question by ID
   */
  getQuestion: async (id: string): Promise<QuestionWithTags> => {
    const context = createErrorContext('questionApi', 'getQuestion', { questionId: id })
    const response = await fetchWithNetworkHandling(`/api/questions/${id}`, undefined, context)
    return handleApiResponse<QuestionWithTags>(response, context)
  },

  /**
   * Create a new question
   */
  createQuestion: async (data: CreateQuestionData): Promise<QuestionWithTags> => {
    const context = createErrorContext('questionApi', 'createQuestion', { questionData: data })
    const response = await fetchWithNetworkHandling('/api/admin/questions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }, context)
    return handleApiResponse<QuestionWithTags>(response, context)
  },

  /**
   * Update an existing question
   */
  updateQuestion: async (id: string, data: UpdateQuestionData): Promise<QuestionWithTags> => {
    const context = createErrorContext('questionApi', 'updateQuestion', { questionId: id, updateData: data })
    const response = await fetchWithNetworkHandling(`/api/admin/questions/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }, context)
    return handleApiResponse<QuestionWithTags>(response, context)
  },

  /**
   * Delete a question
   */
  deleteQuestion: async (id: string): Promise<{ message: string }> => {
    const context = createErrorContext('questionApi', 'deleteQuestion', { questionId: id })
    const response = await fetchWithNetworkHandling(`/api/admin/questions/${id}`, {
      method: 'DELETE'
    }, context)
    return handleApiResponse<{ message: string }>(response, context)
  },

  /**
   * Submit an answer attempt for a question
   */
  submitAttempt: async (questionId: string, data: QuestionAttemptData): Promise<AttemptResult> => {
    const context = createErrorContext('questionApi', 'submitAttempt', { questionId, attemptData: data })
    const response = await fetchWithNetworkHandling(`/api/questions/${questionId}/attempt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }, context)
    return handleApiResponse<AttemptResult>(response, context)
  },

  /**
   * Fetch admin questions with filters and pagination
   */
  getAdminQuestions: async (filters: AdminQuestionFilters): Promise<PaginatedResponse<QuestionWithTags>> => {
    const params = new URLSearchParams({
      page: filters.page.toString(),
      pageSize: filters.pageSize.toString()
    })

    if (filters.search) params.append('search', filters.search)
    if (filters.difficulty && filters.difficulty !== 'all') params.append('difficulty', filters.difficulty)
    if (filters.tagId && filters.tagId !== 'all') params.append('tagId', filters.tagId)

    const context = createErrorContext('questionApi', 'getAdminQuestions', { filters })
    const response = await fetchWithNetworkHandling(`/api/admin/questions?${params}`, undefined, context)
    return handleApiResponse<PaginatedResponse<QuestionWithTags>>(response, context)
  }
}