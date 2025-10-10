import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Zap, ArrowRight, Shuffle } from 'lucide-react'
import { Difficulty } from '@/types'
import { QuestionsApiResponse } from '@/types/api'
import { Tag } from '@prisma/client'

interface QuickPracticeSectionProps {
  data?: QuestionsApiResponse
  isLoading: boolean
  onRefresh: () => void
}

export function QuickPracticeSection({ data, isLoading, onRefresh }: QuickPracticeSectionProps) {
  const router = useRouter()

  const handleQuestionClick = (questionId: string) => {
    router.push(`/questions/${questionId}`)
  }

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

  if (isLoading) {
    return (
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <Zap className="w-6 h-6 text-primary-orange" />
            Quick Practice
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  <div className="flex gap-2 mt-3">
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                    <div className="h-6 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    )
  }

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-text-primary flex items-center gap-2">
          <Zap className="w-6 h-6 text-primary-orange" />
          Quick Practice
        </h2>
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          className="flex items-center gap-2"
        >
          <Shuffle className="w-4 h-4" />
          Shuffle
        </Button>
      </div>

      {!data || data.questions.length === 0 ? (
        <Card className="bg-bg-cream border-bg-peach">
          <CardContent className="p-8 text-center">
            <div className="text-text-muted mb-4">
              <Zap className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No practice questions available at the moment.</p>
              <p className="text-sm mt-1">Check back later or browse all questions.</p>
            </div>
            <Button
              onClick={() => router.push('/questions')}
              className="bg-primary-green hover:bg-primary-green-dark text-white"
            >
              Browse All Questions
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.questions.slice(0, 4).map((question) => (
            <Card
              key={question.id}
              className="bg-bg-white border-bg-peach hover:border-primary-green hover:shadow-md transition-all duration-200 cursor-pointer group"
              onClick={() => handleQuestionClick(question.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg font-semibold text-text-primary line-clamp-2 group-hover:text-primary-green transition-colors">
                    #{question.number} {question.text.slice(0, 60)}
                    {question.text.length > 60 && '...'}
                  </CardTitle>
                  <Badge
                    variant="outline"
                    className={`ml-2 flex-shrink-0 ${getDifficultyColor(question.difficulty)}`}
                  >
                    {question.difficulty}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {/* Tags */}
                  {question.tags && question.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {question.tags.slice(0, 3).map((tag: Tag) => (
                        <Badge
                          key={tag.id}
                          variant="secondary"
                          className="text-xs bg-primary-green-light text-primary-green-dark"
                        >
                          {tag.name}
                        </Badge>
                      ))}
                      {question.tags.length > 3 && (
                        <Badge
                          variant="secondary"
                          className="text-xs bg-gray-100 text-gray-600"
                        >
                          +{question.tags.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Action */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-muted">
                      {question.userAttempt ? 'Attempted' : 'Not attempted'}
                    </span>
                    <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-primary-green transition-colors" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {data && data.questions.length > 0 && (
        <div className="mt-4 text-center">
          <Button
            variant="outline"
            onClick={() => router.push('/questions')}
            className="flex items-center gap-2 mx-auto"
          >
            View All Questions
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </section>
  )
}