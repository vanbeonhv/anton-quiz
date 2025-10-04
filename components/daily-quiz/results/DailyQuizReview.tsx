import type { OptionKey, QuizResults } from '@/types'

interface Question {
  text: string
  optionA: string
  optionB: string
  optionC: string
  optionD: string
}

interface DailyQuizReviewProps {
  question: Question
  results: QuizResults
}

export function DailyQuizReview({ question, results }: DailyQuizReviewProps) {
  const answer = results.answers[0]

  return (
    <div className="bg-bg-cream rounded-lg border border-bg-peach p-4">
      <h3 className="text-base font-semibold text-text-primary mb-3">
        Question Review
      </h3>
      <p className="text-text-primary mb-4 text-sm">
        {question.text}
      </p>

      <div className="space-y-2">
        {(['A', 'B', 'C', 'D'] as OptionKey[]).map((option) => (
          <div
            key={option}
            className={`flex items-center gap-3 p-2 rounded-lg text-sm ${
              option === answer.question.correctAnswer
                ? 'bg-primary-green text-white'
                : option === answer.selectedAnswer && option !== answer.question.correctAnswer
                ? 'bg-primary-orange text-white'
                : 'bg-bg-peach text-text-secondary'
            }`}
          >
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-semibold flex-shrink-0 ${
              option === answer.question.correctAnswer ||
              (option === answer.selectedAnswer && option !== answer.question.correctAnswer)
                ? 'border-white bg-white text-current'
                : 'border-current'
            }`}>
              {option}
            </div>
            <span className="flex-1 text-xs">
              {question[`option${option}` as keyof Question] as string}
            </span>
            {option === answer.question.correctAnswer && (
              <span className="text-white text-sm">✓</span>
            )}
            {option === answer.selectedAnswer && option !== answer.question.correctAnswer && (
              <span className="text-white text-sm">✗</span>
            )}
          </div>
        ))}
      </div>

      {answer.question.explanation && (
        <div className="bg-primary-green-light border border-primary-green rounded-lg p-3 mt-3">
          <h4 className="font-semibold text-primary-green-dark mb-1 text-sm">
            Explanation:
          </h4>
          <p className="text-text-secondary text-xs">
            {answer.question.explanation}
          </p>
        </div>
      )}
    </div>
  )
}