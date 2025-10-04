import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ChevronLeft } from 'lucide-react'

export function DailyQuizHeader() {
  const router = useRouter()

  return (
    <div className="mb-8">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push('/dashboard')}
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            Daily Challenge
          </h1>
          <p className="text-text-secondary">
            Complete today&apos;s challenge question
          </p>
        </div>
      </div>
    </div>
  )
}