'use client'

import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { Calendar, Clock, CheckCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { LoadingState } from '@/components/shared/LoadingState'
import { DailyQuestionInfo, Difficulty } from '@/types'

interface DailyQuestionButtonProps {
  className?: string
}

export function DailyQuestionButton({ className = '' }: DailyQuestionButtonProps) {
  const router = useRouter()
  const [countdown, setCountdown] = useState<string>('')

  // Fetch daily question info
  const { data, isLoading, error } = useQuery<DailyQuestionInfo>({
    queryKey: ['daily-question'],
    queryFn: async () => {
      const res = await fetch('/api/daily-question')
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to fetch daily question')
      }
      return res.json()
    },
    staleTime: 60 * 1000, // 1 minute
    refetchInterval: 60 * 1000, // Refetch every minute to update countdown
  })

  // Update countdown timer every minute
  useEffect(() => {
    if (!data?.resetTime) return

    const updateCountdown = () => {
      const now = new Date()
      const reset = new Date(data.resetTime)
      const diffMs = reset.getTime() - now.getTime()

      if (diffMs <= 0) {
        setCountdown('0m')
        return
      }

      const diffMinutes = Math.floor(diffMs / (1000 * 60))
      const hours = Math.floor(diffMinutes / 60)
      const minutes = diffMinutes % 60

      if (hours > 0) {
        setCountdown(`${hours}h ${minutes}m`)
      } else {
        setCountdown(`${minutes}m`)
      }
    }

    // Update immediately
    updateCountdown()

    // Update every minute
    const interval = setInterval(updateCountdown, 60 * 1000)

    return () => clearInterval(interval)
  }, [data?.resetTime])

  const getDifficultyColor = (difficulty: Difficulty) => {
    switch (difficulty) {
      case 'EASY':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'HARD':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const handleClick = () => {
    router.push('/daily')
  }

  // Loading state
  if (isLoading) {
    return (
      <div className={`bg-bg-white rounded-xl shadow-sm border border-bg-peach p-6 ${className}`}>
        <LoadingState message="Loading daily question..." size="sm" />
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className={`bg-bg-white rounded-xl shadow-sm border border-bg-peach p-6 ${className}`}>
        <div className="text-center">
          <p className="text-text-secondary text-sm">
            {error instanceof Error ? error.message : 'Failed to load daily question'}
          </p>
        </div>
      </div>
    )
  }

  // No data state
  if (!data) {
    return null
  }

  return (
    <div className={`bg-bg-white rounded-xl shadow-sm border border-bg-peach p-6 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Left side: Daily Question info */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-primary-green" />
            <h2 className="text-xl font-semibold text-text-primary">Daily Question</h2>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <Badge 
              variant="outline" 
              className={`text-xs font-medium ${getDifficultyColor(data.difficulty)}`}
            >
              {data.difficulty.toLowerCase()}
            </Badge>
            <span className="text-sm text-text-secondary">#{data.number}</span>
          </div>

          {/* Countdown timer */}
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <Clock className="w-4 h-4" />
            <span>Resets in {countdown || data.timeUntilReset}</span>
          </div>
        </div>

        {/* Right side: Action button */}
        <div className="flex flex-col gap-2">
          {data.isCompleted ? (
            <div className="flex items-center gap-2 px-6 py-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-green-700 font-medium">Completed!</span>
            </div>
          ) : data.hasAttempted ? (
            <button
              onClick={handleClick}
              className="px-6 py-3 bg-primary-orange hover:bg-primary-orange-dark text-white rounded-lg font-medium transition-colors"
            >
              Try Again
            </button>
          ) : (
            <button
              onClick={handleClick}
              className="px-6 py-3 bg-primary-green hover:bg-primary-green-dark text-white rounded-lg font-medium transition-colors"
            >
              Start Challenge
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
