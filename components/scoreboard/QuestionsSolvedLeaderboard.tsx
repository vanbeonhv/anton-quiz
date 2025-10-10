'use client'

import { useQuestionsSolvedLeaderboard } from '@/lib/queries'
import { useAuth } from '@/hooks/useAuth'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Trophy, Medal, Award, Target, TrendingUp } from 'lucide-react'
import { LeaderboardSkeleton } from '@/components/shared/LoadingState'
import { EmptyState } from '@/components/shared/EmptyState'

interface QuestionsSolvedLeaderboardProps {
  timeFilter: string
}

export function QuestionsSolvedLeaderboard({ timeFilter }: QuestionsSolvedLeaderboardProps) {
  const { user } = useAuth()
  const { data: leaderboard, isLoading, error } = useQuestionsSolvedLeaderboard(timeFilter)

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-accent-yellow" />
      case 2:
        return <Medal className="w-5 h-5 text-text-muted" />
      case 3:
        return <Award className="w-5 h-5 text-primary-orange" />
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-sm font-semibold text-text-muted">#{rank}</span>
    }
  }

  const getRankEmoji = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇'
      case 2:
        return '🥈'
      case 3:
        return '🥉'
      default:
        return null
    }
  }

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 80) return 'text-primary-green'
    if (accuracy >= 60) return 'text-accent-yellow'
    return 'text-primary-orange'
  }

  if (isLoading) {
    return <LeaderboardSkeleton />
  }

  if (error) {
    return (
      <EmptyState
        title="Failed to load leaderboard"
        description="There was an error loading the questions solved leaderboard. Please try again."
        actionLabel="Retry"
        onAction={() => window.location.reload()}
      />
    )
  }

  if (!leaderboard || leaderboard.length === 0) {
    return (
      <EmptyState
        title="No questions solved yet"
        description="Be the first to start solving questions and climb the leaderboard!"
        icon={Target}
      />
    )
  }

  return (
    <div className="bg-bg-cream rounded-lg border border-bg-peach overflow-hidden">
      <div className="p-4 bg-bg-peach/50 border-b border-bg-peach">
        <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
          <Target className="w-5 h-5 text-primary-green" />
          Questions Solved Leaderboard
        </h2>
        <p className="text-sm text-text-secondary mt-1">
          Total questions answered correctly across all activities
        </p>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="bg-bg-peach/30">
            <TableHead className="w-16">Rank</TableHead>
            <TableHead>User</TableHead>
            <TableHead className="text-center">Questions Solved</TableHead>
            <TableHead className="text-center hidden sm:table-cell">Accuracy</TableHead>
            <TableHead className="text-center hidden md:table-cell">Total Attempted</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leaderboard.map((entry) => {
            const isCurrentUser = user?.email === entry.userEmail
            const rankEmoji = getRankEmoji(entry.rank)
            const accuracyColor = getAccuracyColor(entry.accuracyPercentage)

            return (
              <TableRow
                key={`${entry.userId}-${entry.rank}`}
                className={`
                  hover:bg-bg-peach/30 transition-colors
                  ${entry.rank <= 3 ? 'bg-primary-green-light/30' : ''}
                  ${isCurrentUser ? 'bg-primary-green-light/50 border-l-4 border-primary-green' : ''}
                `}
              >
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {getRankIcon(entry.rank)}
                    {rankEmoji && <span className="text-lg">{rankEmoji}</span>}
                  </div>
                </TableCell>

                <TableCell>
                  <div className="flex flex-col">
                    <span className={`font-medium ${isCurrentUser ? 'text-primary-green font-semibold' : 'text-text-primary'}`}>
                      {entry.userEmail.split('@')[0]}
                      {isCurrentUser && <span className="text-xs ml-2 text-primary-green">(You)</span>}
                    </span>
                    {entry.rank <= 3 && (
                      <span className="text-xs text-text-muted mt-1">
                        Top solver
                      </span>
                    )}
                  </div>
                </TableCell>

                <TableCell className="text-center">
                  <div className="flex flex-col items-center">
                    <span className="font-semibold text-text-primary text-lg">
                      {entry.totalCorrectAnswers}
                    </span>
                    <span className="text-xs text-text-muted">
                      solved
                    </span>
                  </div>
                </TableCell>

                <TableCell className="text-center hidden sm:table-cell">
                  <div className="flex items-center justify-center gap-1">
                    <TrendingUp className={`w-4 h-4 ${accuracyColor}`} />
                    <span className={`font-medium ${accuracyColor}`}>
                      {entry.accuracyPercentage}%
                    </span>
                  </div>
                </TableCell>

                <TableCell className="text-center hidden md:table-cell">
                  <div className="flex flex-col items-center">
                    <span className="font-medium text-text-primary">
                      {entry.totalQuestionsAnswered}
                    </span>
                    <span className="text-xs text-text-muted">
                      attempted
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}