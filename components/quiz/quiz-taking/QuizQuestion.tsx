import { QuestionCard } from '@/components/quiz/QuestionCard'
import { AnswerOption } from '@/components/quiz/AnswerOption'
import type { OptionKey, QuestionForTaking } from '@/types'

interface QuizQuestionProps {
  question: QuestionForTaking
  currentIndex: number
  totalQuestions: number
  selectedAnswer?: OptionKey
  onAnswerSelect: (answer: OptionKey) => void
}

export function QuizQuestion({
  question,
  currentIndex,
  totalQuestions,
  selectedAnswer,
  onAnswerSelect
}: QuizQuestionProps) {
  return (
    <div className="space-y-6">
      <QuestionCard
        question={question.text}
        currentIndex={currentIndex}
        totalQuestions={totalQuestions}
      />

      <div className="space-y-3">
        {(['A', 'B', 'C', 'D'] as OptionKey[]).map((option) => (
          <AnswerOption
            key={option}
            label={option}
            text={question[`option${option}` as keyof QuestionForTaking] as string}
            selected={selectedAnswer === option}
            onClick={() => onAnswerSelect(option)}
          />
        ))}
      </div>
    </div>
  )
}