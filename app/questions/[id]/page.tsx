'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { QuestionWithTags, OptionKey } from '@/types'
import { IndividualQuestionPage } from '@/components/questions'
import { LoadingState } from '@/components/shared/LoadingState'
import { EmptyState } from '@/components/shared/EmptyState'

export default function QuestionPage() {
  const params = useParams()
  const router = useRouter()
  const questionId = params.id as string

  const [question, setQuestion] = useState<QuestionWithTags | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!questionId) return

    const fetchQuestion = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/questions/${questionId}`)
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Question not found')
          } else {
            setError('Failed to load question')
          }
          return
        }

        const data = await response.json()
        setQuestion(data)
      } catch (err) {
        console.error('Error fetching question:', err)
        setError('Failed to load question')
      } finally {
        setLoading(false)
      }
    }

    fetchQuestion()
  }, [questionId])

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-peach">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <LoadingState message="Loading question..." />
        </div>
      </div>
    )
  }

  if (error || !question) {
    return (
      <div className="min-h-screen bg-bg-peach">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <EmptyState 
            title={error || 'Question not found'}
            description="The question you're looking for doesn't exist or has been removed."
            actionLabel="Back to Questions"
            onAction={() => router.push('/questions')}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-peach">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <IndividualQuestionPage question={question} />
      </div>
    </div>
  )
}