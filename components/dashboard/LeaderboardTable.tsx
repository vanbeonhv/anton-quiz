import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Trophy } from 'lucide-react'
import { QuestionsSolvedLeaderboardEntry } from '@/types'
import { RankDisplay } from '@/components/shared/RankDisplay'
import { UserWithAvatar } from '@/components/shared/UserWithAvatar'
import { LevelBadge } from '@/components/shared/LevelBadge'
import { LevelDrawer } from '@/components/shared/LevelDrawer'
import dayjs from '@/lib/dayjs'

interface LeaderboardTableProps {
  entries: QuestionsSolvedLeaderboardEntry[]
}

interface SelectedUserLevel {
  level: number
  title: string
  totalXp: number
  userEmail: string
}

/**
 * Render a leaderboard table showing users' ranks, scores, and last-updated dates.
 *
 * Displays a centered empty state with a trophy and message when `entries` is empty.
 *
 * @param entries - Array of leaderboard entries to display; each entry provides user info, rank, score, accuracy, and update timestamp.
 * @returns A JSX element rendering the leaderboard table or the empty-state message when there are no entries.
 */
export function LeaderboardTable({ entries }: LeaderboardTableProps) {
  const [selectedUserLevel, setSelectedUserLevel] = useState<SelectedUserLevel | null>(null)

  const formatDate = (date: Date) => {
    return dayjs(date).format('MMM D, HH:mm')
  }

  const handleLevelBadgeClick = (entry: QuestionsSolvedLeaderboardEntry) => {
    setSelectedUserLevel({
      level: entry.currentLevel,
      title: entry.currentTitle,
      totalXp: entry.totalXp,
      userEmail: entry.userEmail
    })
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-8 text-text-muted">
        <Trophy className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>No scores yet. Be the first to complete a quiz!</p>
      </div>
    )
  }

  return (
    <>
    <div className="bg-bg-cream rounded-lg border border-bg-peach">
      <Table>
        <TableHeader>
          <TableRow className="bg-bg-peach/50">
            <TableHead className="w-16">Rank</TableHead>
            <TableHead>User</TableHead>
            <TableHead className="hidden lg:table-cell">Level</TableHead>
            <TableHead className="hidden md:table-cell">Quiz</TableHead>
            <TableHead className="text-center">Score</TableHead>
            <TableHead className="hidden sm:table-cell text-center">Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry) => (
            <TableRow
              key={`${entry.userEmail}-${entry.updatedAt}`}
              className={`hover:bg-bg-peach/30 ${entry.rank <= 3 ? 'bg-primary-green-light/30' : ''}`}
            >
              <TableCell className="font-medium">
                <RankDisplay rank={entry.rank} />
              </TableCell>

              <TableCell>
                <UserWithAvatar
                  userId={entry.userId}
                  userEmail={entry.userEmail}
                  avatarUrl={entry.avatarUrl}
                  displayName={entry.displayName || entry.userEmail.split('@')[0]}
                  rank={entry.rank}
                />
              </TableCell>

              <TableCell className="hidden lg:table-cell">
                <LevelBadge 
                  level={entry.currentLevel} 
                  title={entry.currentTitle}
                  totalXp={entry.totalXp}
                  size="sm"
                  showIcon={false}
                  variant="clickable"
                  onClick={() => handleLevelBadgeClick(entry)}
                />
              </TableCell>

              <TableCell className="hidden md:table-cell">
                <span className="text-text-secondary text-sm">
                  Questions Solved
                </span>
              </TableCell>

              <TableCell className="text-center">
                <div className="flex flex-col items-center">
                  <span className="font-semibold text-text-primary">
                    {entry.totalCorrectAnswers}/{entry.totalQuestionsAnswered}
                  </span>
                  <span className="text-xs text-text-muted">
                    {Math.round(entry.accuracyPercentage)}%
                  </span>
                </div>
              </TableCell>

              <TableCell className="hidden sm:table-cell text-center text-sm text-text-muted">
                {formatDate(entry.updatedAt)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>

    {/* Level Drawer for viewing other users' levels */}
    {selectedUserLevel && (
      <LevelDrawer
        isOpen={!!selectedUserLevel}
        onClose={() => setSelectedUserLevel(null)}
        level={selectedUserLevel.level}
        title={selectedUserLevel.title}
        totalXp={selectedUserLevel.totalXp}
        userEmail={selectedUserLevel.userEmail}
      />
    )}
    </>
  )
}