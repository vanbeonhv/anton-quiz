'use client'

import { useRouter } from 'next/navigation'
import { useQuizzes, useRecentScores, useUserStats, useDailyQuizCheck } from '@/lib/queries'
import { QuizCard } from '@/components/quiz/QuizCard'
import { LeaderboardTable } from '@/components/quiz/LeaderboardTable'
import { EmptyState } from '@/components/shared/EmptyState'
import { QuizCardSkeleton, LeaderboardSkeleton } from '@/components/shared/LoadingState'
import { UserStatsCard } from '@/components/dashboard/UserStatsCard'
import { DailyQuizCard } from '@/components/dashboard/DailyQuizCard'

export default function DashboardPage() {
  const router = useRouter()
  const { data: quizzes, isLoading: quizzesLoading, error: quizzesError } = useQuizzes()
  const { data: recentScores, isLoading: scoresLoading } = useRecentScores()
  const { data: userStats, isLoading: statsLoading } = useUserStats()
  const { data: dailyQuizCheck, isLoading: dailyLoading } = useDailyQuizCheck()

  const handleQuizClick = (quizId: string) => {
    router.push(`/quiz/${quizId}`)
  }

  const handleDailyQuizClick = () => {
    router.push('/daily-quiz')
  }

  // Filter out daily quizzes from regular quiz list
  const regularQuizzes = quizzes?.filter(quiz => quiz.type === 'NORMAL') || []

  return (
    <div className="min-h-screen bg-bg-peach">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            Welcome to QuizApp
          </h1>
          <p className="text-text-secondary">
            Choose a quiz to test your knowledge
          </p>
        </div>

        {/* User Stats */}
        <section className="mb-8">
          {statsLoading ? (
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
          ) : (
            <UserStatsCard 
              expPoints={userStats?.expPoints || 0}
              ranking={userStats?.ranking || 0}
            />
          )}
        </section>

        {/* Practice More Section */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-text-primary mb-4 flex items-center gap-2">
            👑 Practice More
          </h2>

          {/* Daily Quiz */}
          {dailyLoading ? (
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
              onClick={handleDailyQuizClick}
              canTake={dailyQuizCheck?.canTake || false}
              nextResetTime={dailyQuizCheck?.nextResetTime ? new Date(dailyQuizCheck.nextResetTime) : undefined}
            />
          )}
        </section>

        {/* Regular Quizzes Section */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-text-primary mb-6">
            Quiz Topics
          </h2>

          {quizzesError ? (
            <div className="bg-accent-red/10 border border-accent-red rounded-lg p-4 text-accent-red">
              <p className="font-medium">Error loading quizzes</p>
              <p className="text-sm mt-1">Please try again later</p>
            </div>
          ) : quizzesLoading ? (
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
                  onClick={() => handleQuizClick(quiz.id)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Recent Scores Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-text-primary">
              Recent Scores
            </h2>
            <button
              onClick={() => router.push('/scoreboard')}
              className="text-primary-green hover:text-primary-green-dark font-medium"
            >
              View All →
            </button>
          </div>

          {scoresLoading ? (
            <LeaderboardSkeleton />
          ) : !recentScores || recentScores.length === 0 ? (
            <EmptyState
              icon="🏆"
              title="No scores yet"
              description="Be the first to complete a quiz and appear on the leaderboard!"
            />
          ) : (
            <LeaderboardTable entries={recentScores} />
          )}
        </section>
      </div>
    </div>
  )
}