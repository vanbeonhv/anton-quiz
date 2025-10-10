'use client'

import { useAuth } from '@/hooks/useAuth'
import { useUserProfileStats } from '@/lib/queries'
import { 
  UserProfileHeader,
  StatsOverviewGrid,
  ProgressByTagSection,
  RecentActivityTimeline,
  AchievementSection
} from '@/components/profile'
import type { UserStatsWithComputed } from '@/types'

// Activity types for recent activity timeline
interface QuestionActivity {
  type: 'question'
  id: string
  date: Date
  isCorrect: boolean
  source: 'INDIVIDUAL'
  question: {
    id: string
    number: number
    text: string
  }
}

type Activity = QuestionActivity

export function UserProfileContent() {
  const { user } = useAuth()
  const { data: userStats, isLoading, error } = useUserProfileStats(user?.id)

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (error || !userStats) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Failed to load user statistics</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <UserProfileHeader 
        userEmail={userStats.userEmail}
        joinDate={userStats.createdAt}
      />
      
      <StatsOverviewGrid userStats={userStats} />
      
      <ProgressByTagSection tagStats={userStats.tagStats} />
      
      <RecentActivityTimeline activities={userStats.recentActivity} />
      
      <AchievementSection />
    </div>
  )
}