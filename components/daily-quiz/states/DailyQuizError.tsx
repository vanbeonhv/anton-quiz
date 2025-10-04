import { useRouter } from 'next/navigation'
import { EmptyState } from '@/components/shared/EmptyState'

export function DailyQuizError() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-bg-peach">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <EmptyState
          icon="❌"
          title="Unable to load daily quiz"
          description="There was an error loading the daily quiz. Please try again later."
          actionLabel="Back to Dashboard"
          onAction={() => router.push('/dashboard')}
        />
      </div>
    </div>
  )
}