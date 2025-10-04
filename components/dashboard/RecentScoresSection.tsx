import { LeaderboardTable } from '@/components/dashboard/LeaderboardTable'
import { EmptyState } from '@/components/shared/EmptyState'
import { LeaderboardSkeleton } from '@/components/shared/LoadingState'
import { LeaderboardEntry } from '@/types'

interface RecentScoresSectionProps {
  data?: LeaderboardEntry[]
  isLoading: boolean
  onViewAll: () => void
}

export function RecentScoresSection({ data, isLoading, onViewAll }: RecentScoresSectionProps) {
  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-text-primary">
          Recent Scores
        </h2>
        <button
          onClick={onViewAll}
          className="text-primary-green hover:text-primary-green-dark font-medium"
        >
          View All →
        </button>
      </div>

      {isLoading ? (
        <LeaderboardSkeleton />
      ) : !data || data.length === 0 ? (
        <EmptyState
          icon="🏆"
          title="No scores yet"
          description="Be the first to complete a quiz and appear on the leaderboard!"
        />
      ) : (
        <LeaderboardTable entries={data} />
      )}
    </section>
  )
}