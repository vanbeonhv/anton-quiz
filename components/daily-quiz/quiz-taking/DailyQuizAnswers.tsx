import { AnswerOption } from '@/components/quiz/AnswerOption'
import type { OptionKey } from '@/types'

interface Question {
  optionA: string
  optionB: string
  optionC: string
  optionD: string
}

interface DailyQuizAnswersProps {
  question: Question
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
          text={question[`option${option}` as keyof Question] as string}
          selected={selectedAnswer === option}
          onClick={() => onAnswerSelect(option)}
        />
      ))}
    </div>
  )
}