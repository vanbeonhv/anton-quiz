'use client'

import Link from 'next/link'
import { CheckCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { QuestionWithTags, Difficulty } from '@/types'

interface QuestionCardProps {
  question: QuestionWithTags
}

export function QuestionCard({ question }: QuestionCardProps) {
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

  // Get preview text (first 100 characters)
  const previewText = question.text.length > 100 
    ? question.text.substring(0, 100) + '...'
    : question.text

  // Show max 3 tags, with "+X more" if there are more
  const visibleTags = question.tags.slice(0, 3)
  const remainingTagsCount = question.tags.length - 3

  const isSolved = question.userAttempt?.isCorrect === true

  return (
    <Link href={`/questions/${question.id}`}>
      <Card className="bg-bg-white border-bg-peach hover:border-primary-green hover:shadow-md transition-all duration-200 cursor-pointer group">
        <CardContent className="p-6">
          {/* Header with question number and solved status */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold text-text-primary">
                #{question.number}
              </span>
              <Badge 
                variant="outline" 
                className={`text-xs font-medium ${getDifficultyColor(question.difficulty)}`}
              >
                {question.difficulty.toLowerCase()}
              </Badge>
            </div>
            
            {isSolved && (
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            )}
          </div>

          {/* Question preview text */}
          <div className="mb-4">
            <p className="text-text-primary text-sm leading-relaxed group-hover:text-primary-green transition-colors duration-200">
              {previewText}
            </p>
          </div>

          {/* Tags */}
          {question.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {visibleTags.map((tag) => (
                <Badge
                  key={tag.id}
                  variant="outline"
                  className="text-xs px-2 py-1 border"
                  style={getTagColor(tag)}
                >
                  {tag.name}
                </Badge>
              ))}
              
              {remainingTagsCount > 0 && (
                <Badge
                  variant="outline"
                  className="text-xs px-2 py-1 bg-gray-50 text-gray-600 border-gray-200"
                >
                  +{remainingTagsCount} more
                </Badge>
              )}
            </div>
          )}

          {/* Attempt status indicator */}
          {question.userAttempt && (
            <div className="mt-3 pt-3 border-t border-bg-peach">
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-muted">
                  {isSolved ? 'Solved' : 'Attempted'}
                </span>
                <span className={`font-medium ${
                  isSolved ? 'text-green-600' : 'text-red-600'
                }`}>
                  {isSolved ? '✓' : '✗'}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}