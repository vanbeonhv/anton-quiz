'use client'

import { useRouter } from 'next/navigation'
import { useQuizzes, useRecentScores, useUserStats, useDailyQuizCheck } from '@/lib/queries'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { StatsSection } from '@/components/dashboard/StatsSection'
import { PracticeSection } from '@/components/dashboard/PracticeSection'
import { QuizTopicsSection } from '@/components/dashboard/QuizTopicsSection'
import { RecentScoresSection } from '@/components/dashboard/RecentScoresSection'

export default function DashboardPage() {
  const router = useRouter()
  const { data: quizzes, isLoading: quizzesLoading, error: quizzesError } = useQuizzes()
  const { data: recentScores, isLoading: scoresLoading } = useRecentScores()
  const { data: userStats, isLoading: statsLoading } = useUserStats()
  const { data: dailyQuizCheck, isLoading: dailyLoading } = useDailyQuizCheck()

  const handleQuizClick = (quizId: string) => {
    router.push(`/quiz/${quizId}`)
  }

  const handleDailyQuizClick = () => {
    router.push('/daily-quiz')
  }

  const handleViewAllScores = () => {
    router.push('/scoreboard')
  }

  return (
    <div className="min-h-screen bg-bg-peach">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DashboardHeader />

        <StatsSection
          data={userStats}
          isLoading={statsLoading}
        />

        <PracticeSection
          data={dailyQuizCheck}
          isLoading={dailyLoading}
          onDailyQuizClick={handleDailyQuizClick}
        />

        <QuizTopicsSection
          data={quizzes}
          isLoading={quizzesLoading}
          error={quizzesError}
          onQuizClick={handleQuizClick}
        />

        <RecentScoresSection
          data={recentScores}
          isLoading={scoresLoading}
          onViewAll={handleViewAllScores}
        />
      </div>
    </div>
  )
}