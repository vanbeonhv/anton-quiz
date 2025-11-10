import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Edit, Trash2 } from 'lucide-react'
import { QuestionWithTags } from '@/types'
import { MarkdownText } from '@/lib/utils/markdown'
import { getDifficultyColor } from '@/lib/utils/question'

interface QuestionCardProps {
  question: QuestionWithTags
  onEdit: (question: QuestionWithTags) => void
  onDelete: (question: QuestionWithTags) => void
  isLoading?: boolean
}

export function QuestionCard({ question, onEdit, onDelete, isLoading = false }: QuestionCardProps) {
  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline">#{question.number}</Badge>
            <Badge className={getDifficultyColor(question.difficulty)}>
              {question.difficulty}
            </Badge>
            {!question.isActive && <Badge variant="destructive">Inactive</Badge>}
          </div>
          <p className="text-sm mb-2">
            <MarkdownText>{question.text}</MarkdownText>
          </p>
          <div className="flex flex-wrap gap-1 mb-2">
            {question.tags.map((tag) => (
              <Badge key={tag.id} variant="secondary" className="text-xs">
                {tag.name}
              </Badge>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(question)}
            disabled={isLoading}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(question)}
            disabled={isLoading}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          A: <MarkdownText>{question.optionA}</MarkdownText>
        </div>
        <div>
          B: <MarkdownText>{question.optionB}</MarkdownText>
        </div>
        <div>
          C: <MarkdownText>{question.optionC}</MarkdownText>
        </div>
        <div>
          D: <MarkdownText>{question.optionD}</MarkdownText>
        </div>
      </div>
      <div className="mt-2 text-sm text-green-600">Correct: {question.correctAnswer}</div>
    </div>
  )
}
