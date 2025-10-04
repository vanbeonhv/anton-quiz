import { DailyQuizCard } from './DailyQuizCard'

interface PracticeSectionProps {
  data?: {
    canTake: boolean
    nextResetTime?: string
  }
  isLoading: boolean
  onDailyQuizClick: () => void
}

export function PracticeSection({ data, isLoading, onDailyQuizClick }: PracticeSectionProps) {
  return (
    <section className="mb-8">
      <h2 className="text-xl font-semibold text-text-primary mb-4 flex items-center gap-2">
        👑 Practice More
      </h2>

      {isLoading ? (
        <div className="bg-primary-green rounded-2xl p-6 animate-pulse">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-primary-green-light rounded-full"></div>
              <div>
                <div className="h-8 bg-primary-green-light rounded w-32 mb-2"></div>
                <div className="h-4 bg-primary-green-light rounded w-48"></div>
              </div>
            </div>
            <div className="w-8 h-8 bg-primary-green-light rounded"></div>
          </div>
        </div>
      ) : (
        <DailyQuizCard
          onClick={onDailyQuizClick}
          canTake={data?.canTake || false}
          nextResetTime={data?.nextResetTime ? new Date(data.nextResetTime) : undefined}
        />
      )}
    </section>
  )
}