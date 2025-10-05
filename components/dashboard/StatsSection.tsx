import { UserStatsCard } from './UserStatsCard'

interface StatsSectionProps {
  data?: {
    // Temporary field for type fix. Need to update design later. 
    totalDailyPoints: number
    totalCorrectAnswers: number
  }
  isLoading: boolean
}

export function StatsSection({ data, isLoading }: StatsSectionProps) {
  if (isLoading) {
    return (
      <section className="mb-8">
        <div className="bg-primary-orange rounded-2xl p-6 animate-pulse">
          <div className="flex justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary-orange-light rounded-full"></div>
              <div>
                <div className="h-8 bg-primary-orange-light rounded w-20 mb-2"></div>
                <div className="h-4 bg-primary-orange-light rounded w-16"></div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary-orange-light rounded-full"></div>
              <div>
                <div className="h-8 bg-primary-orange-light rounded w-12 mb-2"></div>
                <div className="h-4 bg-primary-orange-light rounded w-16"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="mb-8">
      <UserStatsCard
        expPoints={data?.totalDailyPoints || 0}
        ranking={data?.totalCorrectAnswers || 0}
      />
    </section>
  )
}