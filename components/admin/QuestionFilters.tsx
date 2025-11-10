import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search } from 'lucide-react'
import { Difficulty, Tag } from '@/types'

interface QuestionFiltersProps {
  searchTerm: string
  selectedDifficulty: Difficulty | 'all'
  selectedTagId: string
  tags: Tag[]
  onSearchChange: (value: string) => void
  onDifficultyChange: (value: Difficulty | 'all') => void
  onTagChange: (value: string) => void
}

export function QuestionFilters({
  searchTerm,
  selectedDifficulty,
  selectedTagId,
  tags,
  onSearchChange,
  onDifficultyChange,
  onTagChange
}: QuestionFiltersProps) {
  return (
    <div className="flex gap-4 mb-6">
      <div className="flex-1">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search questions..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      <Select value={selectedDifficulty} onValueChange={onDifficultyChange}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Difficulty" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Difficulties</SelectItem>
          <SelectItem value="EASY">Easy</SelectItem>
          <SelectItem value="MEDIUM">Medium</SelectItem>
          <SelectItem value="HARD">Hard</SelectItem>
        </SelectContent>
      </Select>
      <Select value={selectedTagId} onValueChange={onTagChange}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Filter by tag" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Tags</SelectItem>
          {tags.map((tag) => (
            <SelectItem key={tag.id} value={tag.id}>
              {tag.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
