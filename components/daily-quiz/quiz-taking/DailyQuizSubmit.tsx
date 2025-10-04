import { Button } from '@/components/ui/button'
import type { OptionKey } from '@/types'

interface DailyQuizSubmitProps {
  selectedAnswer: OptionKey | null
  submitting: boolean
  onSubmit: () => void
}

export function DailyQuizSubmit({ selectedAnswer, submitting, onSubmit }: DailyQuizSubmitProps) {
  return (
    <div className="text-center pt-6">
      <Button
        onClick={onSubmit}
        disabled={!selectedAnswer || submitting}
        className="bg-primary-green hover:bg-primary-green-dark px-8 py-3 text-lg"
      >
        {submitting ? 'Submitting...' : 'Submit Answer'}
      </Button>
    </div>
  )
}