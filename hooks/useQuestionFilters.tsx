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
        const parsed: unknown = JSON.parse(storedFilters)
        
        // Validate that parsed is an object before accessing properties
        if (typeof parsed !== 'object' || parsed === null) {
          setFilters(DEFAULT_FILTERS)
          return
        }
        
        const parsedObj = parsed as Record<string, unknown>
        
        // Validate and sanitize the stored filters
        const validatedFilters: QuestionFilters = {
          tags: (Array.isArray(parsedObj.tags) && parsedObj.tags.every((tag: unknown) => typeof tag === 'string')) 
            ? parsedObj.tags 
            : DEFAULT_FILTERS.tags,
          difficulty: (Array.isArray(parsedObj.difficulty) && 
                       parsedObj.difficulty.every((d: unknown) => ['EASY', 'MEDIUM', 'HARD'].includes(d as string)))
            ? parsedObj.difficulty 
            : DEFAULT_FILTERS.difficulty,
          status: ['all', 'solved', 'unsolved'].includes(parsedObj.status as string) ? parsedObj.status as 'all' | 'solved' | 'unsolved' : DEFAULT_FILTERS.status,
          search: typeof parsedObj.search === 'string' ? parsedObj.search : DEFAULT_FILTERS.search,
          sortBy: (typeof parsedObj.sortBy === 'string' && ['newest', 'difficulty', 'most-attempted', 'number'].includes(parsedObj.sortBy)) 
            ? parsedObj.sortBy as 'newest' | 'difficulty' | 'most-attempted' | 'number'
            : DEFAULT_FILTERS.sortBy,
          page: (typeof parsedObj.page === 'number' && parsedObj.page > 0) ? parsedObj.page : DEFAULT_FILTERS.page,
          pageSize: (typeof parsedObj.pageSize === 'number' && parsedObj.pageSize > 0)
            ? parsedObj.pageSize 
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
