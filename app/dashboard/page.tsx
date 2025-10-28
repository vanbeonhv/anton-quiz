'use client'

import { useRouter } from 'next/navigation'
import { useRecentScores, useUserStats } from '@/lib/queries'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { StatsSection } from '@/components/dashboard/StatsSection'
import { RecentScoresSection } from '@/components/dashboard/RecentScoresSection'
import { DailyQuestionButton } from '@/components/dashboard/DailyQuestionButton'

export default function DashboardPage() {
  const router = useRouter()
  const { data: recentScores, isLoading: scoresLoading } = useRecentScores()
  const { data: userStats, isLoading: statsLoading } = useUserStats()

  const handleViewAllScores = () => {
    router.push('/scoreboard')
  }

  const handleViewQuestions = () => {
    router.push('/questions')
  }

  return (
    <div className="min-h-screen bg-bg-peach">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DashboardHeader />

        <StatsSection
          data={userStats}
          isLoading={statsLoading}
        />

        {/* Daily Question */}
        <div className="mb-8">
          <DailyQuestionButton />
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <div className="bg-bg-white rounded-xl shadow-sm border border-bg-peach p-6">
            <h2 className="text-xl font-semibold text-text-primary mb-4">Quick Actions</h2>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleViewAllScores}
                className="flex-1 bg-primary-blue hover:bg-primary-blue-dark text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                View Scoreboard
              </button>
              <button
                onClick={handleViewQuestions}
                className="flex-1 bg-bg-white hover:bg-gray-50 text-text-primary border-2 border-gray-200 px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Browse Questions
              </button>
            </div>
          </div>
        </div>

        <RecentScoresSection
          data={recentScores}
          isLoading={scoresLoading}
          onViewAll={handleViewAllScores}
        />
      </div>
    </div>
  )
}