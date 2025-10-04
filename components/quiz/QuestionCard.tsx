import { Card, CardContent, CardHeader } from '@/components/ui/card'

interface QuestionCardProps {
  question: string
  currentIndex: number
  totalQuestions: number
}

export function QuestionCard({
  question,
  currentIndex,
  totalQuestions
}: QuestionCardProps) {
  return (
    <Card className="bg-bg-cream border-bg-peach">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-text-muted">
            Question {currentIndex + 1} of {totalQuestions}
          </span>
          <span className="text-sm text-text-muted">
            {Math.round(((currentIndex + 1) / totalQuestions) * 100)}%
          </span>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <h2 className="text-xl font-semibold text-text-primary leading-relaxed">
          {question}
        </h2>
      </CardContent>
    </Card>
  )
}