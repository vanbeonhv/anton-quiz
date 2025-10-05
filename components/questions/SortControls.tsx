'use client'

import { ArrowUpDown } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface SortControlsProps {
  sortBy: string
  onSortChange: (sortBy: 'newest' | 'difficulty' | 'most-attempted' | 'number') => void
}

export function SortControls({ sortBy, onSortChange }: SortControlsProps) {
  const sortOptions = [
    { value: 'number', label: 'Question Number' },
    { value: 'newest', label: 'Newest First' },
    { value: 'difficulty', label: 'Difficulty' },
    { value: 'most-attempted', label: 'Most Attempted' }
  ]

  return (
    <div className="flex items-center gap-2">
      <ArrowUpDown className="w-4 h-4 text-text-muted" />
      <span className="text-sm text-text-muted">Sort by:</span>
      <Select value={sortBy} onValueChange={onSortChange}>
        <SelectTrigger className="w-40 h-8 bg-bg-white border-bg-peach">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {sortOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}