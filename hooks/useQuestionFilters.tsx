'use client'

import { useState, useEffect } from 'react'
import { QuestionFilters } from '@/types'

const FILTERS_STORAGE_KEY = 'anton-quiz-question-filters'

const DEFAULT_FILTERS: QuestionFilters = {
  tags: [],
  difficulty: [],
  status: 'all',
  search: '',
  sortBy: 'number',
  page: 1,
  pageSize: 12
}

/**
 * Custom hook to manage question filters with localStorage persistence
 * Stores and retrieves filters from localStorage to maintain state across page reloads
 */
export function useQuestionFilters() {
  const [filters, setFilters] = useState<QuestionFilters>(DEFAULT_FILTERS)
  const [isInitialized, setIsInitialized] = useState(false)

  // Load filters from localStorage on mount
  useEffect(() => {
    try {
      const storedFilters = localStorage.getItem(FILTERS_STORAGE_KEY)
      if (storedFilters) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const parsed: any = JSON.parse(storedFilters)
        
        // Validate and sanitize the stored filters
        const validatedFilters: QuestionFilters = {
          tags: (Array.isArray(parsed.tags) && parsed.tags.every((tag: unknown) => typeof tag === 'string')) 
            ? parsed.tags 
            : DEFAULT_FILTERS.tags,
          difficulty: (Array.isArray(parsed.difficulty) && 
                       parsed.difficulty.every((d: unknown) => ['EASY', 'MEDIUM', 'HARD'].includes(d as string)))
            ? parsed.difficulty 
            : DEFAULT_FILTERS.difficulty,
          status: ['all', 'solved', 'unsolved'].includes(parsed.status) ? parsed.status : DEFAULT_FILTERS.status,
          search: typeof parsed.search === 'string' ? parsed.search : DEFAULT_FILTERS.search,
          sortBy: (typeof parsed.sortBy === 'string' && ['newest', 'difficulty', 'most-attempted', 'number'].includes(parsed.sortBy)) 
            ? parsed.sortBy 
            : DEFAULT_FILTERS.sortBy,
          page: (typeof parsed.page === 'number' && parsed.page > 0) ? parsed.page : DEFAULT_FILTERS.page,
          pageSize: (typeof parsed.pageSize === 'number' && parsed.pageSize > 0)
            ? parsed.pageSize 
            : DEFAULT_FILTERS.pageSize
        }
        
        setFilters(validatedFilters)
      }
    } catch (error) {
      console.error('Failed to load question filters from localStorage:', error)
      // If there's an error, use default filters
      setFilters(DEFAULT_FILTERS)
    } finally {
      setIsInitialized(true)
    }
  }, [])

  // Save filters to localStorage whenever they change (after initialization)
  useEffect(() => {
    if (isInitialized) {
      try {
        localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(filters))
      } catch (error) {
        console.error('Failed to save question filters to localStorage:', error)
      }
    }
  }, [filters, isInitialized])

  const handleFilterChange = (newFilters: QuestionFilters) => {
    setFilters(newFilters)
  }

  const clearFilters = () => {
    setFilters(DEFAULT_FILTERS)
  }

  return {
    filters,
    setFilters: handleFilterChange,
    clearFilters,
    isInitialized
  }
}
