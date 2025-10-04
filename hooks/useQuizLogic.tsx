import { useState } from 'react'
import { useQuiz, useQuizEligibility } from '@/lib/queries'
import type { OptionKey, QuizResults } from '@/types'

export function useQuizLogic(quizId: string) {
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

  return {
    // Data
    quiz,
    eligibility,
    quizLoading,
    eligibilityLoading,
    quizError,
    
    // State
    currentIndex,
    answers,
    submitted,
    results,
    submitting,
    
    // Actions
    handleAnswerSelect,
    goToNext,
    goToPrevious,
    handleSubmit
  }
}