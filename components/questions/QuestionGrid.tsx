'use client'

import { useState, useEffect } from 'react'
import { QuestionFilters, QuestionWithTags } from '@/types'
import { QuestionsApiResponse, buildQuestionsQueryParams } from '@/types/api'
import { Card, CardContent } from '@/components/ui/card'
import { QuestionTable } from './QuestionTable'
import { Pagination } from './Pagination'
import { SortControls } from './SortControls'


interface QuestionGridProps {
  filters: QuestionFilters
  onFiltersChange: (filters: QuestionFilters) => void
}

export function QuestionGrid({ filters, onFiltersChange }: QuestionGridProps) {
  const [questions, setQuestions] = useState<QuestionWithTags[]>([])
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 12,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load questions based on filters
  useEffect(() => {
    const loadQuestions = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Build query parameters using type-safe utility
        const params = buildQuestionsQueryParams({
          tags: filters.tags.length > 0 ? filters.tags : undefined,
          difficulty: filters.difficulty.length > 0 ? filters.difficulty : undefined,
          status: filters.status,
          search: filters.search,
          page: filters.page || 1,
          pageSize: filters.pageSize || 12,
          sortBy: filters.sortBy || 'number'
        })

        const response = await fetch(`/api/questions?${params.toString()}`)

        if (!response.ok) {
          throw new Error('Failed to load questions')
        }

        const data: QuestionsApiResponse = await response.json()
        setQuestions(data.questions || [])
        setPagination({
          page: data.pagination.page,
          pageSize: data.pagination.pageSize,
          total: data.pagination.totalCount,
          totalPages: data.pagination.totalPages,
          hasNext: data.pagination.hasNextPage,
          hasPrev: data.pagination.hasPrevPage
        })
      } catch (err) {
        console.error('Error loading questions:', err)
        setError('Failed to load questions. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    loadQuestions()
  }, [filters])

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

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Controls bar skeleton */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-bg-white p-4 rounded-lg border border-bg-peach">
          <div className="flex items-center gap-4">
            <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="w-32 h-8 bg-gray-200 rounded animate-pulse"></div>
        </div>

        {/* Question table loading */}
        <QuestionTable 
          questions={[]} 
          isLoading={true}
        />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        {/* Controls bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-bg-white p-4 rounded-lg border border-bg-peach">
          <div className="flex items-center gap-4">
            <p className="text-text-muted text-sm">Error loading questions</p>
          </div>
        </div>

        <Card className="bg-bg-white border-bg-peach">
          <CardContent className="p-6">
            <div className="text-center text-red-600">
              <p className="text-lg font-medium mb-2">Error Loading Questions</p>
              <p className="text-sm">{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Controls bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-bg-white p-4 rounded-lg border border-bg-peach">
        <div className="flex items-center gap-4">
          <p className="text-text-muted text-sm">
            {pagination.total} question{pagination.total !== 1 ? 's' : ''} found
          </p>
        </div>

        <SortControls
          sortBy={filters.sortBy || 'number'}
          onSortChange={handleSortChange}
        />
      </div>

      {/* Question table */}
      <QuestionTable 
        questions={questions} 
        isLoading={false}
      />

      {/* Pagination */}
      {pagination.totalPages > 0 && (
        <div className="bg-bg-white p-4 rounded-lg border border-bg-peach">
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            pageSize={pagination.pageSize}
            total={pagination.total}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </div>
      )}
    </div>
  )
}