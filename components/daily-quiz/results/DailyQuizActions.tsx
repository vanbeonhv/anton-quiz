import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export function DailyQuizActions() {
  const router = useRouter()

  return (
    <div className="flex gap-3 justify-center">
      <Button
        onClick={() => router.push('/dashboard')}
        className="bg-primary-green hover:bg-primary-green-dark"
      >
        Back to Dashboard
      </Button>

      {/* Development reset button */}
      {process.env.NODE_ENV === 'development' && (
        <Button
          onClick={() => window.location.href = '/daily-quiz?bypass=true'}
          variant="outline"
          size="sm"
        >
          🔧 Try Again
        </Button>
      )}
    </div>
  )
}