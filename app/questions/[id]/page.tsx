'use client'

import { useParams, useRouter } from 'next/navigation'
import { IndividualQuestionPage } from '@/components/questions'
import { LoadingState } from '@/components/shared/LoadingState'
import { EmptyState } from '@/components/shared/EmptyState'
import { useQuestion } from '@/lib/queries'

export default function QuestionPage() {
  const params = useParams()
  const router = useRouter()
  const questionId = params.id as string

  const { 
    data: question, 
    isLoading: loading, 
    error,
    isError 
  } = useQuestion(questionId)

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-peach">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <LoadingState message="Loading question..." />
        </div>
      </div>
    )
  }

  if (isError || !question) {
    const errorMessage = error instanceof Error 
      ? (error.message.includes('404') ? 'Question not found' : 'Failed to load question')
      : 'Question not found'
      
    return (
      <div className="min-h-screen bg-bg-peach">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <EmptyState 
            title={errorMessage}
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