'use client'

import { useAuth } from '@/hooks/useAuth'
import { useUserProfileStats } from '@/lib/queries'
import { LoadingState } from '@/components/shared'
import { 
  UserProfileHeader,
  StatsOverviewGrid,
  ProgressByTagSection,
  RecentActivityTimeline,
  AchievementSection
} from '@/components/profile'

// Activity types for recent activity timeline
interface QuestionActivity {
  type: 'question'
  id: string
  date: Date
  isCorrect: boolean
  question: {
    id: string
    number: number
    text: string
  }
}

interface UserProfileContentProps {
  userId?: string
}

/**
 * Render profile content for a specific user, handling loading and error states.
 *
 * Fetches user statistics for the provided `userId` (or the authenticated user when `userId` is omitted)
 * and renders a loading indicator, an error message, or the full profile sections when data is available.
 *
 * @param userId - Optional user identifier to display; if omitted, the currently authenticated user's id is used
 * @returns A React element rendering either a loading indicator, an error message, or the user's profile content
 */
export function UserProfileContent({ userId }: UserProfileContentProps) {
  const { user } = useAuth()
  const id = userId || user?.id
  const { data: userStats, isLoading, error } = useUserProfileStats(id)

  if (isLoading) {
    return <LoadingState message="Loading your profile..." />
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
        displayName={userStats.displayName}
        avatarUrl={userStats.avatarUrl}
        joinDate={userStats.createdAt}
      />
      
      <StatsOverviewGrid userStats={userStats} />
      
      <ProgressByTagSection tagStats={userStats.tagStats} />
      
      <RecentActivityTimeline activities={userStats.recentActivity} />
      
      <AchievementSection />
    </div>
  )
}