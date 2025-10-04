'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useDailyQuizCheck } from '@/lib/queries'
import { LoadingState } from '@/components/shared/LoadingState'
import { EmptyState } from '@/components/shared/EmptyState'
import { AnswerOption } from '@/components/quiz/AnswerOption'
import { Button } from '@/components/ui/button'
import { ChevronLeft, Clock } from 'lucide-react'
import type { OptionKey } from '@/types'

interface DailyQuizResults {
  score: number
  totalQuestions: number
  answers: {
    questionId: string
    selectedAnswer: OptionKey
    isCorrect: boolean
    question: {
      correctAnswer: OptionKey
      explanation?: string
      text: string
      optionA: string
      optionB: string
      optionC: string
      optionD: string
    }
  }[]
}

export default function DailyQuizPage() {
  const router = useRouter()

  // Check for bypass parameter in development
  const [bypassCheck, setBypassCheck] = useState(false)

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search)
      setBypassCheck(searchParams.get('bypass') === 'true' && process.env.NODE_ENV === 'development')
    }
  }, [])

  const { data: dailyCheck, isLoading: checkLoading, error: checkError } = useDailyQuizCheck()

  const [quiz, setQuiz] = useState<{
    id: string
    title: string
    questions: {
      id: string
      text: string
      optionA: string
      optionB: string
      optionC: string
      optionD: string
    }[]
  } | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState<OptionKey | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [results, setResults] = useState<DailyQuizResults | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Load quiz when daily check is available or bypassed
  React.useEffect(() => {
    if (bypassCheck && !quiz) {
      // In bypass mode, load the daily quiz directly
      loadDailyQuizDirect()
    } else if (dailyCheck?.canTake && dailyCheck.quizId && !quiz) {
      loadQuiz(dailyCheck.quizId)
    }
  }, [dailyCheck, quiz, bypassCheck]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadDailyQuizDirect = async () => {
    setLoading(true)
    try {
      // Get daily quiz ID first
      const checkRes = await fetch('/api/daily-quiz/check')
      if (checkRes.ok) {
        const checkData = await checkRes.json()
        if (checkData.quizId) {
          await loadQuiz(checkData.quizId)
        }
      }
    } catch (error) {
      console.error('Failed to load daily quiz:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadQuiz = async (quizId: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/quiz/${quizId}`)
      if (!res.ok) throw new Error('Failed to load quiz')
      const quizData = await res.json()
      setQuiz(quizData)
    } catch (error) {
      console.error('Failed to load quiz:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!quiz || !selectedAnswer || submitting) return

    // Get quiz ID from dailyCheck or bypass mode
    const quizId = dailyCheck?.quizId || quiz.id
    if (!quizId) return

    setSubmitting(true)
    try {
      const submitData = {
        answers: [{
          questionId: quiz.questions[0].id,
          selectedAnswer: selectedAnswer
        }]
      }

      const submitUrl = bypassCheck
        ? `/api/quiz/${quizId}/submit?bypass=true`
        : `/api/quiz/${quizId}/submit`

      const res = await fetch(submitUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to submit answer')
      }

      const result = await res.json()
      setResults(result)
      setSubmitted(true)
    } catch (error) {
      console.error('Submit error:', error)
      alert(error instanceof Error ? error.message : 'Failed to submit answer')
    } finally {
      setSubmitting(false)
    }
  }

  // Loading state
  if (checkLoading || loading) {
    return (
      <div className="min-h-screen bg-bg-peach">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <LoadingState message="Loading daily quiz..." />
        </div>
      </div>
    )
  }

  // Error state
  if (checkError || !dailyCheck) {
    return (
      <div className="min-h-screen bg-bg-peach">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <EmptyState
            icon="❌"
            title="Unable to load daily quiz"
            description="There was an error loading the daily quiz. Please try again later."
            actionLabel="Back to Dashboard"
            onAction={() => router.push('/dashboard')}
          />
        </div>
      </div>
    )
  }

  // Already completed today (skip if bypassed)
  if (!bypassCheck && !dailyCheck.canTake) {
    const nextReset = dailyCheck.nextResetTime ? new Date(dailyCheck.nextResetTime) : null
    const timeLeft = nextReset ? Math.max(0, nextReset.getTime() - Date.now()) : 0
    const hours = Math.floor(timeLeft / (1000 * 60 * 60))
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60))

    return (
      <div className="min-h-screen bg-bg-peach">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-bg-cream rounded-lg border border-bg-peach p-8 text-center">
            <Clock className="w-16 h-16 mx-auto mb-4 text-primary-orange" />
            <h1 className="text-2xl font-bold text-text-primary mb-2">
              Daily Quiz Already Completed
            </h1>
            <p className="text-text-secondary mb-4">
              You&apos;ve already completed today&apos;s daily quiz. Come back tomorrow!
            </p>
            {timeLeft > 0 && (
              <p className="text-text-muted mb-6">
                Next quiz available in: {hours}h {minutes}m
              </p>
            )}
            <Button onClick={() => router.push('/dashboard')}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // No quiz loaded yet
  if (!quiz) {
    return (
      <div className="min-h-screen bg-bg-peach">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <EmptyState
            icon="📅"
            title="No daily quiz available"
            description="There is no daily quiz available right now. Please check back later."
            actionLabel="Back to Dashboard"
            onAction={() => router.push('/dashboard')}
          />
        </div>
      </div>
    )
  }

  const question = quiz.questions[0] // Daily quiz only has 1 question

  return (
    <div className="min-h-screen bg-bg-peach">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
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

        {submitted && results ? (
          /* Results View */
          <div className="space-y-8">
            {/* Score Summary */}
            <div className="bg-bg-cream rounded-lg border border-bg-peach p-8 text-center">
              <div className="w-16 h-16 bg-primary-orange rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-2xl">📅</span>
              </div>
              <h2 className="text-2xl font-bold text-text-primary mb-4">
                Daily Challenge Complete!
              </h2>
              <div className="text-4xl font-bold mb-4">
                {results.score === 1 ? (
                  <span className="text-primary-green">✓ Correct!</span>
                ) : (
                  <span className="text-primary-orange">✗ Incorrect</span>
                )}
              </div>
              <p className="text-text-secondary">
                Come back tomorrow for a new challenge!
              </p>
            </div>

            {/* Question Review */}
            <div className="space-y-6">
              <div className="bg-bg-cream rounded-lg border border-bg-peach p-6">
                <h3 className="text-lg font-semibold text-text-primary mb-4">
                  Question Review
                </h3>
                <p className="text-text-primary mb-6">
                  {question.text}
                </p>

                <div className="space-y-3">
                  {(['A', 'B', 'C', 'D'] as OptionKey[]).map((option) => (
                    <AnswerOption
                      key={option}
                      label={option}
                      text={question[`option${option}` as keyof typeof question] as string}
                      selected={false}
                      showResult={true}
                      isCorrect={option === results.answers[0].question.correctAnswer}
                      isUserAnswer={option === results.answers[0].selectedAnswer}
                      onClick={() => { }}
                    />
                  ))}
                </div>

                {results.answers[0].question.explanation && (
                  <div className="bg-primary-green-light border border-primary-green rounded-lg p-4 mt-6">
                    <h4 className="font-semibold text-primary-green-dark mb-2">
                      Explanation:
                    </h4>
                    <p className="text-text-secondary">
                      {results.answers[0].question.explanation}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Back to Dashboard */}
            <div className="text-center space-y-4">
              <Button
                onClick={() => router.push('/dashboard')}
                className="bg-primary-green hover:bg-primary-green-dark"
              >
                Back to Dashboard
              </Button>

              {/* Development reset button */}
              {process.env.NODE_ENV === 'development' && (
                <div>
                  <Button
                    onClick={() => window.location.href = '/daily-quiz?bypass=true'}
                    variant="outline"
                    className="text-sm"
                  >
                    🔧 Dev: Try Again
                  </Button>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Quiz Taking View */
          <div className="space-y-8">
            {/* Question Display */}
            <div className="bg-bg-cream rounded-lg border border-bg-peach p-8">
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 bg-primary-orange rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-2xl">📅</span>
                </div>
              </div>
              <h2 className="text-xl font-semibold text-text-primary text-center mb-6">
                Today&apos;s Challenge
              </h2>
              <p className="text-lg text-text-primary leading-relaxed text-center">
                {question.text}
              </p>
            </div>

            {/* Answer Options */}
            <div className="space-y-4">
              {(['A', 'B', 'C', 'D'] as OptionKey[]).map((option) => (
                <AnswerOption
                  key={option}
                  label={option}
                  text={question[`option${option}` as keyof typeof question] as string}
                  selected={selectedAnswer === option}
                  onClick={() => setSelectedAnswer(option)}
                />
              ))}
            </div>

            {/* Submit Button */}
            <div className="text-center pt-6">
              <Button
                onClick={handleSubmit}
                disabled={!selectedAnswer || submitting}
                className="bg-primary-green hover:bg-primary-green-dark px-8 py-3 text-lg"
              >
                {submitting ? 'Submitting...' : 'Submit Answer'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}