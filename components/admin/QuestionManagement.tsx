'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogTrigger } from '@/components/ui/dialog'
import { Plus, HelpCircle } from 'lucide-react'
import { QuestionWithTags, Tag, Difficulty, OptionKey } from '@/types'
import {
  useAdminQuestions,
  useCreateQuestion,
  useUpdateQuestion,
  useDeleteQuestion
} from '@/lib/queries'
import { toast } from 'sonner'
import { LoadingState } from '@/components/shared/LoadingState'
import { validateQuestionForm } from '@/lib/utils/question'
import BulkTagAssignment from './BulkTagAssignment'
import BulkQuestionImport from './BulkQuestionImport'
import { QuestionFilters } from './QuestionFilters'
import { QuestionList } from './QuestionList'
import { QuestionPagination } from './QuestionPagination'
import { QuestionFormDialog } from './QuestionFormDialog'

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

const initialFormData: CreateQuestionData = {
  text: '',
  optionA: '',
  optionB: '',
  optionC: '',
  optionD: '',
  correctAnswer: 'A',
  explanation: '',
  difficulty: 'MEDIUM',
  tagIds: []
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

  // Form data
  const [formData, setFormData] = useState<CreateQuestionData>(initialFormData)

  // Fetch questions
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

  // Mutations
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

  const handleCreateQuestion = () => {
    const error = validateQuestionForm(formData)
    if (error) {
      toast.error(error)
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

    const error = validateQuestionForm(formData)
    if (error) {
      toast.error(error)
      return
    }

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
      tagIds: question.tags.map((tag) => tag.id)
    })
    setIsEditDialogOpen(true)
  }

  const resetForm = () => {
    setFormData(initialFormData)
    setEditingQuestion(null)
  }

  const handleTagToggle = (tagId: string, checked: boolean) => {
    if (checked) {
      setFormData({ ...formData, tagIds: [...formData.tagIds, tagId] })
    } else {
      setFormData({ ...formData, tagIds: formData.tagIds.filter((id) => id !== tagId) })
    }
  }

  const isAnyMutationLoading =
    createQuestionMutation.isPending ||
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
            <BulkQuestionImport
              tags={tags}
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
            </Dialog>

            <QuestionFormDialog
              isOpen={isCreateDialogOpen}
              onOpenChange={setIsCreateDialogOpen}
              title="Create New Question"
              formData={formData}
              setFormData={setFormData}
              tags={tags}
              onSubmit={handleCreateQuestion}
              onCancel={() => setIsCreateDialogOpen(false)}
              onTagToggle={handleTagToggle}
              isLoading={createQuestionMutation.isPending}
            />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <QuestionFilters
          searchTerm={searchTerm}
          selectedDifficulty={selectedDifficulty}
          selectedTagId={selectedTagId}
          tags={tags}
          onSearchSubmit={setSearchTerm}
          onDifficultyChange={setSelectedDifficulty}
          onTagChange={setSelectedTagId}
        />

        {loading ? (
          <LoadingState message="Loading questions..." />
        ) : (
          <>
            <QuestionList
              questions={questions}
              onEdit={openEditDialog}
              onDelete={handleDeleteQuestion}
              isLoading={isAnyMutationLoading}
            />

            {questions.length > 0 && (
              <QuestionPagination pagination={pagination} onPageChange={setPage} />
            )}
          </>
        )}

        <QuestionFormDialog
          isOpen={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          title="Edit Question"
          formData={formData}
          setFormData={setFormData}
          tags={tags}
          onSubmit={handleEditQuestion}
          onCancel={() => setIsEditDialogOpen(false)}
          onTagToggle={handleTagToggle}
          isLoading={updateQuestionMutation.isPending}
        />
      </CardContent>
    </Card>
  )
}
