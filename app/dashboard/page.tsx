'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Trophy, HelpCircle } from 'lucide-react'
import { useRecentScores } from '@/lib/queries'
import { useUserLevelSafe } from '@/components/providers/UserLevelProvider'
import { useDisplayNameCheck } from '@/hooks/useDisplayNameCheck'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { StatsSection } from '@/components/dashboard/StatsSection'
import { RecentScoresSection } from '@/components/dashboard/RecentScoresSection'
import { DailyQuestionButton } from '@/components/dashboard/DailyQuestionButton'
import { DisplayNameSetupModal } from '@/components/dashboard/DisplayNameSetupModal'

export default function DashboardPage() {
  const router = useRouter()
  const { data: recentScores, isLoading: scoresLoading } = useRecentScores()
  
  // Use context for user level information
  const userLevelContext = useUserLevelSafe()
  const userStats = userLevelContext?.userStats
  const statsLoading = userLevelContext?.isLoading || false

  // Display name check and modal state
  const { needsDisplayName, isLoading: checkingDisplayName, user } = useDisplayNameCheck()
  const [showModal, setShowModal] = useState(false)

  // Show modal when display name is needed
  useEffect(() => {
    if (!checkingDisplayName && needsDisplayName) {
      setShowModal(true)
    }
  }, [checkingDisplayName, needsDisplayName])

  // Generate default display name from user ID
  const defaultDisplayName = user?.id 
    ? `User-${user.id.substring(0, 8)}` 
    : 'User'

  const handleDisplayNameSuccess = () => {
    setShowModal(false)
    // Refresh page to update user data
    router.refresh()
  }

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
                className="flex-1 flex items-center justify-center gap-2 bg-primary-green hover:bg-primary-green/90 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                <Trophy className="w-5 h-5" />
                View Scoreboard
              </button>
              <button
                onClick={handleViewQuestions}
                className="flex-1 flex items-center justify-center gap-2 bg-primary-green hover:bg-primary-green/90 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                <HelpCircle className="w-5 h-5" />
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

      {/* Display Name Setup Modal */}
      {user && (
        <DisplayNameSetupModal
          isOpen={showModal}
          userId={user.id}
          defaultDisplayName={defaultDisplayName}
          onSuccess={handleDisplayNameSuccess}
        />
      )}
    </div>
  )
}