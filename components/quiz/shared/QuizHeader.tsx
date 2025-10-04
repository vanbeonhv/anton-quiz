import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ChevronLeft } from 'lucide-react'
import { ProgressBar } from '@/components/quiz/ProgressBar'

interface QuizHeaderProps {
  title: string
  description?: string | null
  current: number
  total: number
}

export function QuizHeader({ title, description, current, total }: QuizHeaderProps) {
  const router = useRouter()

  return (
    <div className="mb-8">
      <div className="flex items-center gap-4 mb-4">
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
            {title}
          </h1>
          {description && (
            <p className="text-text-secondary">{description}</p>
          )}
        </div>
      </div>

      <ProgressBar current={current} total={total} />
    </div>
  )
}