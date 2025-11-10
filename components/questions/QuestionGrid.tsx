'use client'

import { QuestionFilters } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { QuestionTable } from './QuestionTable'
import { Pagination } from './Pagination'
import { SortControls } from './SortControls'
import { useQuestions } from '@/lib/queries'

interface QuestionGridProps {
  filters: QuestionFilters
  onFiltersChange: (filters: QuestionFilters) => void
}

export function QuestionGrid({ filters, onFiltersChange }: QuestionGridProps) {
  const { data, isLoading, isFetching, error } = useQuestions(filters)

  const questions = data?.questions || []
  const pagination = data?.pagination || {
    page: 1,
    pageSize: 12,
    totalCount: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false
  }

  const handlePageChange = (page: number) => {
    onFiltersChange({
      ...filters,
      page
    })
  }

  const handlePageSizeChange = (pageSize: number) => {
    onFiltersChange({
      ...filters,
      page: 1, // Reset to first page when changing page size
      pageSize
    })
  }

  const handleSortChange = (sortBy: 'newest' | 'difficulty' | 'most-attempted' | 'number') => {
    onFiltersChange({
      ...filters,
      page: 1, // Reset to first page when changing sort
      sortBy
    })
  }

  // Show initial loading state
  const showInitialLoading = isLoading && !data

  return (
    <div className="space-y-6">
      {/* Controls bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-bg-white p-4 rounded-lg border border-bg-peach">
        <div className="flex items-center gap-4">
          {showInitialLoading ? (
            <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
          ) : error ? (
            <p className="text-text-muted text-sm">Error loading questions</p>
          ) : (
            <p className="text-text-muted text-sm">
              {pagination.totalCount} question{pagination.totalCount !== 1 ? 's' : ''} found
            </p>
          )}
        </div>

        {showInitialLoading ? (
          <div className="w-32 h-8 bg-gray-200 rounded animate-pulse"></div>
        ) : (
          <SortControls
            sortBy={filters.sortBy || 'number'}
            onSortChange={handleSortChange}
          />
        )}
      </div>

      {/* Question table - single instance with loading state */}
      {error ? (
        <Card className="bg-bg-white border-bg-peach min-h-[548px] flex items-center justify-center">
          <CardContent className="p-6">
            <div className="text-center text-red-600">
              <p className="text-lg font-medium mb-2">Error Loading Questions</p>
              <p className="text-sm">{error?.message || 'An unexpected error occurred'}</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <QuestionTable
          questions={questions}
          isLoading={isFetching}
        />
      )}

      {/* Pagination */}
      <div className="bg-bg-white p-4 rounded-lg border border-bg-peach">
        {showInitialLoading ? (
          <div className="flex items-center justify-between">
            <div className="w-32 h-8 bg-gray-200 rounded animate-pulse"></div>
            <div className="flex gap-2">
              <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="w-24 h-8 bg-gray-200 rounded animate-pulse"></div>
          </div>
        ) : !error && pagination.totalPages > 0 ? (
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            pageSize={pagination.pageSize}
            total={pagination.totalCount}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        ) : null}
      </div>
    </div>
  )
}