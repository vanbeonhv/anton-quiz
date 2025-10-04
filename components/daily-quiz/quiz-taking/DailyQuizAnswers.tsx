import { AnswerOption } from '@/components/quiz/AnswerOption'
import type { OptionKey, QuestionForTaking } from '@/types'

interface DailyQuizAnswersProps {
  question: QuestionForTaking
  selectedAnswer: OptionKey | null
  onAnswerSelect: (answer: OptionKey) => void
}

export function DailyQuizAnswers({ question, selectedAnswer, onAnswerSelect }: DailyQuizAnswersProps) {
  return (
    <div className="space-y-4">
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
  )
}