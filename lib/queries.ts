import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/hooks/useAuth'
import type {
  UserStats,
  UserStatsWithComputed,
  QuestionsSolvedLeaderboardEntry,
  Tag,
  TagWithStats,
  QuestionWithTags,
  PaginatedResponse,
  Difficulty,
  CreateQuestionData
} from '@/types'
import { QuestionsApiResponse } from '@/types/api'
import { questionApi, type UpdateQuestionData, type QuestionAttemptData } from '@/lib/api/questions'
import { tagApi, type UpdateTagData, type BulkTagAssignmentData } from '@/lib/api/tags'
import { handleMutationError, shouldRetryWithConfig, createErrorContext } from '@/lib/utils/errorHandling'
import { 
  createOptimisticAttempt, 
  updateUserStatsOptimistically, 
  updateQuestionTagsOptimistically,
  updateTagStatsOptimistically 
} from '@/lib/utils/optimisticUpdates'
import { LevelCalculatorService } from '@/lib/utils/levels'



// Fetch recent scores for dashboard (now using questions solved leaderboard)
export function useRecentScores(limit: number = 5) {
  return useQuestionsSolvedLeaderboard('all-time', limit)
}



// Fetch questions solved leaderboard
export function useQuestionsSolvedLeaderboard(filter: string = 'all-time', limit: number = 100) {
  return useQuery({
    queryKey: ['questions-solved-leaderboard', filter, limit],
    queryFn: async (): Promise<QuestionsSolvedLeaderboardEntry[]> => {
      const params = new URLSearchParams({
        type: 'questions-solved',
        filter,
        limit: limit.toString()
      })
      const res = await fetch(`/api/scoreboard?${params}`)
      if (!res.ok) throw new Error('Failed to fetch questions solved leaderboard')
      return res.json()
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

// Fetch user stats
export function useUserStats() {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: ['user-stats'],
    queryFn: async (): Promise<UserStats & { xpToNextLevel: number }> => {
      const res = await fetch('/api/user/stats')
      if (!res.ok) throw new Error('Failed to fetch user stats')
      return res.json()
    },
    staleTime: 5 * 60 * 1000, // Increase to 5 minutes
    enabled: isAuthenticated, // Only fetch when user is authenticated
    refetchOnWindowFocus: false, // Disable refetch on window focus
    refetchOnMount: false, // Disable refetch on component mount
  })
}



// Fetch user profile statistics
export function useUserProfileStats(userId?: string) {
  return useQuery({
    queryKey: ['user-profile-stats', userId],
    queryFn: async (): Promise<UserStatsWithComputed> => {
      if (!userId) throw new Error('User ID is required')

      const res = await fetch(`/api/user/${userId}/stats`)
      if (!res.ok) throw new Error('Failed to fetch user profile statistics')
      return res.json()
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Fetch questions with filters
export function useQuestions(filters: any) {
  const { isAuthenticated } = useAuth()
  return useQuery<QuestionsApiResponse>({
    queryKey: ['questions', filters],
    queryFn: async () => {
      const params = new URLSearchParams()

      if (filters.search) params.append('search', filters.search)
      if (filters.tags?.length) params.append('tags', filters.tags.join(','))
      if (filters.difficulty?.length) params.append('difficulty', filters.difficulty.join(','))
      if (filters.status && filters.status !== 'all') params.append('status', filters.status)
      if (filters.sortBy) params.append('sortBy', filters.sortBy)
      if (filters.page) params.append('page', filters.page.toString())
      if (filters.pageSize) params.append('pageSize', filters.pageSize.toString())

      const res = await fetch(`/api/questions?${params}`)
      if (!res.ok) throw new Error('Failed to fetch questions')
      return res.json();
    },
    enabled: isAuthenticated,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: false,
  })
}

// Fetch all tags
export function useTags() {
  return useQuery({
    queryKey: ['tags'],
    queryFn: async (): Promise<Tag[]> => {
      const res = await fetch('/api/tags')
      if (!res.ok) throw new Error('Failed to fetch tags')
      return res.json()
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - tags don't change often
    refetchOnWindowFocus: false,
  })
}

// Fetch all tags with stats (for admin)
export function useTagsWithStats() {
  return useQuery({
    queryKey: ['tags-with-stats'],
    queryFn: async (): Promise<TagWithStats[]> => {
      const res = await fetch('/api/tags')
      if (!res.ok) throw new Error('Failed to fetch tags')
      return res.json()
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - admin data might change more frequently
    refetchOnWindowFocus: false,
  })
}

// Fetch admin questions with filters and pagination
export function useAdminQuestions(filters: {
  page: number
  pageSize: number
  search?: string
  difficulty?: Difficulty | 'all'
  tagId?: string
}) {
  return useQuery({
    queryKey: ['admin-questions', filters],
    queryFn: async (): Promise<PaginatedResponse<QuestionWithTags>> => {
      const params = new URLSearchParams({
        page: filters.page.toString(),
        pageSize: filters.pageSize.toString()
      })

      if (filters.search) params.append('search', filters.search)
      if (filters.difficulty && filters.difficulty !== 'all') params.append('difficulty', filters.difficulty)
      if (filters.tagId && filters.tagId !== 'all') params.append('tagId', filters.tagId)

      const res = await fetch(`/api/admin/questions?${params}`)
      if (!res.ok) throw new Error('Failed to fetch questions')
      return res.json()
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: false,
  })
}

// ============================================================================
// MUTATION HOOKS
// ============================================================================

/**
 * Create a new question
 */
export function useCreateQuestion() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: questionApi.createQuestion,
    onMutate: async (newQuestionData) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['admin-questions'] })

      // Snapshot the previous values
      const previousAdminQuestions = queryClient.getQueryData(['admin-questions'])

      // Get current admin questions data
      const currentAdminQuestions = queryClient.getQueryData<any>(['admin-questions'])
      
      if (currentAdminQuestions?.data) {
        // Get tags for the new question
        const allTags = queryClient.getQueryData<Tag[]>(['tags']) || []
        const questionTags = newQuestionData.tags 
          ? allTags.filter(tag => newQuestionData.tags!.includes(tag.id))
          : []

        // Create optimistic question
        const optimisticQuestion: QuestionWithTags = {
          id: 'optimistic-' + Date.now(),
          number: currentAdminQuestions.data.length + 1, // Approximate number
          text: newQuestionData.text,
          optionA: newQuestionData.optionA,
          optionB: newQuestionData.optionB,
          optionC: newQuestionData.optionC,
          optionD: newQuestionData.optionD,
          correctAnswer: newQuestionData.correctAnswer,
          explanation: newQuestionData.explanation,
          difficulty: newQuestionData.difficulty,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          tags: questionTags,
          userAttempt: undefined,
          isSolved: false,
          hasAttempted: false
        }

        // Add optimistic question to the beginning of the list
        queryClient.setQueryData(['admin-questions'], {
          ...currentAdminQuestions,
          data: [optimisticQuestion, ...currentAdminQuestions.data],
          pagination: {
            ...currentAdminQuestions.pagination,
            total: currentAdminQuestions.pagination.total + 1
          }
        })
      }

      return { previousAdminQuestions }
    },
    onError: (err, variables, context) => {
      // Roll back optimistic updates on error
      if (context?.previousAdminQuestions) {
        queryClient.setQueryData(['admin-questions'], context.previousAdminQuestions)
      }
      const errorContext = createErrorContext('useCreateQuestion', 'mutation')
      console.error('Failed to create question:', handleMutationError(err, errorContext))
    },
    onSuccess: () => {
      // Invalidate to get fresh data from server
      queryClient.invalidateQueries({ queryKey: ['admin-questions'] })
      queryClient.invalidateQueries({ queryKey: ['questions'] })
    },
    retry: (failureCount, error) => shouldRetryWithConfig(error, failureCount),
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
  })
}

/**
 * Update an existing question
 */
export function useUpdateQuestion() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateQuestionData }) => 
      questionApi.updateQuestion(id, data),
    onSuccess: (updatedQuestion) => {
      // Update the specific question in cache
      queryClient.setQueryData(['question', updatedQuestion.id], updatedQuestion)
      // Invalidate admin questions list to reflect changes
      queryClient.invalidateQueries({ queryKey: ['admin-questions'] })
      // Invalidate regular questions list as well
      queryClient.invalidateQueries({ queryKey: ['questions'] })
    },
    onError: (error) => {
      const errorContext = createErrorContext('useUpdateQuestion', 'mutation')
      console.error('Failed to update question:', handleMutationError(error, errorContext))
    },
    retry: (failureCount, error) => shouldRetryWithConfig(error, failureCount),
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
  })
}

/**
 * Delete a question
 */
export function useDeleteQuestion() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: questionApi.deleteQuestion,
    onSuccess: (_, questionId) => {
      // Remove the specific question from cache
      queryClient.removeQueries({ queryKey: ['question', questionId] })
      // Invalidate admin questions list to remove the deleted question
      queryClient.invalidateQueries({ queryKey: ['admin-questions'] })
      // Invalidate regular questions list as well
      queryClient.invalidateQueries({ queryKey: ['questions'] })
      // Invalidate user stats as question count may have changed
      queryClient.invalidateQueries({ queryKey: ['user-stats'] })
    },
    onError: (error) => {
      const errorContext = createErrorContext('useDeleteQuestion', 'mutation')
      console.error('Failed to delete question:', handleMutationError(error, errorContext))
    },
    retry: (failureCount, error) => shouldRetryWithConfig(error, failureCount),
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
  })
}

/**
 * Create a new tag
 */
export function useCreateTag() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: tagApi.createTag,
    onMutate: async (newTagData) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['tags'] })
      await queryClient.cancelQueries({ queryKey: ['tags-with-stats'] })

      // Snapshot the previous values
      const previousTags = queryClient.getQueryData<Tag[]>(['tags'])
      const previousTagsWithStats = queryClient.getQueryData<TagWithStats[]>(['tags-with-stats'])

      // Create optimistic tag
      const optimisticTag: Tag = {
        id: 'optimistic-' + Date.now(),
        name: newTagData.name,
        description: newTagData.description,
        color: newTagData.color,
        createdAt: new Date()
      }

      // Optimistically update tags list
      if (previousTags) {
        queryClient.setQueryData<Tag[]>(['tags'], [...previousTags, optimisticTag])
      }

      // Optimistically update tags with stats
      if (previousTagsWithStats) {
        const optimisticTagWithStats: TagWithStats = {
          ...optimisticTag,
          questionCount: 0
        }
        queryClient.setQueryData<TagWithStats[]>(['tags-with-stats'], [...previousTagsWithStats, optimisticTagWithStats])
      }

      return { previousTags, previousTagsWithStats, optimisticTag }
    },
    onError: (err, variables, context) => {
      // Roll back optimistic updates on error
      if (context?.previousTags) {
        queryClient.setQueryData(['tags'], context.previousTags)
      }
      if (context?.previousTagsWithStats) {
        queryClient.setQueryData(['tags-with-stats'], context.previousTagsWithStats)
      }
      const errorContext = createErrorContext('useCreateTag', 'mutation')
      console.error('Failed to create tag:', handleMutationError(err, errorContext))
    },
    onSuccess: (newTag, variables, context) => {
      // Replace optimistic tag with real tag data
      const currentTags = queryClient.getQueryData<Tag[]>(['tags'])
      if (currentTags && context?.optimisticTag) {
        const updatedTags = currentTags.map(tag => 
          tag.id === context.optimisticTag.id ? newTag : tag
        )
        queryClient.setQueryData(['tags'], updatedTags)
      }

      const currentTagsWithStats = queryClient.getQueryData<TagWithStats[]>(['tags-with-stats'])
      if (currentTagsWithStats && context?.optimisticTag) {
        const updatedTagsWithStats = currentTagsWithStats.map(tag => 
          tag.id === context.optimisticTag.id ? { ...newTag, questionCount: 0 } : tag
        )
        queryClient.setQueryData(['tags-with-stats'], updatedTagsWithStats)
      }

      // Invalidate to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['tags'] })
      queryClient.invalidateQueries({ queryKey: ['tags-with-stats'] })
    },
    retry: (failureCount, error) => shouldRetryWithConfig(error, failureCount),
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
  })
}

/**
 * Update an existing tag
 */
export function useUpdateTag() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTagData }) => 
      tagApi.updateTag(id, data),
    onSuccess: () => {
      // Invalidate all tag-related queries to reflect changes
      queryClient.invalidateQueries({ queryKey: ['tags'] })
      queryClient.invalidateQueries({ queryKey: ['tags-with-stats'] })
      // Also invalidate questions as they include tag information
      queryClient.invalidateQueries({ queryKey: ['questions'] })
      queryClient.invalidateQueries({ queryKey: ['admin-questions'] })
    },
    onError: (error) => {
      const errorContext = createErrorContext('useUpdateTag', 'mutation')
      console.error('Failed to update tag:', handleMutationError(error, errorContext))
    },
    retry: (failureCount, error) => shouldRetryWithConfig(error, failureCount),
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
  })
}

/**
 * Delete a tag
 */
export function useDeleteTag() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: tagApi.deleteTag,
    onSuccess: () => {
      // Invalidate all tag-related queries
      queryClient.invalidateQueries({ queryKey: ['tags'] })
      queryClient.invalidateQueries({ queryKey: ['tags-with-stats'] })
      // Also invalidate questions as tag relationships may have changed
      queryClient.invalidateQueries({ queryKey: ['questions'] })
      queryClient.invalidateQueries({ queryKey: ['admin-questions'] })
    },
    onError: (error) => {
      const errorContext = createErrorContext('useDeleteTag', 'mutation')
      console.error('Failed to delete tag:', handleMutationError(error, errorContext))
    },
    retry: (failureCount, error) => shouldRetryWithConfig(error, failureCount),
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
  })
}

/**
 * Perform bulk tag assignment operations
 */
export function useBulkTagAssignment() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: tagApi.bulkAssignTags,
    onMutate: async (variables) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['admin-questions'] })
      await queryClient.cancelQueries({ queryKey: ['tags-with-stats'] })

      // Snapshot the previous values
      const previousAdminQuestions = queryClient.getQueryData(['admin-questions'])
      const previousTagsWithStats = queryClient.getQueryData(['tags-with-stats'])

      // Get current data to perform optimistic updates
      const currentAdminQuestions = queryClient.getQueryData<any>(['admin-questions'])
      const currentTagsWithStats = queryClient.getQueryData<TagWithStats[]>(['tags-with-stats'])

      // Optimistically update admin questions if we have the data
      if (currentAdminQuestions?.data) {
        const allTags = queryClient.getQueryData<Tag[]>(['tags']) || []
        
        const updatedQuestions = currentAdminQuestions.data.map((question: QuestionWithTags) => {
          if (!variables.questionIds.includes(question.id)) {
            return question
          }

          return updateQuestionTagsOptimistically(question, variables.tagIds, variables.action, allTags)
        })

        queryClient.setQueryData(['admin-questions'], {
          ...currentAdminQuestions,
          data: updatedQuestions
        })
      }

      // Optimistically update tags with stats
      if (currentTagsWithStats) {
        const updatedTagsWithStats = updateTagStatsOptimistically(
          currentTagsWithStats, 
          variables.tagIds, 
          variables.questionIds.length, 
          variables.action
        )
        queryClient.setQueryData(['tags-with-stats'], updatedTagsWithStats)
      }

      return { previousAdminQuestions, previousTagsWithStats }
    },
    onError: (err, variables, context) => {
      // Roll back optimistic updates on error
      if (context?.previousAdminQuestions) {
        queryClient.setQueryData(['admin-questions'], context.previousAdminQuestions)
      }
      if (context?.previousTagsWithStats) {
        queryClient.setQueryData(['tags-with-stats'], context.previousTagsWithStats)
      }
      const errorContext = createErrorContext('useBulkTagAssignment', 'mutation')
      console.error('Failed to perform bulk tag assignment:', handleMutationError(err, errorContext))
    },
    onSuccess: () => {
      // Invalidate and refetch to ensure we have the latest data from server
      queryClient.invalidateQueries({ queryKey: ['questions'] })
      queryClient.invalidateQueries({ queryKey: ['admin-questions'] })
      queryClient.invalidateQueries({ queryKey: ['tags-with-stats'] })
    },
    retry: (failureCount, error) => shouldRetryWithConfig(error, failureCount),
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
  })
}

/**
 * Submit an answer attempt for a question
 */
export function useSubmitQuestionAttempt() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ questionId, data }: { questionId: string; data: QuestionAttemptData }) => 
      questionApi.submitAttempt(questionId, data),
    onMutate: async ({ questionId, data }) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ['question', questionId] })
      await queryClient.cancelQueries({ queryKey: ['questions'] })
      await queryClient.cancelQueries({ queryKey: ['user-stats'] })

      // Snapshot the previous values
      const previousQuestion = queryClient.getQueryData<QuestionWithTags>(['question', questionId])
      const previousQuestions = queryClient.getQueryData(['questions'])
      const previousUserStats = queryClient.getQueryData(['user-stats'])

      // Optimistically update the individual question
      if (previousQuestion) {
        const optimisticAttempt = createOptimisticAttempt(questionId, data.selectedAnswer)
        const isCorrect = data.selectedAnswer === previousQuestion.correctAnswer
        
        queryClient.setQueryData<QuestionWithTags>(['question', questionId], {
          ...previousQuestion,
          userAttempt: {
            ...optimisticAttempt,
            isCorrect
          },
          hasAttempted: true,
          isSolved: isCorrect
        })
      }

      // Optimistically update user stats
      const currentUserStats = queryClient.getQueryData<UserStats & { xpToNextLevel: number }>(['user-stats'])
      if (currentUserStats && previousQuestion) {
        const updatedStats = updateUserStatsOptimistically(currentUserStats, previousQuestion, data.selectedAnswer)
        // Calculate new XP to next level
        const xpToNextLevel = LevelCalculatorService.calculateXpToNextLevel(updatedStats.currentLevel, updatedStats.totalXp)
        queryClient.setQueryData<UserStats & { xpToNextLevel: number }>(['user-stats'], {
          ...updatedStats,
          xpToNextLevel
        })
      }

      // Return a context object with the snapshotted values
      return { previousQuestion, previousQuestions, previousUserStats }
    },
    onError: (err, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousQuestion) {
        queryClient.setQueryData(['question', variables.questionId], context.previousQuestion)
      }
      if (context?.previousQuestions) {
        queryClient.setQueryData(['questions'], context.previousQuestions)
      }
      if (context?.previousUserStats) {
        queryClient.setQueryData(['user-stats'], context.previousUserStats)
      }
      const errorContext = createErrorContext('useSubmitQuestionAttempt', 'mutation')
      console.error('Failed to submit question attempt:', handleMutationError(err, errorContext))
    },
    onSuccess: () => {
      // Invalidate and refetch to ensure we have the latest data from server
      queryClient.invalidateQueries({ queryKey: ['user-stats'] })
      queryClient.invalidateQueries({ queryKey: ['user-profile-stats'] })
      queryClient.invalidateQueries({ queryKey: ['questions-solved-leaderboard'] })
      queryClient.invalidateQueries({ queryKey: ['questions'] })
      queryClient.invalidateQueries({ queryKey: ['daily-question'] })
    },
    onSettled: (data, error, variables) => {
      // Always refetch the specific question after mutation settles
      queryClient.invalidateQueries({ queryKey: ['question', variables.questionId] })
    },
    retry: (failureCount, error) => shouldRetryWithConfig(error, failureCount),
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
  })
}

/**
 * Fetch a single question by ID
 */
export function useQuestion(id: string) {
  return useQuery({
    queryKey: ['question', id],
    queryFn: () => questionApi.getQuestion(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  })
}

/**
 * Get the next unanswered question ID
 */
export function useNextUnansweredQuestion() {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: ['next-unanswered-question'],
    queryFn: async (): Promise<{ questionId: string | null; remainingQuestions: number }> => {
      const res = await fetch('/api/questions/next-unanswered')
      if (!res.ok) throw new Error('Failed to fetch next unanswered question')
      return res.json()
    },
    enabled: isAuthenticated,
    staleTime: 0, // Always fetch fresh data
    refetchOnWindowFocus: false,
  })
}