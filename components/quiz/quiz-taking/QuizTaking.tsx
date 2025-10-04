import { QuizQuestion } from './QuizQuestion'
import { QuizNavigation } from './QuizNavigation'
import type { OptionKey, QuestionForTaking } from '@/types'

interface Quiz {
  questions: QuestionForTaking[]
}

interface QuizTakingProps {
  quiz: Quiz
  currentIndex: number
  answers: Record<string, OptionKey>
  submitting: boolean
  onAnswerSelect: (questionId: string, answer: OptionKey) => void
  onPrevious: () => void
  onNext: () => void
  onSubmit: () => void
}

export function QuizTaking({
  quiz,
  currentIndex,
  answers,
  submitting,
  onAnswerSelect,
  onPrevious,
  onNext,
  onSubmit
}: QuizTakingProps) {
  const currentQuestion = quiz.questions[currentIndex]
  const allAnswered = quiz.questions.every(q => answers[q.id])

  return (
    <div className="space-y-6">
      <QuizQuestion
        question={currentQuestion}
        currentIndex={currentIndex}
        totalQuestions={quiz.questions.length}
        selectedAnswer={answers[currentQuestion.id]}
        onAnswerSelect={(answer) => onAnswerSelect(currentQuestion.id, answer)}
      />

      <QuizNavigation
        currentIndex={currentIndex}
        totalQuestions={quiz.questions.length}
        currentAnswer={answers[currentQuestion.id]}
        allAnswered={allAnswered}
        submitting={submitting}
        onPrevious={onPrevious}
        onNext={onNext}
        onSubmit={onSubmit}
      />
    </div>
  )
}