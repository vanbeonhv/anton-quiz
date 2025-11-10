'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronRight, ArrowLeft, Trophy } from 'lucide-react'
import { QuestionWithTags, OptionKey, Difficulty, UserProgress } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AnswerOption } from './AnswerOption'
import { LoadingOverlay } from '@/components/shared/LoadingOverlay'
import { XpGainModal, LevelUpModal } from '@/components/shared'
import { useSubmitQuestionAttempt, useNextUnansweredQuestion } from '@/lib/queries'
import { DAILY_POINTS } from '@/lib/utils/dailyQuestion'
import { toast } from 'sonner'
import { MarkdownText } from '@/lib/utils/markdown'

interface IndividualQuestionPageProps {
  question: QuestionWithTags
  isDailyQuestion?: boolean
}

interface QuestionResult {
  selectedAnswer: OptionKey
  isCorrect: boolean
  correctAnswer: OptionKey
  explanation?: string
  xpEarned?: number
  userProgress?: UserProgress
}

export function IndividualQuestionPage({ question, isDailyQuestion = false }: IndividualQuestionPageProps) {
  const router = useRouter()
  const [selectedAnswer, setSelectedAnswer] = useState<OptionKey | null>(null)
  const [result, setResult] = useState<QuestionResult | null>(null)
  const [showXpModal, setShowXpModal] = useState(false)
  const [showLevelUpModal, setShowLevelUpModal] = useState(false)
  const [previousLevel, setPreviousLevel] = useState<number>(1)
  const [previousTitle, setPreviousTitle] = useState<string>('Newbie')

  const submitAttemptMutation = useSubmitQuestionAttempt()
  const { data: nextQuestionData, refetch: refetchNextQuestion, isFetching: isLoadingNextQuestion } = useNextUnansweredQuestion()

  // Calculate daily points based on difficulty
  const dailyPoints = isDailyQuestion ? DAILY_POINTS[question.difficulty] : 0

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
        data: {
          selectedAnswer,
          ...(isDailyQuestion && { isDailyQuestion: true })
        }
      },
      {
        onSuccess: (data) => {
          // Store previous level info for level-up modal
          if (data.userProgress) {
            setPreviousLevel(data.userProgress.leveledUp ? data.userProgress.currentLevel - 1 : data.userProgress.currentLevel)
            setPreviousTitle(data.userProgress.leveledUp && data.userProgress.newTitle ?
              // Calculate previous title (simplified - in real app you'd store this)
              data.userProgress.currentLevel === 2 ? 'Newbie' : 'Previous Title' :
              data.userProgress.currentTitle
            )
          }

          setResult({
            selectedAnswer: data.selectedAnswer,
            isCorrect: data.isCorrect,
            correctAnswer: data.question.correctAnswer,
            explanation: data.question.explanation,
            xpEarned: data.xpEarned,
            userProgress: data.userProgress
          })

          // Refetch next question data since user has now attempted this question
          refetchNextQuestion()

          // Show XP modal first if XP was earned
          if (data.xpEarned > 0) {
            setTimeout(() => setShowXpModal(true), 500)
          }

          // Show special success message for daily questions
          if (isDailyQuestion && data.isCorrect) {
            toast.success(`🎉 Daily Challenge Complete! +${dailyPoints} points`)
          } else {
            toast.success(data.isCorrect ? 'Correct answer! 🎉' : 'Answer submitted')
          }
        },
        onError: (error) => {
          console.error('Error submitting answer:', error)
          const errorMessage = error instanceof Error ? error.message : 'Failed to submit answer'
          toast.error(errorMessage)
        }
      }
    )
  }

  const handleBackToQuestions = () => {
    router.push(isDailyQuestion ? '/dashboard' : '/questions')
  }

  const handleNextQuestion = async () => {
    // For daily questions, go back to dashboard
    if (isDailyQuestion) {
      router.push('/dashboard')
      return
    }

    // For regular questions, try to get next unanswered question
    try {
      const { data } = await refetchNextQuestion()
      if (data?.questionId) {
        router.push(`/questions/${data.questionId}`)
      } else {
        // No more unanswered questions, show success message and go back to questions
        toast.success('🎉 Congratulations! You have answered all available questions!')
        router.push('/questions')
      }
    } catch (error) {
      console.error('Failed to get next question:', error)
      toast.error('Failed to load next question')
      router.push('/questions')
    }
  }

  const handleXpModalClose = () => {
    setShowXpModal(false)
    // Show level-up modal if user leveled up
    if (result?.userProgress?.leveledUp) {
      setTimeout(() => setShowLevelUpModal(true), 300)
    }
  }

  const handleLevelUpModalClose = () => {
    setShowLevelUpModal(false)
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
          {isDailyQuestion ? 'Dashboard' : 'Questions'}
        </button>

        {isDailyQuestion ? (
          <>
            <ChevronRight className="w-4 h-4" />
            <span className="text-text-primary font-medium">
              Daily Challenge
            </span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-text-primary font-medium">
              Question #{question.number}
            </span>
          </>
        ) : (
          <>
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
          </>
        )}
      </nav>

      {/* Question Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            <h1 className="text-2xl font-bold text-text-primary">
              {isDailyQuestion ? 'Daily Challenge' : `Question #${question.number}`}
            </h1>
            <Badge
              variant="outline"
              className={`text-sm font-medium ${getDifficultyColor(question.difficulty)}`}
            >
              {question.difficulty.toLowerCase()}
            </Badge>
            {isDailyQuestion && (
              <Badge className="bg-primary-orange/10 text-primary-orange border-primary-orange/30 flex items-center gap-1">
                <Trophy className="w-3 h-3" />
                {dailyPoints} points
              </Badge>
            )}
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
            <h2 className="text-lg text-text-primary leading-relaxed">
              <MarkdownText>{question.text}</MarkdownText>
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

          {/* Submit Button and Result Area with Loading Overlay */}
          <LoadingOverlay isLoading={submitAttemptMutation.isPending}>
            <div className="space-y-6">
              {/* Submit Button */}
              {!result && !hasAttempted && (
                <div className="flex justify-center">
                  <Button
                    onClick={handleSubmit}
                    disabled={!selectedAnswer}
                    className="px-8 py-3 bg-primary-green hover:bg-primary-green/90 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Submit Answer
                  </Button>
                </div>
              )}

              {/* Already Attempted Message */}
              {hasAttempted && !result && (
                <div className="text-center">
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${isSolved
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
                  <div className="text-center space-y-2">
                    <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg text-lg font-semibold ${result.isCorrect
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                      }`}>
                      {result.isCorrect ? '🎉 Correct!' : '❌ Incorrect'}
                    </div>
                    {isDailyQuestion && result.isCorrect && (
                      <div className="text-primary-orange font-medium flex items-center justify-center gap-2">
                        <Trophy className="w-4 h-4" />
                        You earned {dailyPoints} daily points!
                      </div>
                    )}
                  </div>

                  {/* Explanation */}
                  {result.explanation && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                      <h3 className="font-semibold text-blue-900 mb-2">Explanation</h3>
                      <p className="text-blue-800 leading-relaxed">
                        <MarkdownText>{result.explanation}</MarkdownText>
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
                      {isDailyQuestion ? 'Back to Dashboard' : 'Back to Questions'}
                    </Button>
                    <Button
                      onClick={handleNextQuestion}
                      disabled={isLoadingNextQuestion || (nextQuestionData?.remainingQuestions === 0)}
                      className="px-6 py-2 bg-primary-green hover:bg-primary-green/90 text-white disabled:opacity-50"
                    >
                      {isLoadingNextQuestion ? 'Loading...' : 
                        isDailyQuestion ? 'Next Question' :
                        nextQuestionData?.remainingQuestions !== undefined ? 
                          nextQuestionData.remainingQuestions > 0 ?
                            `Next Question (${nextQuestionData.remainingQuestions} remaining)` :
                            'All Questions Completed!' :
                          'Next Unanswered Question'
                      }
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </LoadingOverlay>
        </CardContent>
      </Card>

      {/* XP Gain Modal */}
      {result?.xpEarned !== undefined && result?.userProgress && (
        <XpGainModal
          isOpen={showXpModal}
          onClose={handleXpModalClose}
          xpEarned={result.xpEarned}
          userProgress={result.userProgress}
        />
      )}

      {/* Level Up Modal */}
      {result?.userProgress && (
        <LevelUpModal
          isOpen={showLevelUpModal}
          onClose={handleLevelUpModalClose}
          userProgress={result.userProgress}
          previousLevel={previousLevel}
          previousTitle={previousTitle}
        />
      )}
    </div>
  )
}