import { QuizCard } from '@/components/quiz/QuizCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { QuizCardSkeleton } from '@/components/shared/LoadingState'
import type { QuizWithComputedStats } from '@/types'

interface QuizTopicsSectionProps {
  data?: QuizWithComputedStats[]
  isLoading: boolean
  error?: Error | null
  onQuizClick: (quizId: string) => void
}

export function QuizTopicsSection({ data, isLoading, error, onQuizClick }: QuizTopicsSectionProps) {
  // Filter out daily quizzes from regular quiz list
  const regularQuizzes = data?.filter(quiz => quiz.type === 'NORMAL') || []

  return (
    <section className="mb-12">
      <h2 className="text-xl font-semibold text-text-primary mb-6">
        Quiz Topics
      </h2>

      {error ? (
        <div className="bg-accent-red/10 border border-accent-red rounded-lg p-4 text-accent-red">
          <p className="font-medium">Error loading quizzes</p>
          <p className="text-sm mt-1">Please try again later</p>
        </div>
      ) : isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <QuizCardSkeleton key={i} />
          ))}
        </div>
      ) : regularQuizzes.length === 0 ? (
        <EmptyState
          icon="📝"
          title="No quizzes available"
          description="There are no quizzes to take right now. Check back later!"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {regularQuizzes.map((quiz) => (
            <QuizCard
              key={quiz.id}
              id={quiz.id}
              title={quiz.title}
              description={quiz.description}
              type={quiz.type}
              questionCount={quiz.questionCount}
              attemptCount={quiz.attemptCount}
              onClick={() => onQuizClick(quiz.id)}
            />
          ))}
        </div>
      )}
    </section>
  )
}