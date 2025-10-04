import { DailyQuizQuestion } from './DailyQuizQuestion'
import { DailyQuizAnswers } from './DailyQuizAnswers'
import { DailyQuizSubmit } from './DailyQuizSubmit'
import type { OptionKey, QuizForTaking } from '@/types'

interface DailyQuizTakingProps {
  quiz: QuizForTaking
  selectedAnswer: OptionKey | null
  onAnswerSelect: (answer: OptionKey) => void
  onSubmit: () => void
  submitting: boolean
}

export function DailyQuizTaking({ 
  quiz, 
  selectedAnswer, 
  onAnswerSelect, 
  onSubmit, 
  submitting 
}: DailyQuizTakingProps) {
  const question = quiz.questions[0] // Daily quiz only has 1 question

  return (
    <div className="space-y-8">
      <DailyQuizQuestion text={question.text} />
      <DailyQuizAnswers 
        question={question}
        selectedAnswer={selectedAnswer}
        onAnswerSelect={onAnswerSelect}
      />
      <DailyQuizSubmit 
        selectedAnswer={selectedAnswer}
        submitting={submitting}
        onSubmit={onSubmit}
      />
    </div>
  )
}