'use client'

import { QuestionFilters, Difficulty, Tag } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface FilterSidebarProps {
  filters: QuestionFilters
  onFilterChange: (filters: QuestionFilters) => void
  tags: Tag[]
  isLoadingTags: boolean
}

export function FilterSidebar({ filters, onFilterChange, tags, isLoadingTags }: FilterSidebarProps) {
  const handleTagToggle = (tagId: string) => {
    const newTags = filters.tags.includes(tagId)
      ? filters.tags.filter(id => id !== tagId)
      : [...filters.tags, tagId]
    
    onFilterChange({
      ...filters,
      tags: newTags
    })
  }

  const handleDifficultyToggle = (difficulty: Difficulty) => {
    const newDifficulty = filters.difficulty.includes(difficulty)
      ? filters.difficulty.filter(d => d !== difficulty)
      : [...filters.difficulty, difficulty]
    
    onFilterChange({
      ...filters,
      difficulty: newDifficulty
    })
  }

  const handleStatusChange = (status: 'all' | 'solved' | 'unsolved') => {
    onFilterChange({
      ...filters,
      status
    })
  }

  const getDifficultyColor = (difficulty: Difficulty) => {
    switch (difficulty) {
      case 'EASY':
        return 'bg-green-100 text-green-800 hover:bg-green-200'
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
      case 'HARD':
        return 'bg-red-100 text-red-800 hover:bg-red-200'
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200'
    }
  }

  const getTagColor = (tag: Tag) => {
    if (tag.color) {
      return {
        backgroundColor: `${tag.color}20`,
        color: tag.color,
        borderColor: `${tag.color}40`
      }
    }
    return {}
  }

  return (
    <div className="space-y-6">
      {/* Status Filter */}
      <div>
        <h4 className="font-medium text-text-primary mb-3">Status</h4>
        <div className="space-y-2">
          {(['all', 'solved', 'unsolved'] as const).map((status) => (
            <Button
              key={status}
              variant={filters.status === status ? "default" : "ghost"}
              size="sm"
              onClick={() => handleStatusChange(status)}
              className={`w-full justify-start ${
                filters.status === status 
                  ? 'bg-primary-green text-white hover:bg-primary-green-dark' 
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-peach'
              }`}
            >
              {status === 'all' && 'All Questions'}
              {status === 'solved' && 'Solved'}
              {status === 'unsolved' && 'Unsolved'}
            </Button>
          ))}
        </div>
      </div>

      {/* Difficulty Filter */}
      <div>
        <h4 className="font-medium text-text-primary mb-3">Difficulty</h4>
        <div className="space-y-2">
          {(['EASY', 'MEDIUM', 'HARD'] as Difficulty[]).map((difficulty) => (
            <Button
              key={difficulty}
              variant="ghost"
              size="sm"
              onClick={() => handleDifficultyToggle(difficulty)}
              className={`w-full justify-start ${
                filters.difficulty.includes(difficulty)
                  ? getDifficultyColor(difficulty) + ' font-medium'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-peach'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="capitalize">{difficulty.toLowerCase()}</span>
                {filters.difficulty.includes(difficulty) && (
                  <div className="w-2 h-2 rounded-full bg-current" />
                )}
              </div>
            </Button>
          ))}
        </div>
      </div>

      {/* Tags Filter */}
      <div>
        <h4 className="font-medium text-text-primary mb-3">Topics</h4>
        {isLoadingTags ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-8 bg-bg-peach rounded animate-pulse" />
            ))}
          </div>
        ) : tags.length === 0 ? (
          <p className="text-text-muted text-sm">No topics available</p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {tags.map((tag) => (
              <Button
                key={tag.id}
                variant="ghost"
                size="sm"
                onClick={() => handleTagToggle(tag.id)}
                className={`w-full justify-start ${
                  filters.tags.includes(tag.id)
                    ? 'bg-primary-green-light text-primary-green font-medium border border-primary-green'
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-peach'
                }`}
                style={filters.tags.includes(tag.id) ? getTagColor(tag) : {}}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="truncate">{tag.name}</span>
                  {filters.tags.includes(tag.id) && (
                    <div className="w-2 h-2 rounded-full bg-current ml-2 flex-shrink-0" />
                  )}
                </div>
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Active Filters Summary */}
      {(filters.tags.length > 0 || filters.difficulty.length > 0) && (
        <div>
          <h4 className="font-medium text-text-primary mb-3">Active Filters</h4>
          <div className="space-y-2">
            {/* Selected Tags */}
            {filters.tags.length > 0 && (
              <div>
                <p className="text-xs text-text-muted mb-1">Topics:</p>
                <div className="flex flex-wrap gap-1">
                  {filters.tags.map((tagId) => {
                    const tag = tags.find(t => t.id === tagId)
                    return tag ? (
                      <Badge
                        key={tagId}
                        variant="secondary"
                        className="text-xs cursor-pointer hover:bg-red-100 hover:text-red-800"
                        onClick={() => handleTagToggle(tagId)}
                        style={getTagColor(tag)}
                      >
                        {tag.name} ×
                      </Badge>
                    ) : null
                  })}
                </div>
              </div>
            )}

            {/* Selected Difficulties */}
            {filters.difficulty.length > 0 && (
              <div>
                <p className="text-xs text-text-muted mb-1">Difficulty:</p>
                <div className="flex flex-wrap gap-1">
                  {filters.difficulty.map((difficulty) => (
                    <Badge
                      key={difficulty}
                      variant="secondary"
                      className={`text-xs cursor-pointer hover:bg-red-100 hover:text-red-800 ${getDifficultyColor(difficulty)}`}
                      onClick={() => handleDifficultyToggle(difficulty)}
                    >
                      {difficulty.toLowerCase()} ×
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}