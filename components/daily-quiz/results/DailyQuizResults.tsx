import { DailyQuizScoreSummary } from './DailyQuizScoreSummary'
import { DailyQuizReview } from './DailyQuizReview'
import { DailyQuizActions } from './DailyQuizActions'
import type { QuizForTaking, QuizResults } from '@/types'

interface DailyQuizResultsProps {
  quiz: QuizForTaking
  results: QuizResults
}

export function DailyQuizResults({ quiz, results }: DailyQuizResultsProps) {
  const question = quiz.questions[0] // Daily quiz only has 1 question

  return (
    <div className="space-y-4">
      <DailyQuizScoreSummary score={results.score} />
      <DailyQuizReview question={question} results={results} />
      <DailyQuizActions />
    </div>
  )
}