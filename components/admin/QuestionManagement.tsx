'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Trash2, Edit, Plus, HelpCircle, Search } from 'lucide-react'
import { QuestionWithTags, Tag, Difficulty, OptionKey } from '@/types'
import { useAdminQuestions, useCreateQuestion, useUpdateQuestion, useDeleteQuestion } from '@/lib/queries'
import { toast } from 'sonner'
import BulkTagAssignment from './BulkTagAssignment'

interface QuestionManagementProps {
  tags: Tag[]
  onRefresh?: () => void
}

interface CreateQuestionData {
  text: string
  optionA: string
  optionB: string
  optionC: string
  optionD: string
  correctAnswer: OptionKey
  explanation: string
  difficulty: Difficulty
  tagIds: string[]
}

export default function QuestionManagement({ tags, onRefresh }: QuestionManagementProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<QuestionWithTags | null>(null)
  const [page, setPage] = useState(1)
  const pageSize = 10

  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | 'all'>('all')
  const [selectedTagId, setSelectedTagId] = useState('all')

  // Fetch questions using React Query
  const {
    data: questionsData,
    isLoading: loading,
    refetch: refetchQuestions
  } = useAdminQuestions({
    page,
    pageSize,
    search: searchTerm || undefined,
    difficulty: selectedDifficulty,
    tagId: selectedTagId
  })

  // Mutation hooks
  const createQuestionMutation = useCreateQuestion()
  const updateQuestionMutation = useUpdateQuestion()
  const deleteQuestionMutation = useDeleteQuestion()

  const questions = questionsData?.data || []
  const pagination = questionsData?.pagination || {
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  }

  const [formData, setFormData] = useState<CreateQuestionData>({
    text: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctAnswer: 'A',
    explanation: '',
    difficulty: 'MEDIUM',
    tagIds: []
  })

  const handleCreateQuestion = () => {
    if (!formData.text.trim() || !formData.optionA.trim() || !formData.optionB.trim() ||
      !formData.optionC.trim() || !formData.optionD.trim()) {
      toast.error('All fields are required')
      return
    }

    createQuestionMutation.mutate(formData, {
      onSuccess: () => {
        toast.success('Question created successfully')
        setIsCreateDialogOpen(false)
        resetForm()
        onRefresh?.()
      },
      onError: (error) => {
        console.error('Error creating question:', error)
        toast.error(error instanceof Error ? error.message : 'Failed to create question')
      }
    })
  }

  const handleEditQuestion = () => {
    if (!editingQuestion) return

    updateQuestionMutation.mutate(
      { id: editingQuestion.id, data: formData },
      {
        onSuccess: () => {
          toast.success('Question updated successfully')
          setIsEditDialogOpen(false)
          setEditingQuestion(null)
          resetForm()
          onRefresh?.()
        },
        onError: (error) => {
          console.error('Error updating question:', error)
          toast.error(error instanceof Error ? error.message : 'Failed to update question')
        }
      }
    )
  }

  const handleDeleteQuestion = (question: QuestionWithTags) => {
    if (!confirm(`Are you sure you want to delete question #${question.number}?`)) {
      return
    }

    deleteQuestionMutation.mutate(question.id, {
      onSuccess: () => {
        toast.success('Question deleted successfully')
        onRefresh?.()
      },
      onError: (error) => {
        console.error('Error deleting question:', error)
        toast.error(error instanceof Error ? error.message : 'Failed to delete question')
      }
    })
  }

  const openEditDialog = (question: QuestionWithTags) => {
    setEditingQuestion(question)
    setFormData({
      text: question.text,
      optionA: question.optionA,
      optionB: question.optionB,
      optionC: question.optionC,
      optionD: question.optionD,
      correctAnswer: question.correctAnswer || 'A',
      explanation: question.explanation || '',
      difficulty: question.difficulty,
      tagIds: question.tags.map(tag => tag.id)
    })
    setIsEditDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      text: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctAnswer: 'A',
      explanation: '',
      difficulty: 'MEDIUM',
      tagIds: []
    })
    setEditingQuestion(null)
  }

  const handleTagToggle = (tagId: string, checked: boolean) => {
    if (checked) {
      setFormData({ ...formData, tagIds: [...formData.tagIds, tagId] })
    } else {
      setFormData({ ...formData, tagIds: formData.tagIds.filter(id => id !== tagId) })
    }
  }

  const getDifficultyColor = (difficulty: Difficulty) => {
    switch (difficulty) {
      case 'EASY': return 'bg-green-100 text-green-800'
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800'
      case 'HARD': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5" />
            Question Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Loading questions...</div>
        </CardContent>
      </Card>
    )
  }

  const isAnyMutationLoading = createQuestionMutation.isPending || 
                               updateQuestionMutation.isPending || 
                               deleteQuestionMutation.isPending

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5" />
            Question Management
          </div>
          <div className="flex gap-2">
            <BulkTagAssignment
              tags={tags}
              questions={questions}
              onComplete={() => {
                refetchQuestions()
                onRefresh?.()
              }}
            />
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Question
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Question</DialogTitle>
                </DialogHeader>
                <QuestionForm
                  formData={formData}
                  setFormData={setFormData}
                  tags={tags}
                  onSubmit={handleCreateQuestion}
                  onCancel={() => setIsCreateDialogOpen(false)}
                  onTagToggle={handleTagToggle}
                  isLoading={createQuestionMutation.isPending}
                />
              </DialogContent>
            </Dialog>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={selectedDifficulty} onValueChange={(value) => setSelectedDifficulty(value as Difficulty | 'all')}>
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
          <Select value={selectedTagId} onValueChange={setSelectedTagId}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by tag" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tags</SelectItem>
              {tags.map((tag) => (
                <SelectItem key={tag.id} value={tag.id}>{tag.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {questions.length === 0 ? (
          <div className="text-center py-8 text-text-secondary">
            No questions found. Create your first question to get started.
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {questions.map((question) => (
                <div key={question.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">#{question.number}</Badge>
                        <Badge className={getDifficultyColor(question.difficulty)}>
                          {question.difficulty}
                        </Badge>
                        {!question.isActive && (
                          <Badge variant="destructive">Inactive</Badge>
                        )}
                      </div>
                      <p className="text-sm font-medium mb-2">{question.text}</p>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {question.tags.map((tag) => (
                          <Badge key={tag.id} variant="secondary" className="text-xs">
                            {tag.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(question)}
                        disabled={isAnyMutationLoading}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteQuestion(question)}
                        disabled={deleteQuestionMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>A: {question.optionA}</div>
                    <div>B: {question.optionB}</div>
                    <div>C: {question.optionC}</div>
                    <div>D: {question.optionD}</div>
                  </div>
                  <div className="mt-2 text-sm text-green-600">
                    Correct: {question.correctAnswer}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-text-secondary">
                Showing {((pagination.page - 1) * pagination.pageSize) + 1} to{' '}
                {Math.min(pagination.page * pagination.pageSize, pagination.total)} of{' '}
                {pagination.total} questions
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={!pagination.hasPrev}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={!pagination.hasNext}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Question</DialogTitle>
            </DialogHeader>
            <QuestionForm
              formData={formData}
              setFormData={setFormData}
              tags={tags}
              onSubmit={handleEditQuestion}
              onCancel={() => setIsEditDialogOpen(false)}
              onTagToggle={handleTagToggle}
              isLoading={updateQuestionMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}

interface QuestionFormProps {
  formData: CreateQuestionData
  setFormData: (data: CreateQuestionData) => void
  tags: Tag[]
  onSubmit: () => void
  onCancel: () => void
  onTagToggle: (tagId: string, checked: boolean) => void
  isLoading?: boolean
}

function QuestionForm({ formData, setFormData, tags, onSubmit, onCancel, onTagToggle, isLoading = false }: QuestionFormProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="text">Question Text *</Label>
        <Textarea
          id="text"
          value={formData.text}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, text: e.target.value })}
          placeholder="Enter the question text"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="optionA">Option A *</Label>
          <Input
            id="optionA"
            value={formData.optionA}
            onChange={(e) => setFormData({ ...formData, optionA: e.target.value })}
            placeholder="Option A"
          />
        </div>
        <div>
          <Label htmlFor="optionB">Option B *</Label>
          <Input
            id="optionB"
            value={formData.optionB}
            onChange={(e) => setFormData({ ...formData, optionB: e.target.value })}
            placeholder="Option B"
          />
        </div>
        <div>
          <Label htmlFor="optionC">Option C *</Label>
          <Input
            id="optionC"
            value={formData.optionC}
            onChange={(e) => setFormData({ ...formData, optionC: e.target.value })}
            placeholder="Option C"
          />
        </div>
        <div>
          <Label htmlFor="optionD">Option D *</Label>
          <Input
            id="optionD"
            value={formData.optionD}
            onChange={(e) => setFormData({ ...formData, optionD: e.target.value })}
            placeholder="Option D"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Correct Answer *</Label>
          <RadioGroup
            value={formData.correctAnswer}
            onValueChange={(value) => setFormData({ ...formData, correctAnswer: value as OptionKey })}
            className="flex gap-4 mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="A" id="correct-a" />
              <Label htmlFor="correct-a">A</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="B" id="correct-b" />
              <Label htmlFor="correct-b">B</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="C" id="correct-c" />
              <Label htmlFor="correct-c">C</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="D" id="correct-d" />
              <Label htmlFor="correct-d">D</Label>
            </div>
          </RadioGroup>
        </div>
        <div>
          <Label htmlFor="difficulty">Difficulty *</Label>
          <Select value={formData.difficulty} onValueChange={(value) => setFormData({ ...formData, difficulty: value as Difficulty })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="EASY">Easy</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="HARD">Hard</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="explanation">Explanation</Label>
        <Textarea
          id="explanation"
          value={formData.explanation}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, explanation: e.target.value })}
          placeholder="Explain why this is the correct answer (optional)"
          rows={3}
        />
      </div>

      <div>
        <Label>Tags</Label>
        <div className="grid grid-cols-3 gap-2 mt-2">
          {tags.map((tag) => (
            <div key={tag.id} className="flex items-center space-x-2">
              <Checkbox
                id={`tag-${tag.id}`}
                checked={formData.tagIds.includes(tag.id)}
                onCheckedChange={(checked) => onTagToggle(tag.id, checked as boolean)}
              />
              <Label htmlFor={`tag-${tag.id}`} className="text-sm">{tag.name}</Label>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button onClick={onSubmit} disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Question'}
        </Button>
      </div>
    </div>
  )
}