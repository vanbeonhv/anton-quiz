import { useRouter } from 'next/navigation'
import { EmptyState } from '@/components/shared/EmptyState'

export function QuizNotFound() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-bg-peach">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <EmptyState
          icon="❌"
          title="Quiz not found"
          description="The quiz you're looking for doesn't exist or has been removed."
          actionLabel="Back to Dashboard"
          onAction={() => router.push('/dashboard')}
        />
      </div>
    </div>
  )
}