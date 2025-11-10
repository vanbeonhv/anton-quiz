import { QuestionWithTags } from '@/types'
import { QuestionCard } from './QuestionCard'

interface QuestionListProps {
  questions: QuestionWithTags[]
  onEdit: (question: QuestionWithTags) => void
  onDelete: (question: QuestionWithTags) => void
  isLoading?: boolean
}

export function QuestionList({ questions, onEdit, onDelete, isLoading = false }: QuestionListProps) {
  if (questions.length === 0) {
    return (
      <div className="text-center py-8 text-text-secondary">
        No questions found. Create your first question to get started.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {questions.map((question) => (
        <QuestionCard
          key={question.id}
          question={question}
          onEdit={onEdit}
          onDelete={onDelete}
          isLoading={isLoading}
        />
      ))}
    </div>
  )
}
