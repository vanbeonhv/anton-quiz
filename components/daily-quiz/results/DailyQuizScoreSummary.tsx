interface DailyQuizScoreSummaryProps {
  score: number
}

export function DailyQuizScoreSummary({ score }: DailyQuizScoreSummaryProps) {
  return (
    <div className="bg-bg-cream rounded-lg border border-bg-peach p-4">
      <div className="flex items-center gap-4 mb-3">
        <div className="w-12 h-12 bg-primary-orange rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-lg">📅</span>
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-bold text-text-primary">
            Daily Challenge Complete!
          </h2>
          <div className="text-2xl font-bold">
            {score === 1 ? (
              <span className="text-primary-green">✓ Correct!</span>
            ) : (
              <span className="text-primary-orange">✗ Incorrect</span>
            )}
          </div>
        </div>
      </div>
      <p className="text-text-secondary text-sm text-center">
        Come back tomorrow for a new challenge!
      </p>
    </div>
  )
}