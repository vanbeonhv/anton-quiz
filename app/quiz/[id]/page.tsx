'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuiz, useQuizEligibility } from '@/lib/queries'
import { QuestionCard } from '@/components/quiz/QuestionCard'
import { AnswerOption } from '@/components/quiz/AnswerOption'
import { ProgressBar } from '@/components/quiz/ProgressBar'
import { LoadingState } from '@/components/shared/LoadingState'
import { EmptyState } from '@/components/shared/EmptyState'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react'
import type { OptionKey } from '@/types'

interface QuizPageProps {
  params: {
    id: string
  }
}

interface QuizResults {
  score: number
  totalQuestions: number
  answers: {
    questionId: string
    selectedAnswer: OptionKey
    isCorrect: boolean
    question: {
      correctAnswer: OptionKey
      explanation?: string
    }
  }[]
}

export default function QuizPage({ params }: QuizPageProps) {
  const router = useRouter()
  const { id: quizId } = params

  const { data: quiz, isLoading: quizLoading, error: quizError } = useQuiz(quizId)
  const { data: eligibility, isLoading: eligibilityLoading } = useQuizEligibility(quizId)

  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, OptionKey>>({})
  const [submitted, setSubmitted] = useState(false)
  const [results, setResults] = useState<QuizResults | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Handle answer selection
  const handleAnswerSelect = (questionId: string, selectedAnswer: OptionKey) => {
    if (submitted) return

    setAnswers(prev => ({
      ...prev,
      [questionId]: selectedAnswer
    }))
  }

  // Navigation
  const goToNext = () => {
    if (quiz && currentIndex < quiz.questions.length - 1) {
      setCurrentIndex(prev => prev + 1)
    }
  }

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
    }
  }

  // Submit quiz
  const handleSubmit = async () => {
    if (!quiz || submitting) return

    setSubmitting(true)
    try {
      const submitData = {
        answers: quiz.questions.map(q => ({
          questionId: q.id,
          selectedAnswer: answers[q.id] || 'A'
        }))
      }

      const res = await fetch(`/api/quiz/${quizId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to submit quiz')
      }

      const result = await res.json()
      setResults(result)
      setSubmitted(true)
    } catch (error) {
      console.error('Submit error:', error)
      alert(error instanceof Error ? error.message : 'Failed to submit quiz')
    } finally {
      setSubmitting(false)
    }
  }

  // Loading states
  if (quizLoading || eligibilityLoading) {
    return (
      <div className="min-h-screen bg-bg-peach">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <LoadingState message="Loading quiz..." />
        </div>
      </div>
    )
  }

  // Error states
  if (quizError || !quiz) {
    return (
      <div className="min-h-screen bg-bg-peach">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <EmptyState
            icon="❌"
            title="Quiz not found"
            description="The quiz you're looking for doesn't exist or has been removed."
            actionLabel="Back to Dashboard"
            onAction={() => router.push('/dashboard')}
          />
        </div>
      </div>
    )
  }

  // Daily quiz restriction
  if (eligibility && !eligibility.canTake && !submitted) {
    const nextReset = eligibility.nextResetTime ? new Date(eligibility.nextResetTime) : null
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

  const currentQuestion = quiz.questions[currentIndex]
  const isLastQuestion = currentIndex === quiz.questions.length - 1
  const allAnswered = quiz.questions.every(q => answers[q.id])

  return (
    <div className="min-h-screen bg-bg-peach">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
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
                {quiz.title}
              </h1>
              {quiz.description && (
                <p className="text-text-secondary">{quiz.description}</p>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <ProgressBar
            current={submitted ? quiz.questions.length : currentIndex + 1}
            total={quiz.questions.length}
          />
        </div>

        {submitted && results ? (
          /* Results View */
          <div className="space-y-8">
            {/* Score Summary */}
            <div className="bg-bg-cream rounded-lg border border-bg-peach p-6 text-center">
              <h2 className="text-2xl font-bold text-text-primary mb-2">
                Quiz Complete!
              </h2>
              <div className="text-4xl font-bold text-primary-green mb-2">
                {results.score}/{results.totalQuestions}
              </div>
              <p className="text-text-secondary">
                {Math.round((results.score / results.totalQuestions) * 100)}% Correct
              </p>
            </div>

            {/* All Questions with Results */}
            <div className="space-y-6">
              {quiz.questions.map((question, index) => {
                const userAnswer = results.answers.find((a) => a.questionId === question.id)
                const correctAnswer = userAnswer?.question.correctAnswer

                return (
                  <div key={question.id} className="space-y-4">
                    <QuestionCard
                      question={question.text}
                      currentIndex={index}
                      totalQuestions={quiz.questions.length}
                    />

                    <div className="space-y-3">
                      {(['A', 'B', 'C', 'D'] as OptionKey[]).map((option) => (
                        <AnswerOption
                          key={option}
                          label={option}
                          text={question[`option${option}` as keyof typeof question] as string}
                          selected={false}
                          showResult={true}
                          isCorrect={option === correctAnswer}
                          isUserAnswer={option === userAnswer?.selectedAnswer}
                          onClick={() => { }}
                        />
                      ))}
                    </div>

                    {userAnswer?.question.explanation && (
                      <div className="bg-primary-green-light border border-primary-green rounded-lg p-4">
                        <h4 className="font-semibold text-primary-green-dark mb-2">
                          Explanation:
                        </h4>
                        <p className="text-text-secondary">
                          {userAnswer.question.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Back to Dashboard */}
            <div className="text-center">
              <Button
                onClick={() => router.push('/dashboard')}
                className="bg-primary-green hover:bg-primary-green-dark"
              >
                Back to Dashboard
              </Button>
            </div>
          </div>
        ) : (
          /* Quiz Taking View */
          <div className="space-y-6">
            {/* Current Question */}
            <QuestionCard
              question={currentQuestion.text}
              currentIndex={currentIndex}
              totalQuestions={quiz.questions.length}
            />

            {/* Answer Options */}
            <div className="space-y-3">
              {(['A', 'B', 'C', 'D'] as OptionKey[]).map((option) => (
                <AnswerOption
                  key={option}
                  label={option}
                  text={currentQuestion[`option${option}` as keyof typeof currentQuestion] as string}
                  selected={answers[currentQuestion.id] === option}
                  onClick={() => handleAnswerSelect(currentQuestion.id, option)}
                />
              ))}
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center pt-6">
              <Button
                variant="outline"
                onClick={goToPrevious}
                disabled={currentIndex === 0}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>

              {isLastQuestion ? (
                <Button
                  onClick={handleSubmit}
                  disabled={!allAnswered || submitting}
                  className="bg-primary-green hover:bg-primary-green-dark"
                >
                  {submitting ? 'Submitting...' : 'Submit Quiz'}
                </Button>
              ) : (
                <Button
                  onClick={goToNext}
                  disabled={!answers[currentQuestion.id]}
                  className="bg-primary-green hover:bg-primary-green-dark"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}