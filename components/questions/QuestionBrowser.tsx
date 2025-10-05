'use client'

import { useState, useEffect } from 'react'
import { Search, Filter, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { QuestionFilters, Tag } from '@/types'
import { QuestionGrid } from './QuestionGrid'
import { FilterSidebar } from './FilterSidebar'

interface QuestionBrowserProps {
  filters: QuestionFilters
  onFilterChange: (filters: QuestionFilters) => void
}

export function QuestionBrowser({ filters, onFilterChange }: QuestionBrowserProps) {
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [tags, setTags] = useState<Tag[]>([])
  const [isLoadingTags, setIsLoadingTags] = useState(true)

  // Load available tags
  useEffect(() => {
    const loadTags = async () => {
      try {
        const response = await fetch('/api/tags')
        if (response.ok) {
          const tagsData = await response.json()
          setTags(tagsData)
        }
      } catch (error) {
        console.error('Failed to load tags:', error)
      } finally {
        setIsLoadingTags(false)
      }
    }

    loadTags()
  }, [])

  const handleSearchChange = (value: string) => {
    onFilterChange({
      ...filters,
      search: value
    })
  }

  const clearAllFilters = () => {
    onFilterChange({
      tags: [],
      difficulty: [],
      status: 'all',
      search: '',
      sortBy: 'number',
      page: 1,
      pageSize: 12
    })
  }

  const hasActiveFilters = filters.tags.length > 0 || 
                          filters.difficulty.length > 0 || 
                          filters.status !== 'all' || 
                          (filters.search && filters.search.length > 0)

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Mobile Filter Toggle */}
      <div className="lg:hidden">
        <div className="flex items-center gap-3 mb-4">
          <Button
            variant="outline"
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filters
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs">
                {filters.tags.length + filters.difficulty.length + (filters.status !== 'all' ? 1 : 0)}
              </Badge>
            )}
          </Button>
          
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-text-muted hover:text-text-primary"
            >
              Clear all
            </Button>
          )}
        </div>

        {/* Mobile Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted w-4 h-4" />
          <Input
            placeholder="Search questions..."
            value={filters.search || ''}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10 bg-bg-white border-bg-peach focus:border-primary-green"
          />
        </div>
      </div>

      {/* Filter Sidebar */}
      <div className={`
        lg:w-80 lg:flex-shrink-0
        ${showMobileFilters ? 'block' : 'hidden lg:block'}
      `}>
        <Card className="bg-bg-white border-bg-peach shadow-sm">
          <CardContent className="p-6">
            {/* Desktop Search */}
            <div className="hidden lg:block mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted w-4 h-4" />
                <Input
                  placeholder="Search questions..."
                  value={filters.search || ''}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10 bg-bg-white border-bg-peach focus:border-primary-green"
                />
              </div>
            </div>

            {/* Mobile Filter Header */}
            <div className="lg:hidden flex items-center justify-between mb-4">
              <h3 className="font-semibold text-text-primary">Filters</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMobileFilters(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <FilterSidebar
              filters={filters}
              onFilterChange={onFilterChange}
              tags={tags}
              isLoadingTags={isLoadingTags}
            />

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <div className="mt-6 pt-4 border-t border-bg-peach">
                <Button
                  variant="outline"
                  onClick={clearAllFilters}
                  className="w-full text-text-muted hover:text-text-primary"
                >
                  Clear all filters
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Question Grid */}
      <div className="flex-1 min-w-0">
        <QuestionGrid filters={filters} onFiltersChange={onFilterChange} />
      </div>
    </div>
  )
}