import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Clock } from 'lucide-react'

interface QuizRestrictedProps {
  nextResetTime?: string
}

export function QuizRestricted({ nextResetTime }: QuizRestrictedProps) {
  const router = useRouter()
  
  const nextReset = nextResetTime ? new Date(nextResetTime) : null
  const timeLeft = nextReset ? Math.max(0, nextReset.getTime() - Date.now()) : 0
  const hours = Math.floor(timeLeft / (1000 * 60 * 60))
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60))

  return (
    <div className="min-h-screen bg-bg-peach">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-bg-cream rounded-lg border border-bg-peach p-8 text-center">
          <Clock className="w-16 h-16 mx-auto mb-4 text-primary-orange" />
          <h1 className="text-2xl font-bold text-text-primary mb-2">
            Daily Quiz Already Completed
          </h1>
          <p className="text-text-secondary mb-4">
            You&apos;ve already completed today&apos;s daily quiz. Come back tomorrow!
          </p>
          {timeLeft > 0 && (
            <p className="text-text-muted mb-6">
              Next quiz available in: {hours}h {minutes}m
            </p>
          )}
          <Button onClick={() => router.push('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  )
}