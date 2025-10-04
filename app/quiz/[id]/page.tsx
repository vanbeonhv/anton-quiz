'use client'

import { useQuizLogic } from '@/hooks/useQuizLogic'
import { QuizLoading } from '@/components/quiz/states/QuizLoading'
import { QuizNotFound } from '@/components/quiz/states/QuizNotFound'
import { QuizRestricted } from '@/components/quiz/states/QuizRestricted'
import { QuizHeader } from '@/components/quiz/shared/QuizHeader'
import { QuizTaking } from '@/components/quiz/quiz-taking/QuizTaking'
import { QuizResults } from '@/components/quiz/results/QuizResults'

interface QuizPageProps {
  params: {
    id: string
  }
}

export default function QuizPage({ params }: QuizPageProps) {
  const { id: quizId } = params

  const {
    quiz,
    eligibility,
    quizLoading,
    eligibilityLoading,
    quizError,
    currentIndex,
    answers,
    submitted,
    results,
    submitting,
    handleAnswerSelect,
    goToNext,
    goToPrevious,
    handleSubmit
  } = useQuizLogic(quizId)

  // Loading states
  if (quizLoading || eligibilityLoading) {
    return <QuizLoading />
  }

  // Error states
  if (quizError || !quiz) {
    return <QuizNotFound />
  }

  // Daily quiz restriction
  if (eligibility && !eligibility.canTake && !submitted) {
    return <QuizRestricted nextResetTime={eligibility.nextResetTime} />
  }

  return (
    <div className="min-h-screen bg-bg-peach">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <QuizHeader
          title={quiz.title}
          description={quiz.description}
          current={submitted ? quiz.questions.length : currentIndex + 1}
          total={quiz.questions.length}
        />

        {submitted && results ? (
          <QuizResults quiz={quiz} results={results} />
        ) : (
          <QuizTaking
            quiz={quiz}
            currentIndex={currentIndex}
            answers={answers}
            submitting={submitting}
            onAnswerSelect={handleAnswerSelect}
            onPrevious={goToPrevious}
            onNext={goToNext}
            onSubmit={handleSubmit}
          />
        )}
      </div>
    </div>
  )
}