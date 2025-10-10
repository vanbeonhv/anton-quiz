import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/hooks/useAuth'
import type {
  UserStats,
  QuestionsSolvedLeaderboardEntry,
  Tag,
  TagWithStats
} from '@/types'
import { QuestionsApiResponse } from '@/types/api'



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
    queryFn: async (): Promise<UserStats> => {
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
    queryFn: async () => {
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