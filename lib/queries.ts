import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/hooks/useAuth'
import type {
  LeaderboardEntry,
  LeaderboardFilter,
  Quiz,
  Question,
  UserStats,
  DailyQuizCheck,
  QuizWithComputedStats,
  DailyPointsLeaderboardEntry,
  QuestionsSolvedLeaderboardEntry,
  QuestionWithTags
} from '@/types'

// Fetch all quizzes
export function useQuizzes() {
  return useQuery({
    queryKey: ['quizzes'],
    queryFn: async (): Promise<QuizWithComputedStats[]> => {
      const res = await fetch('/api/quizzes')
      if (!res.ok) throw new Error('Failed to fetch quizzes')
      return res.json()
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Fetch scoreboard
export function useScoreboard(filter: LeaderboardFilter = 'all-time', limit: number = 100) {
  return useQuery({
    queryKey: ['scoreboard', filter, limit],
    queryFn: async (): Promise<LeaderboardEntry[]> => {
      const params = new URLSearchParams({
        filter,
        limit: limit.toString()
      })
      const res = await fetch(`/api/scoreboard?${params}`)
      if (!res.ok) throw new Error('Failed to fetch scoreboard')
      return res.json()
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

// Fetch recent scores for dashboard
export function useRecentScores(limit: number = 5) {
  return useScoreboard('all-time', limit)
}

// Fetch daily points leaderboard
export function useDailyPointsLeaderboard(filter: string = 'all-time', limit: number = 100) {
  return useQuery({
    queryKey: ['daily-points-leaderboard', filter, limit],
    queryFn: async (): Promise<DailyPointsLeaderboardEntry[]> => {
      const params = new URLSearchParams({
        type: 'daily-points',
        filter,
        limit: limit.toString()
      })
      const res = await fetch(`/api/scoreboard?${params}`)
      if (!res.ok) throw new Error('Failed to fetch daily points leaderboard')
      return res.json()
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
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

// Check daily quiz eligibility
export function useDailyQuizCheck() {
  return useQuery({
    queryKey: ['daily-quiz-check'],
    queryFn: async (): Promise<DailyQuizCheck> => {
      const res = await fetch('/api/daily-quiz/check')
      if (!res.ok) throw new Error('Failed to check daily quiz')
      return res.json()
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - longer to prevent duplicate calls
    refetchInterval: false, // Disable auto refetch to prevent duplicate calls
    refetchOnWindowFocus: false, // Disable refetch on window focus
  })
}

// Quiz with questions interface
interface QuizWithQuestions extends Quiz {
  questions: Omit<Question, 'correctAnswer' | 'explanation' | 'createdAt' | 'quizId'>[]
}

// Fetch quiz with questions
export function useQuiz(quizId: string) {
  return useQuery({
    queryKey: ['quiz', quizId],
    queryFn: async (): Promise<QuizWithQuestions> => {
      const res = await fetch(`/api/quiz/${quizId}`)
      if (!res.ok) throw new Error('Failed to fetch quiz')
      return res.json()
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

// Check specific quiz eligibility
export function useQuizEligibility(quizId: string) {
  return useQuery({
    queryKey: ['quiz-eligibility', quizId],
    queryFn: async (): Promise<DailyQuizCheck> => {
      const res = await fetch(`/api/quiz/${quizId}/check-daily`)
      if (!res.ok) throw new Error('Failed to check quiz eligibility')
      return res.json()
    },
    staleTime: 1 * 60 * 1000, // 1 minute
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

// Fetch random questions for quick practice
export function useRandomQuestions(limit: number = 4) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: ['random-questions', limit],
    queryFn: async () => {
      const params = new URLSearchParams({
        limit: limit.toString(),
        random: 'true'
      })
      const res = await fetch(`/api/questions?${params}`)
      if (!res.ok) throw new Error('Failed to fetch random questions')
      return res.json()
    },
    enabled: isAuthenticated,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: false,
  })
}