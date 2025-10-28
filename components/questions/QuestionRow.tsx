'use client'

import Link from 'next/link'
import { CheckCircle, XCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { QuestionWithTags, Difficulty } from '@/types'
import { cn } from '@/lib/utils'
import { useTextTruncation } from '@/hooks/useTextTruncation'
import { MarkdownText } from '@/lib/utils/markdown'

interface QuestionRowProps {
  question: QuestionWithTags
  className?: string
}

interface TitleWithTooltipProps {
  text: string
}

function TitleWithTooltip({ text }: TitleWithTooltipProps) {
  const { isTruncated, elementRef } = useTextTruncation<HTMLParagraphElement>(text)

  const titleElement = (
    <div className="flex items-center px-3 min-w-0 max-w-[260px]" role="cell">
      <p 
        ref={elementRef}
        className="text-sm text-gray-900 group-hover:text-blue-600 transition-colors duration-200 truncate"
      >
        <MarkdownText>{text}</MarkdownText>
      </p>
    </div>
  )

  if (!isTruncated) {
    return titleElement
  }

  return (
    <Tooltip delayDuration={300}>
      <TooltipTrigger asChild>
        {titleElement}
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-md">
        <p className="text-sm">
          <MarkdownText>{text}</MarkdownText>
        </p>
      </TooltipContent>
    </Tooltip>
  )
}

interface TagWithTooltipProps {
  tag: any
  getTagColor: (tag: any) => any
}

function TagWithTooltip({ tag, getTagColor }: TagWithTooltipProps) {
  const { isTruncated, elementRef } = useTextTruncation<HTMLSpanElement>(tag.name)

  const tagElement = (
    <span ref={elementRef} className="inline-block max-w-[80px] truncate">
      <Badge
        variant="outline"
        className="tag-badge text-xs px-1.5 py-0.5 border flex-shrink-0 truncate"
        style={getTagColor(tag)}
      >
        {tag.name}
      </Badge>
    </span>
  )

  if (!isTruncated) {
    return tagElement
  }

  return (
    <Tooltip delayDuration={300}>
      <TooltipTrigger asChild>
        {tagElement}
      </TooltipTrigger>
      <TooltipContent side="top">
        <p className="text-sm">{tag.name}</p>
      </TooltipContent>
    </Tooltip>
  )
}

export function QuestionRow({ question, className }: QuestionRowProps) {
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

  // Compact tag display logic - show max 2 tags with smart truncation
  const getCompactTagDisplay = () => {
    if (question.tags.length === 0) return { visibleTags: [], remainingCount: 0 }
    
    // Calculate available space and determine how many tags to show
    // Account for padding, gaps, and "+X" indicator space
    const availableWidth = 200 - 16 // 200px column - 16px padding
    const gapWidth = 4 // 1rem gap between badges
    const plusIndicatorWidth = 32 // Approximate width of "+X" badge
    
    let totalWidth = 0
    let maxVisibleTags = 0
    
    // Calculate how many tags can fit
    for (let i = 0; i < question.tags.length && i < 3; i++) {
      const tag = question.tags[i]
      // Estimate tag width: ~8px per character + 12px padding + 2px border
      const estimatedTagWidth = Math.min(tag.name.length * 8 + 14, 80) // Max 80px per tag
      const widthWithGap = estimatedTagWidth + (i > 0 ? gapWidth : 0)
      
      // Check if we need space for "+X" indicator
      const needsPlusIndicator = question.tags.length > i + 1
      const requiredWidth = totalWidth + widthWithGap + (needsPlusIndicator ? plusIndicatorWidth + gapWidth : 0)
      
      if (requiredWidth <= availableWidth) {
        totalWidth += widthWithGap
        maxVisibleTags = i + 1
      } else {
        break
      }
    }
    
    // Ensure we show at least 1 tag if there are any tags
    maxVisibleTags = Math.max(maxVisibleTags, question.tags.length > 0 ? 1 : 0)
    
    const visibleTags = question.tags.slice(0, maxVisibleTags)
    const remainingCount = Math.max(0, question.tags.length - maxVisibleTags)
    
    return { visibleTags, remainingCount }
  }

  const { visibleTags, remainingCount } = getCompactTagDisplay()

  const isSolved = question.userAttempt?.isCorrect === true
  const isAttempted = question.userAttempt !== null && question.userAttempt !== undefined
  const isAttemptedButNotSolved = isAttempted && !isSolved

  return (
    <Link href={`/questions/${question.id}`} className={cn("block", className)}>
      <div className="question-table-grid h-[60px] px-4 py-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 active:bg-gray-100 transition-colors duration-200 cursor-pointer group touch-manipulation" role="row">
        {/* Status Column - 40px */}
        <div className="flex items-center justify-center" role="cell" aria-label={isSolved ? "Solved" : isAttemptedButNotSolved ? "Attempted but not solved" : "Not attempted"}>
          {isSolved && (
            <CheckCircle className="w-5 h-5 text-green-600" />
          )}
          {isAttemptedButNotSolved && (
            <XCircle className="w-5 h-5 text-red-500" />
          )}
        </div>

        {/* Mobile Stacked Content - Only visible on mobile */}
        <div className="md:hidden mobile-stacked-content" role="cell">
          {/* Top row: Question number + Title */}
          <div className="mobile-row-top">
            <span className="mobile-question-number text-sm">
              #{question.number}
            </span>
            <div className="mobile-question-title min-w-0 flex-1">
              <p className="text-sm text-gray-900 group-hover:text-blue-600 transition-colors duration-200 truncate">
                <MarkdownText>{question.text}</MarkdownText>
              </p>
            </div>
          </div>
          
          {/* Bottom row: Difficulty + Limited tags */}
          <div className="mobile-row-bottom">
            <div className="mobile-difficulty">
              <Badge 
                variant="outline" 
                className={`text-xs font-medium ${getDifficultyColor(question.difficulty)}`}
              >
                {question.difficulty.toLowerCase()}
              </Badge>
            </div>
            
            {/* Show only first 2 tags on mobile */}
            {question.tags.length > 0 && (
              <div className="flex items-center gap-1 min-w-0">
                {question.tags.slice(0, 2).map((tag) => (
                  <Badge
                    key={tag.id}
                    variant="outline"
                    className="text-xs px-1.5 py-0.5 border flex-shrink-0 max-w-[60px] truncate"
                    style={getTagColor(tag)}
                  >
                    {tag.name}
                  </Badge>
                ))}
                {question.tags.length > 2 && (
                  <span className="text-xs text-gray-500 flex-shrink-0">
                    +{question.tags.length - 2}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Desktop Layout - Hidden on mobile */}
        {/* Number Column - 80px */}
        <div className="hidden md:flex items-center" role="cell">
          <span className="text-sm font-bold text-gray-900">
            #{question.number}
          </span>
        </div>

        {/* Title Column - Flexible */}
        <div className="hidden md:block">
          <TitleWithTooltip text={question.text} />
        </div>

        {/* Difficulty Column - 100px */}
        <div className="hidden md:flex items-center justify-center px-2" role="cell">
          <Badge 
            variant="outline" 
            className={`text-xs font-medium ${getDifficultyColor(question.difficulty)}`}
          >
            {question.difficulty.toLowerCase()}
          </Badge>
        </div>

        {/* Success Rate Column - 120px (placeholder for now) */}
        <div className="hidden lg:flex items-center justify-center px-2" role="cell">
          <span className="text-xs text-gray-500">
            {/* Placeholder - will be implemented in later tasks */}
            --
          </span>
        </div>

        {/* Tags Column - 200px */}
        <div className="hidden md:flex items-center px-2 min-w-0" role="cell">
          <div className="tag-container flex items-center gap-1 overflow-hidden w-full">
            {visibleTags.map((tag) => (
              <TagWithTooltip key={tag.id} tag={tag} getTagColor={getTagColor} />
            ))}
            
            {remainingCount > 0 && (
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <Badge
                    variant="outline"
                    className="tag-badge text-xs px-1.5 py-0.5 bg-gray-50 text-gray-600 border-gray-200 flex-shrink-0"
                  >
                    +{remainingCount}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-md">
                  <p className="text-sm">
                    {question.tags.slice(visibleTags.length).map(t => t.name).join(', ')}
                  </p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}