'use client'

import { useRouter } from 'next/navigation'
import { useQuizzes, useRecentScores } from '@/lib/queries'
import { QuizCard } from '@/components/quiz/QuizCard'
import { LeaderboardTable } from '@/components/quiz/LeaderboardTable'
import { EmptyState } from '@/components/shared/EmptyState'
import { QuizCardSkeleton, LeaderboardSkeleton } from '@/components/shared/LoadingState'

export default function DashboardPage() {
  const router = useRouter()
  const { data: quizzes, isLoading: quizzesLoading, error: quizzesError } = useQuizzes()
  const { data: recentScores, isLoading: scoresLoading } = useRecentScores()

  const handleQuizClick = (quizId: string) => {
    router.push(`/quiz/${quizId}`)
  }

  return (
    <div className="min-h-screen bg-bg-peach">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            Welcome to QuizApp
          </h1>
          <p className="text-text-secondary">
            Choose a quiz to test your knowledge
          </p>
        </div>

        {/* Quizzes Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-text-primary mb-6">
            Available Quizzes
          </h2>

          {quizzesError ? (
            <div className="bg-accent-red/10 border border-accent-red rounded-lg p-4 text-accent-red">
              <p className="font-medium">Error loading quizzes</p>
              <p className="text-sm mt-1">Please try again later</p>
            </div>
          ) : quizzesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <QuizCardSkeleton key={i} />
              ))}
            </div>
          ) : !quizzes || quizzes.length === 0 ? (
            <EmptyState
              icon="📝"
              title="No quizzes available"
              description="There are no quizzes to take right now. Check back later!"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {quizzes.map((quiz) => (
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
            <h2 className="text-2xl font-semibold text-text-primary">
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