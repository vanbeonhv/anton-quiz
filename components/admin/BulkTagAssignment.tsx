'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Tags, Plus, Minus, RotateCcw } from 'lucide-react'
import { Tag, QuestionWithTags } from '@/types'
import { toast } from 'sonner'

interface BulkTagAssignmentProps {
  tags: Tag[]
  questions: QuestionWithTags[]
  onComplete?: () => void
}

export default function BulkTagAssignment({ tags, questions, onComplete }: BulkTagAssignmentProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [action, setAction] = useState<'add' | 'remove' | 'replace'>('add')
  const [loading, setLoading] = useState(false)

  const handleQuestionToggle = (questionId: string, checked: boolean) => {
    if (checked) {
      setSelectedQuestions([...selectedQuestions, questionId])
    } else {
      setSelectedQuestions(selectedQuestions.filter(id => id !== questionId))
    }
  }

  const handleTagToggle = (tagId: string, checked: boolean) => {
    if (checked) {
      setSelectedTags([...selectedTags, tagId])
    } else {
      setSelectedTags(selectedTags.filter(id => id !== tagId))
    }
  }

  const handleBulkAssignment = async () => {
    if (selectedQuestions.length === 0) {
      toast.error('Please select at least one question')
      return
    }

    if (selectedTags.length === 0) {
      toast.error('Please select at least one tag')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/admin/tags/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          questionIds: selectedQuestions,
          tagIds: selectedTags,
          action
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to perform bulk tag operation')
      }

      const result = await response.json()
      toast.success(result.message)
      
      // Reset form
      setSelectedQuestions([])
      setSelectedTags([])
      setAction('add')
      setIsDialogOpen(false)
      
      onComplete?.()
    } catch (error) {
      console.error('Error in bulk tag assignment:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to perform bulk tag operation')
    } finally {
      setLoading(false)
    }
  }

  const getActionIcon = () => {
    switch (action) {
      case 'add': return <Plus className="w-4 h-4" />
      case 'remove': return <Minus className="w-4 h-4" />
      case 'replace': return <RotateCcw className="w-4 h-4" />
    }
  }

  const getActionDescription = () => {
    switch (action) {
      case 'add': return 'Add selected tags to selected questions'
      case 'remove': return 'Remove selected tags from selected questions'
      case 'replace': return 'Replace all tags on selected questions with selected tags'
    }
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Tags className="w-4 h-4 mr-2" />
          Bulk Tag Assignment
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk Tag Assignment</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Action Selection */}
          <div>
            <Label>Action</Label>
            <Select value={action} onValueChange={(value) => setAction(value as 'add' | 'remove' | 'replace')}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="add">Add Tags</SelectItem>
                <SelectItem value="remove">Remove Tags</SelectItem>
                <SelectItem value="replace">Replace All Tags</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-text-secondary mt-1">{getActionDescription()}</p>
          </div>

          {/* Question Selection */}
          <div>
            <Label>Select Questions ({selectedQuestions.length} selected)</Label>
            <div className="max-h-60 overflow-y-auto border rounded-lg p-4 mt-2">
              <div className="space-y-2">
                {questions.map((question) => (
                  <div key={question.id} className="flex items-start space-x-2">
                    <Checkbox
                      id={`question-${question.id}`}
                      checked={selectedQuestions.includes(question.id)}
                      onCheckedChange={(checked) => handleQuestionToggle(question.id, checked as boolean)}
                    />
                    <div className="flex-1 min-w-0">
                      <Label htmlFor={`question-${question.id}`} className="text-sm font-medium">
                        #{question.number}
                      </Label>
                      <p className="text-sm text-text-secondary truncate">{question.text}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        <Badge className="text-xs" variant="outline">
                          {question.difficulty}
                        </Badge>
                        {question.tags.map((tag) => (
                          <Badge key={tag.id} variant="secondary" className="text-xs">
                            {tag.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tag Selection */}
          <div>
            <Label>Select Tags ({selectedTags.length} selected)</Label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {tags.map((tag) => (
                <div key={tag.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`bulk-tag-${tag.id}`}
                    checked={selectedTags.includes(tag.id)}
                    onCheckedChange={(checked) => handleTagToggle(tag.id, checked as boolean)}
                  />
                  <Label htmlFor={`bulk-tag-${tag.id}`} className="text-sm">{tag.name}</Label>
                </div>
              ))}
            </div>
          </div>

          {/* Action Summary */}
          {selectedQuestions.length > 0 && selectedTags.length > 0 && (
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 text-sm">
                  {getActionIcon()}
                  <span>
                    {action === 'add' && 'Add'}
                    {action === 'remove' && 'Remove'}
                    {action === 'replace' && 'Replace with'}
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {selectedTags.map((tagId) => {
                      const tag = tags.find(t => t.id === tagId)
                      return tag ? (
                        <Badge key={tagId} variant="secondary" className="text-xs">
                          {tag.name}
                        </Badge>
                      ) : null
                    })}
                  </div>
                  <span>
                    {action === 'add' && 'to'}
                    {action === 'remove' && 'from'}
                    {action === 'replace' && 'on'}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {selectedQuestions.length} question{selectedQuestions.length !== 1 ? 's' : ''}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleBulkAssignment}
              disabled={loading || selectedQuestions.length === 0 || selectedTags.length === 0}
            >
              {loading ? 'Processing...' : 'Apply Changes'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}