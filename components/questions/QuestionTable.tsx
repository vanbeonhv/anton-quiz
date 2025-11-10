'use client'

import { QuestionWithTags } from '@/types'
import { QuestionRow } from './QuestionRow'
import { TooltipProvider } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

interface QuestionTableProps {
  questions: QuestionWithTags[]
  isLoading?: boolean
  className?: string
}

export function QuestionTable({ questions, isLoading = false, className }: QuestionTableProps) {
  if (isLoading) {
    return (
      <div className={cn("bg-white border border-gray-200 rounded-lg overflow-hidden min-h-[548px]", className)}>
        <QuestionTableSkeleton />
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className={cn("bg-white border border-gray-200 rounded-lg p-8 text-center min-h-[548px] flex items-center justify-center", className)}>
        <p className="text-gray-500">No questions found</p>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className={cn("bg-white border border-gray-200 rounded-lg overflow-hidden", className)} role="table" aria-label="Questions List">
      {/* Table Header */}
      <div className="question-table-header bg-gray-50 border-b border-gray-200" role="rowgroup">
        <div className="question-table-grid px-4 py-3" role="row">
          {/* Status Column - 40px */}
          <div className="flex items-center justify-center" role="columnheader" aria-label="Solved Status">
            <span className="text-xs font-medium text-gray-600 sr-only">Status</span>
          </div>

          {/* Mobile Header - Only visible on mobile */}
          <div className="md:hidden flex items-center px-3" role="columnheader" aria-label="Question Information">
            <span className="text-xs font-medium text-gray-600">Questions</span>
          </div>

          {/* Desktop Headers - Hidden on mobile */}
          {/* Number Column - 80px */}
          <div className="hidden md:flex items-center" role="columnheader" aria-label="Question Number">
            <span className="text-xs font-medium text-gray-600">#</span>
          </div>

          {/* Title Column - Flexible */}
          <div className="hidden md:flex items-center px-3" role="columnheader" aria-label="Question Title">
            <span className="text-xs font-medium text-gray-600">Question</span>
          </div>

          {/* Difficulty Column - 100px */}
          <div className="hidden md:flex items-center justify-center px-2" role="columnheader" aria-label="Difficulty Level">
            <span className="text-xs font-medium text-gray-600">Difficulty</span>
          </div>

          {/* Success Rate Column - 120px (hidden on mobile/tablet) */}
          <div className="hidden lg:flex items-center justify-center px-2" role="columnheader" aria-label="Success Rate">
            <span className="text-xs font-medium text-gray-600">Success Rate</span>
          </div>

          {/* Tags Column - 200px (hidden on mobile) */}
          <div className="hidden md:flex items-center px-2" role="columnheader" aria-label="Question Tags">
            <span className="text-xs font-medium text-gray-600">Tags</span>
          </div>
        </div>
      </div>

      {/* Table Body */}
      <div className="question-table-body" role="rowgroup">
        {questions.map((question) => (
          <QuestionRow key={question.id} question={question} />
        ))}
      </div>
    </div>
    </TooltipProvider>
  )
}

// Skeleton loader for loading state
function QuestionTableSkeleton() {
  return (
    <>
      {/* Header Skeleton */}
      <div className="question-table-header bg-gray-50 border-b border-gray-200">
        <div className="question-table-grid px-4 py-3">
          <div className="flex items-center justify-center">
            <div className="w-4 h-4 bg-gray-300 rounded animate-pulse"></div>
          </div>
          
          {/* Mobile Header Skeleton */}
          <div className="md:hidden flex items-center px-3">
            <div className="w-16 h-4 bg-gray-300 rounded animate-pulse"></div>
          </div>
          
          {/* Desktop Header Skeletons */}
          <div className="hidden md:flex items-center">
            <div className="w-4 h-4 bg-gray-300 rounded animate-pulse"></div>
          </div>
          <div className="hidden md:flex items-center px-3">
            <div className="w-16 h-4 bg-gray-300 rounded animate-pulse"></div>
          </div>
          <div className="hidden md:flex items-center justify-center px-2">
            <div className="w-12 h-4 bg-gray-300 rounded animate-pulse"></div>
          </div>
          <div className="hidden lg:flex items-center justify-center px-2">
            <div className="w-16 h-4 bg-gray-300 rounded animate-pulse"></div>
          </div>
          <div className="hidden md:flex items-center px-2">
            <div className="w-8 h-4 bg-gray-300 rounded animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Body Skeleton */}
      <div className="question-table-body">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="question-table-grid h-[60px] px-4 py-3 border-b border-gray-100 last:border-b-0">
            <div className="flex items-center justify-center">
              <div className="w-5 h-5 bg-gray-200 rounded-full animate-pulse"></div>
            </div>
            
            {/* Mobile Skeleton */}
            <div className="md:hidden mobile-stacked-content">
              <div className="mobile-row-top">
                <div className="w-8 h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="flex-1 h-4 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="mobile-row-bottom">
                <div className="w-12 h-5 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="w-16 h-4 bg-gray-200 rounded-full animate-pulse"></div>
              </div>
            </div>
            
            {/* Desktop Skeletons */}
            <div className="hidden md:flex items-center">
              <div className="w-8 h-4 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="hidden md:flex items-center px-3">
              <div className="w-full h-4 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="hidden md:flex items-center justify-center px-2">
              <div className="w-12 h-6 bg-gray-200 rounded-full animate-pulse"></div>
            </div>
            <div className="hidden lg:flex items-center justify-center px-2">
              <div className="w-8 h-4 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="hidden md:flex items-center px-2">
              <div className="flex gap-1">
                <div className="w-12 h-5 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="w-8 h-5 bg-gray-200 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}