import { LoadingState } from '@/components/shared/LoadingState'

export function QuizLoading() {
  return (
    <div className="min-h-screen bg-bg-peach">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <LoadingState message="Loading quiz..." />
      </div>
    </div>
  )
}