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