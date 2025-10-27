interface RankDisplayProps {
  rank: number
  className?: string
}

export function RankDisplay({ rank, className = '' }: RankDisplayProps) {
  const getMedalOrRank = (rank: number): string => {
    switch (rank) {
      case 1:
        return '🥇'
      case 2:
        return '🥈'
      case 3:
        return '🥉'
      default:
        return `#${rank}`
    }
  }

  const isMedal = rank >= 1 && rank <= 3

  return (
    <div
      className={`flex items-center justify-center ${className}`}
      aria-label={
        isMedal
          ? `${rank === 1 ? 'Gold' : rank === 2 ? 'Silver' : 'Bronze'} medal - Rank ${rank}`
          : `Rank ${rank}`
      }
    >
      <span
        className={isMedal ? 'text-[20px]' : 'font-medium text-muted-foreground'}
      >
        {getMedalOrRank(rank)}
      </span>
    </div>
  )
}
