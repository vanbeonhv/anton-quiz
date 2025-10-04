'use client'

import { useDailyQuizLogic } from '@/hooks/useDailyQuizLogic'
import { DailyQuizLoading } from '@/components/daily-quiz/states/DailyQuizLoading'
import { DailyQuizError } from '@/components/daily-quiz/states/DailyQuizError'
import { DailyQuizCompleted } from '@/components/daily-quiz/states/DailyQuizCompleted'
import { DailyQuizUnavailable } from '@/components/daily-quiz/states/DailyQuizUnavailable'
import { DailyQuizHeader } from '@/components/daily-quiz/shared/DailyQuizHeader'
import { DailyQuizTaking } from '@/components/daily-quiz/quiz-taking/DailyQuizTaking'
import { DailyQuizResults } from '@/components/daily-quiz/results/DailyQuizResults'

export default function DailyQuizPage() {
  const {
    bypassCheck,
    dailyCheck,
    checkLoading,
    checkError,
    quiz,
    loading,
    selectedAnswer,
    submitted,
    results,
    submitting,
    setSelectedAnswer,
    handleSubmit
  } = useDailyQuizLogic()

  // Loading state
  if (checkLoading || loading) return <DailyQuizLoading />

  // Error state
  if (checkError || !dailyCheck) return <DailyQuizError />

  // Already completed today (skip if bypassed)
  if (!bypassCheck && !dailyCheck.canTake) {
    return <DailyQuizCompleted nextResetTime={dailyCheck.nextResetTime} />
  }

  // No quiz loaded yet
  if (!quiz) return <DailyQuizUnavailable />

  return (
    <div className="min-h-screen bg-bg-peach">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DailyQuizHeader />

        {submitted && results ? (
          <DailyQuizResults quiz={quiz} results={results} />
        ) : (
          <DailyQuizTaking
            quiz={quiz}
            selectedAnswer={selectedAnswer}
            onAnswerSelect={setSelectedAnswer}
            onSubmit={handleSubmit}
            submitting={submitting}
          />
        )}
      </div>
    </div>
  )
}