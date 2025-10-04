interface QuizScoreSummaryProps {
  score: number
  totalQuestions: number
}

export function QuizScoreSummary({ score, totalQuestions }: QuizScoreSummaryProps) {
  const percentage = Math.round((score / totalQuestions) * 100)

  return (
    <div className="bg-bg-cream rounded-lg border border-bg-peach p-6 text-center">
      <h2 className="text-2xl font-bold text-text-primary mb-2">
        Quiz Complete!
      </h2>
      <div className="text-4xl font-bold text-primary-green mb-2">
        {score}/{totalQuestions}
      </div>
      <p className="text-text-secondary">
        {percentage}% Correct
      </p>
    </div>
  )
}