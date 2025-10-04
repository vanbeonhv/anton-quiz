import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { OptionKey } from '@/types'

interface QuizNavigationProps {
  currentIndex: number
  totalQuestions: number
  currentAnswer?: OptionKey
  allAnswered: boolean
  submitting: boolean
  onPrevious: () => void
  onNext: () => void
  onSubmit: () => void
}

export function QuizNavigation({
  currentIndex,
  totalQuestions,
  currentAnswer,
  allAnswered,
  submitting,
  onPrevious,
  onNext,
  onSubmit
}: QuizNavigationProps) {
  const isLastQuestion = currentIndex === totalQuestions - 1

  return (
    <div className="flex justify-between items-center pt-6">
      <Button
        variant="outline"
        onClick={onPrevious}
        disabled={currentIndex === 0}
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        Previous
      </Button>

      {isLastQuestion ? (
        <Button
          onClick={onSubmit}
          disabled={!allAnswered || submitting}
          className="bg-primary-green hover:bg-primary-green-dark"
        >
          {submitting ? 'Submitting...' : 'Submit Quiz'}
        </Button>
      ) : (
        <Button
          onClick={onNext}
          disabled={!currentAnswer}
          className="bg-primary-green hover:bg-primary-green-dark"
        >
          Next
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      )}
    </div>
  )
}