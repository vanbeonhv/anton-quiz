import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Trophy, Medal, Award } from 'lucide-react'
import { QuestionsSolvedLeaderboardEntry } from '@/types'
import dayjs from '@/lib/dayjs'

interface LeaderboardTableProps {
  entries: QuestionsSolvedLeaderboardEntry[]
}

export function LeaderboardTable({ entries }: LeaderboardTableProps) {
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

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return <Badge className="bg-accent-yellow text-text-primary">1st Place</Badge>
      case 2:
        return <Badge className="bg-text-muted text-white">2nd Place</Badge>
      case 3:
        return <Badge className="bg-primary-orange text-white">3rd Place</Badge>
      default:
        return null
    }
  }

  const formatDate = (date: Date) => {
    return dayjs(date).format('MMM D, HH:mm')
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
    <div className="bg-bg-cream rounded-lg border border-bg-peach overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-bg-peach/50">
            <TableHead className="w-16">Rank</TableHead>
            <TableHead>User</TableHead>
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
                <div className="flex items-center gap-2">
                  {getRankIcon(entry.rank)}
                </div>
              </TableCell>

              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium text-text-primary">
                    {entry.userEmail.split('@')[0]}
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    {getRankBadge(entry.rank)}
                  </div>
                </div>
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
  )
}