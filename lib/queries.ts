import { useQuery } from '@tanstack/react-query'
import type { LeaderboardEntry, LeaderboardFilter } from '@/types'

// Quiz with stats interface
interface QuizWithStats {
  id: string
  title: string
  description: string | null
  type: 'NORMAL' | 'DAILY'
  createdAt: Date
  updatedAt: Date
  questionCount: number
  attemptCount: number
}

// Fetch all quizzes
export function useQuizzes() {
  return useQuery({
    queryKey: ['quizzes'],
    queryFn: async (): Promise<QuizWithStats[]> => {
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

// User stats interface
interface UserStats {
  expPoints: number
  ranking: number
  totalUsers: number
}

// Fetch user stats
export function useUserStats() {
  return useQuery({
    queryKey: ['user-stats'],
    queryFn: async (): Promise<UserStats> => {
      const res = await fetch('/api/user/stats')
      if (!res.ok) throw new Error('Failed to fetch user stats')
      return res.json()
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

// Daily quiz check interface
interface DailyQuizCheck {
  canTake: boolean
  quizId?: string
  nextResetTime?: string
  message: string
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
interface QuizWithQuestions {
  id: string
  title: string
  description: string | null
  type: 'NORMAL' | 'DAILY'
  createdAt: Date
  updatedAt: Date
  questions: {
    id: string
    text: string
    optionA: string
    optionB: string
    optionC: string
    optionD: string
    order: number
  }[]
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