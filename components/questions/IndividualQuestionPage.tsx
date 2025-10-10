'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronRight, ArrowLeft } from 'lucide-react'
import { QuestionWithTags, OptionKey, Difficulty } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AnswerOption } from './AnswerOption'
import { useSubmitQuestionAttempt } from '@/lib/queries'
import { toast } from 'sonner'

interface IndividualQuestionPageProps {
  question: QuestionWithTags
}

interface QuestionResult {
  selectedAnswer: OptionKey
  isCorrect: boolean
  correctAnswer: OptionKey
  explanation?: string
}

export function IndividualQuestionPage({ question }: IndividualQuestionPageProps) {
  const router = useRouter()
  const [selectedAnswer, setSelectedAnswer] = useState<OptionKey | null>(null)
  const [result, setResult] = useState<QuestionResult | null>(null)
  
  const submitAttemptMutation = useSubmitQuestionAttempt()

  const getDifficultyColor = (difficulty: Difficulty) => {
    switch (difficulty) {
      case 'EASY':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'HARD':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getTagColor = (tag: any) => {
    if (tag.color) {
      return {
        backgroundColor: `${tag.color}15`,
        color: tag.color,
        borderColor: `${tag.color}30`
      }
    }
    return {
      backgroundColor: '#f3f4f6',
      color: '#6b7280',
      borderColor: '#e5e7eb'
    }
  }

  const handleAnswerSelect = (answer: OptionKey) => {
    if (result) return // Don't allow changes after submission
    setSelectedAnswer(answer)
  }

  const handleSubmit = () => {
    if (!selectedAnswer || submitAttemptMutation.isPending || result) return

    submitAttemptMutation.mutate(
      { 
        questionId: question.id, 
        data: { selectedAnswer } 
      },
      {
        onSuccess: (data) => {
          setResult({
            selectedAnswer: data.selectedAnswer,
            isCorrect: data.isCorrect,
            correctAnswer: data.question.correctAnswer,
            explanation: data.question.explanation
          })
          toast.success(data.isCorrect ? 'Correct answer! 🎉' : 'Answer submitted')
        },
        onError: (error) => {
          console.error('Error submitting answer:', error)
          toast.error(error instanceof Error ? error.message : 'Failed to submit answer')
        }
      }
    )
  }

  const handleBackToQuestions = () => {
    router.push('/questions')
  }

  const handleNextQuestion = () => {
    // For now, just go back to questions list
    // In a future enhancement, this could navigate to the next question
    router.push('/questions')
  }

  // Check if user has already attempted this question
  const hasAttempted = question.userAttempt !== null
  const isSolved = question.userAttempt?.isCorrect === true

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center space-x-2 text-sm text-text-secondary">
        <button
          onClick={handleBackToQuestions}
          className="hover:text-primary-green transition-colors duration-200 flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" />
          Questions
        </button>
        
        {question.tags.length > 0 && (
          <>
            <ChevronRight className="w-4 h-4" />
            <span className="text-text-primary font-medium">
              {question.tags[0].name}
            </span>
          </>
        )}
        
        <ChevronRight className="w-4 h-4" />
        <span className="text-text-primary font-medium">
          Question #{question.number}
        </span>
      </nav>

      {/* Question Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-text-primary">
              Question #{question.number}
            </h1>
            <Badge 
              variant="outline" 
              className={`text-sm font-medium ${getDifficultyColor(question.difficulty)}`}
            >
              {question.difficulty.toLowerCase()}
            </Badge>
          </div>

          {isSolved && (
            <Badge className="bg-green-100 text-green-800 border-green-200">
              ✓ Solved
            </Badge>
          )}
        </div>

        {/* Tags */}
        {question.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {question.tags.map((tag) => (
              <Badge
                key={tag.id}
                variant="outline"
                className="text-sm px-3 py-1 border"
                style={getTagColor(tag)}
              >
                {tag.name}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Question Content */}
      <Card className="bg-bg-white border-bg-peach">
        <CardContent className="p-8">
          {/* Question Text */}
          <div className="mb-8">
            <h2 className="text-lg font-medium text-text-primary leading-relaxed">
              {question.text}
            </h2>
          </div>

          {/* Answer Options */}
          <div className="space-y-4 mb-8">
            {(['A', 'B', 'C', 'D'] as const).map((option) => (
              <AnswerOption
                key={option}
                label={option}
                text={question[`option${option}` as keyof QuestionWithTags] as string}
                selected={selectedAnswer === option}
                showResult={!!result}
                isCorrect={result?.correctAnswer === option}
                isUserAnswer={result?.selectedAnswer === option}
                onClick={() => handleAnswerSelect(option)}
              />
            ))}
          </div>

          {/* Submit Button */}
          {!result && !hasAttempted && (
            <div className="flex justify-center">
              <Button
                onClick={handleSubmit}
                disabled={!selectedAnswer || submitAttemptMutation.isPending}
                className="px-8 py-3 bg-primary-green hover:bg-primary-green/90 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitAttemptMutation.isPending ? 'Submitting...' : 'Submit Answer'}
              </Button>
            </div>
          )}

          {/* Already Attempted Message */}
          {hasAttempted && !result && (
            <div className="text-center">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${
                isSolved 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-orange-100 text-orange-800'
              }`}>
                <span className="font-medium">
                  {isSolved ? '✓ You have already solved this question' : '✗ You have already attempted this question'}
                </span>
              </div>
            </div>
          )}

          {/* Result Display */}
          {result && (
            <div className="space-y-6 border-t border-bg-peach pt-8">
              {/* Result Status */}
              <div className="text-center">
                <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg text-lg font-semibold ${
                  result.isCorrect 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {result.isCorrect ? '🎉 Correct!' : '❌ Incorrect'}
                </div>
              </div>

              {/* Explanation */}
              {result.explanation && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="font-semibold text-blue-900 mb-2">Explanation</h3>
                  <p className="text-blue-800 leading-relaxed">
                    {result.explanation}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-center gap-4">
                <Button
                  onClick={handleBackToQuestions}
                  variant="outline"
                  className="px-6 py-2 border-primary-green text-primary-green hover:bg-primary-green hover:text-white"
                >
                  Back to Questions
                </Button>
                <Button
                  onClick={handleNextQuestion}
                  className="px-6 py-2 bg-primary-green hover:bg-primary-green/90 text-white"
                >
                  Next Question
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}