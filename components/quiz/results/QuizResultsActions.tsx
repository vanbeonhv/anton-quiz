import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export function QuizResultsActions() {
    const router = useRouter()

    return (
        <div className="text-center">
            <Button
                onClick={() => router.push('/dashboard')}
                className="bg-primary-green hover:bg-primary-green-dark"
            >
                Back to Dashboard
            </Button>
        </div>
    )
}