'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Upload, Copy, Check, ChevronLeft, ChevronRight, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { Tag, Difficulty, OptionKey } from '@/types'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { MarkdownText } from '@/lib/utils/markdown'

interface BulkQuestionImportProps {
  tags: Tag[]
  onComplete?: () => void
}

interface ParsedQuestion {
  text: string
  optionA: string
  optionB: string
  optionC: string
  optionD: string
  correctAnswer: OptionKey
  explanation?: string
  difficulty: Difficulty
  tagIds: string[]
  isValid?: boolean
  validationErrors?: string[]
}

const TEMPLATE_JSON = `[
  {
    "text": "Your question text here?",
    "optionA": "First option",
    "optionB": "Second option",
    "optionC": "Third option",
    "optionD": "Fourth option",
    "correctAnswer": "A",
    "explanation": "Optional explanation",
    "difficulty": "MEDIUM"
  }
]`

export default function BulkQuestionImport({ tags, onComplete }: BulkQuestionImportProps) {
  const queryClient = useQueryClient()
  const [isJsonInputOpen, setIsJsonInputOpen] = useState(false)
  const [isReviewOpen, setIsReviewOpen] = useState(false)
  const [jsonInput, setJsonInput] = useState('')
  const [parsedQuestions, setParsedQuestions] = useState<ParsedQuestion[]>([])
  const [parseError, setParseError] = useState<string | null>(null)
  const [isCopied, setIsCopied] = useState(false)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)

  // Bulk insert mutation
  const bulkInsertMutation = useMutation({
    mutationFn: async (questions: ParsedQuestion[]) => {
      const response = await fetch('/api/admin/questions/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questions })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to import questions')
      }

      return response.json()
    },
    onSuccess: (data) => {
      // Invalidate queries to refresh the question list
      queryClient.invalidateQueries({ queryKey: ['admin-questions'] })
      queryClient.invalidateQueries({ queryKey: ['questions'] })

      // Show success toast
      toast.success(`Successfully imported ${data.created} question${data.created !== 1 ? 's' : ''}`)

      // Close modal and reset state
      handleCloseReview()

      // Call onComplete callback if provided
      if (onComplete) {
        onComplete()
      }
    },
    onError: (error: Error) => {
      // Show error toast
      toast.error(error.message || 'Failed to import questions')
    }
  })

  const handleCopyTemplate = async () => {
    try {
      await navigator.clipboard.writeText(TEMPLATE_JSON)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy template:', err)
    }
  }

  const handleParseJson = () => {
    setParseError(null)

    // Validate input is not empty
    if (!jsonInput.trim()) {
      setParseError('Please provide JSON input')
      return
    }

    try {
      // Step 1: Parse JSON string
      const parsed = JSON.parse(jsonInput)

      // Step 2: Validate JSON is an array
      if (!Array.isArray(parsed)) {
        setParseError('Expected a JSON array of questions')
        return
      }

      // Step 3: Validate array is not empty
      if (parsed.length === 0) {
        setParseError('Please provide at least one question')
        return
      }

      // Step 4: Validate each question has required fields and correct types
      const validatedQuestions: ParsedQuestion[] = []
      const errors: string[] = []

      parsed.forEach((item, index) => {
        const questionErrors: string[] = []
        const questionNum = index + 1

        // Check if item is an object
        if (typeof item !== 'object' || item === null) {
          errors.push(`Question ${questionNum}: Must be an object`)
          return
        }

        // Validate required fields exist and are non-empty strings
        const requiredStringFields = ['text', 'optionA', 'optionB', 'optionC', 'optionD']
        requiredStringFields.forEach(field => {
          if (!item[field] || typeof item[field] !== 'string' || item[field].trim() === '') {
            questionErrors.push(`${field} is required and must be a non-empty string`)
          }
        })

        // Validate correctAnswer
        if (!item.correctAnswer) {
          questionErrors.push('correctAnswer is required')
        } else if (typeof item.correctAnswer !== 'string') {
          questionErrors.push('correctAnswer must be a string')
        } else if (!['A', 'B', 'C', 'D'].includes(item.correctAnswer.toUpperCase())) {
          questionErrors.push('correctAnswer must be A, B, C, or D')
        }

        // Validate difficulty
        if (!item.difficulty) {
          questionErrors.push('difficulty is required')
        } else if (typeof item.difficulty !== 'string') {
          questionErrors.push('difficulty must be a string')
        } else if (!['EASY', 'MEDIUM', 'HARD'].includes(item.difficulty.toUpperCase())) {
          questionErrors.push('difficulty must be EASY, MEDIUM, or HARD')
        }

        // Validate explanation (optional)
        if (item.explanation !== undefined && item.explanation !== null) {
          if (typeof item.explanation !== 'string') {
            questionErrors.push('explanation must be a string')
          }
        }

        // If there are errors for this question, add to errors list
        if (questionErrors.length > 0) {
          errors.push(`Question ${questionNum}: ${questionErrors.join(', ')}`)
        } else {
          // Create validated question object with normalized values
          validatedQuestions.push({
            text: item.text.trim(),
            optionA: item.optionA.trim(),
            optionB: item.optionB.trim(),
            optionC: item.optionC.trim(),
            optionD: item.optionD.trim(),
            correctAnswer: item.correctAnswer.toUpperCase() as OptionKey,
            explanation: item.explanation?.trim() || undefined,
            difficulty: item.difficulty.toUpperCase() as Difficulty,
            tagIds: [], // Initialize as empty array - tags will be assigned in review modal
            isValid: true,
            validationErrors: []
          })
        }
      })

      // If there are any validation errors, display them
      if (errors.length > 0) {
        setParseError(errors.join('\n'))
        return
      }

      // Success: Set parsed questions and open review modal
      setParsedQuestions(validatedQuestions)
      setCurrentQuestionIndex(0) // Reset to first question
      setIsJsonInputOpen(false)
      setIsReviewOpen(true)
      setJsonInput('') // Clear input for next use
    } catch (error) {
      // Handle JSON parsing errors
      if (error instanceof SyntaxError) {
        setParseError(`Invalid JSON syntax: ${error.message}`)
      } else {
        setParseError('An unexpected error occurred while parsing JSON')
      }
    }
  }

  const handleCloseJsonInput = () => {
    setIsJsonInputOpen(false)
    setJsonInput('')
    setParseError(null)
    setIsCopied(false)
  }

  const handleCloseReview = () => {
    setIsReviewOpen(false)
    setParsedQuestions([])
    setCurrentQuestionIndex(0)
  }

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < parsedQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const handleSelectQuestion = (index: number) => {
    setCurrentQuestionIndex(index)
  }

  const validateQuestion = (question: ParsedQuestion): { isValid: boolean; errors: string[] } => {
    const errors: string[] = []

    // Validate required text fields
    if (!question.text || question.text.trim() === '') {
      errors.push('Question text is required')
    }

    if (!question.optionA || question.optionA.trim() === '') {
      errors.push('Option A is required')
    }

    if (!question.optionB || question.optionB.trim() === '') {
      errors.push('Option B is required')
    }

    if (!question.optionC || question.optionC.trim() === '') {
      errors.push('Option C is required')
    }

    if (!question.optionD || question.optionD.trim() === '') {
      errors.push('Option D is required')
    }

    // Validate correct answer
    if (!question.correctAnswer || !['A', 'B', 'C', 'D'].includes(question.correctAnswer)) {
      errors.push('Correct answer must be A, B, C, or D')
    }

    // Validate difficulty
    if (!question.difficulty || !['EASY', 'MEDIUM', 'HARD'].includes(question.difficulty)) {
      errors.push('Difficulty must be EASY, MEDIUM, or HARD')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  const handleQuestionEdit = (field: keyof ParsedQuestion, value: string | string[]) => {
    setParsedQuestions(prevQuestions => {
      const updatedQuestions = [...prevQuestions]
      if (field === 'tagIds' && Array.isArray(value)) {
        updatedQuestions[currentQuestionIndex] = {
          ...updatedQuestions[currentQuestionIndex],
          tagIds: value
        }
      } else if (typeof value === 'string') {
        updatedQuestions[currentQuestionIndex] = {
          ...updatedQuestions[currentQuestionIndex],
          [field]: value
        }
      }

      // Validate the updated question
      const validation = validateQuestion(updatedQuestions[currentQuestionIndex])
      updatedQuestions[currentQuestionIndex] = {
        ...updatedQuestions[currentQuestionIndex],
        isValid: validation.isValid,
        validationErrors: validation.errors
      }

      return updatedQuestions
    })
  }

  const handleTagToggle = (tagId: string) => {
    const currentQuestion = parsedQuestions[currentQuestionIndex]
    const currentTagIds = currentQuestion.tagIds || []
    const newTagIds = currentTagIds.includes(tagId)
      ? currentTagIds.filter(id => id !== tagId)
      : [...currentTagIds, tagId]
    handleQuestionEdit('tagIds', newTagIds)
  }

  const handleBulkSubmit = () => {
    // Validate all questions before submitting
    const invalidQuestions = parsedQuestions.filter((question, index) => {
      const validation = validateQuestion(question)
      return !validation.isValid
    })

    if (invalidQuestions.length > 0) {
      toast.error(`Please fix validation errors in ${invalidQuestions.length} question${invalidQuestions.length !== 1 ? 's' : ''} before submitting`)
      return
    }

    // Submit all questions
    bulkInsertMutation.mutate(parsedQuestions)
  }

  return (
    <>
      <Button onClick={() => setIsJsonInputOpen(true)}>
        <Upload className="w-4 h-4 mr-2" />
        Bulk Import
      </Button>

      {/* JSON Input Modal */}
      <Dialog open={isJsonInputOpen} onOpenChange={setIsJsonInputOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Bulk Import Questions</DialogTitle>
            <DialogDescription>
              Paste a JSON array of questions below. You can use the template as a starting point.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Template Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Template</label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyTemplate}
                  className="h-8"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3 h-3 mr-1" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 mr-1" />
                      Copy Template
                    </>
                  )}
                </Button>
              </div>
              <pre className="bg-muted p-3 rounded-md text-xs overflow-x-auto">
                <code>{TEMPLATE_JSON}</code>
              </pre>
            </div>

            {/* Helper Text */}
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-sm">
              <p className="font-medium text-blue-900 mb-1">Expected Format:</p>
              <ul className="text-blue-800 space-y-1 ml-4 list-disc">
                <li>Provide a JSON array of question objects</li>
                <li>Required fields: text, optionA-D, correctAnswer (A/B/C/D), difficulty (EASY/MEDIUM/HARD)</li>
                <li>Optional field: explanation</li>
                <li>Tags will be assigned in the next step</li>
              </ul>
            </div>

            {/* JSON Input Textarea */}
            <div className="space-y-2">
              <label htmlFor="json-input" className="text-sm font-medium">
                JSON Input
              </label>
              <Textarea
                id="json-input"
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder="Paste your JSON array here..."
                className="min-h-[200px] font-mono text-sm"
              />
            </div>

            {/* Error Display */}
            {parseError && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-800">
                <p className="font-medium">Parse Error:</p>
                <p>{parseError}</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseJsonInput}>
              Cancel
            </Button>
            <Button onClick={handleParseJson} disabled={!jsonInput.trim()}>
              Parse Questions
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Question Review Modal */}
      <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Review Questions</DialogTitle>
            <DialogDescription>
              Review and edit your questions before importing. Question {currentQuestionIndex + 1} of {parsedQuestions.length}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 flex gap-4 overflow-hidden">
            {/* Question List Sidebar */}
            <div className="w-48 border-r pr-4 overflow-y-auto">
              <h3 className="text-sm font-medium mb-2">Questions</h3>
              <div className="space-y-1">
                {parsedQuestions.map((question, index) => {
                  const validation = validateQuestion(question)
                  return (
                    <button
                      key={index}
                      onClick={() => handleSelectQuestion(index)}
                      className={cn(
                        'w-full text-left px-3 py-2 rounded-md text-sm transition-colors relative',
                        currentQuestionIndex === index
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-medium">Question {index + 1}</div>
                        <div title={validation.isValid ? "Valid" : "Has validation errors"}>
                          {validation.isValid ? (
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-red-500" />
                          )}
                        </div>
                      </div>
                      <div className="text-xs opacity-80 truncate">
                        <MarkdownText>{question.text.substring(0, 30) + '...'}</MarkdownText>
                      </div>
                      {!validation.isValid && (
                        <div className="text-xs text-red-500 mt-1">
                          {validation.errors.length} error{validation.errors.length !== 1 ? 's' : ''}
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Current Question Form */}
            <div className="flex-1 overflow-y-auto">
              {parsedQuestions.length > 0 && parsedQuestions[currentQuestionIndex] && (
                <div className="space-y-4 pr-2">
                  {/* Validation Error Summary */}
                  {parsedQuestions[currentQuestionIndex].validationErrors &&
                    parsedQuestions[currentQuestionIndex].validationErrors!.length > 0 && (
                      <div className="bg-red-50 border border-red-200 rounded-md p-3">
                        <p className="text-sm font-medium text-red-900 mb-1">Validation Errors:</p>
                        <ul className="text-sm text-red-800 space-y-1 ml-4 list-disc">
                          {parsedQuestions[currentQuestionIndex].validationErrors!.map((error, idx) => (
                            <li key={idx}>{error}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                  {/* Question Text */}
                  <div className="space-y-2">
                    <Label htmlFor="question-text">
                      Question Text <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="question-text"
                      value={parsedQuestions[currentQuestionIndex].text}
                      onChange={(e) => handleQuestionEdit('text', e.target.value)}
                      placeholder="Enter your question here..."
                      className={cn(
                        "min-h-[80px]",
                        !parsedQuestions[currentQuestionIndex].text.trim() &&
                        parsedQuestions[currentQuestionIndex].validationErrors?.some(e => e.includes('Question text')) &&
                        "border-red-500 focus-visible:ring-red-500"
                      )}
                    />
                  </div>

                  {/* Options */}
                  <div className="space-y-3">
                    <Label>Answer Options <span className="text-red-500">*</span></Label>
                    <div className="grid grid-cols-1 gap-3">
                      {(['A', 'B', 'C', 'D'] as const).map((option) => {
                        const optionKey = `option${option}` as keyof ParsedQuestion
                        const hasError = parsedQuestions[currentQuestionIndex].validationErrors?.some(
                          e => e.includes(`Option ${option}`)
                        )
                        return (
                          <div key={option} className="space-y-1">
                            <Label htmlFor={`option-${option}`}>
                              Option {option}
                            </Label>
                            <Input
                              id={`option-${option}`}
                              value={parsedQuestions[currentQuestionIndex][optionKey] as string}
                              onChange={(e) => handleQuestionEdit(optionKey, e.target.value)}
                              placeholder={`Enter option ${option}...`}
                              className={cn(
                                hasError && "border-red-500 focus-visible:ring-red-500"
                              )}
                            />
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Correct Answer */}
                  <div className="space-y-2">
                    <Label>Correct Answer <span className="text-red-500">*</span></Label>
                    <RadioGroup
                      value={parsedQuestions[currentQuestionIndex].correctAnswer}
                      onValueChange={(value) => handleQuestionEdit('correctAnswer', value)}
                    >
                      <div className="grid grid-cols-2 gap-3">
                        {(['A', 'B', 'C', 'D'] as const).map((option) => (
                          <div key={option} className="flex items-center space-x-2">
                            <RadioGroupItem value={option} id={`correct-${option}`} />
                            <Label htmlFor={`correct-${option}`} className="cursor-pointer">
                              Option {option}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Difficulty */}
                  <div className="space-y-2">
                    <Label htmlFor="difficulty">
                      Difficulty <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={parsedQuestions[currentQuestionIndex].difficulty}
                      onValueChange={(value) => handleQuestionEdit('difficulty', value)}
                    >
                      <SelectTrigger id="difficulty">
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EASY">Easy</SelectItem>
                        <SelectItem value="MEDIUM">Medium</SelectItem>
                        <SelectItem value="HARD">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Explanation */}
                  <div className="space-y-2">
                    <Label htmlFor="explanation">Explanation (Optional)</Label>
                    <Textarea
                      id="explanation"
                      value={parsedQuestions[currentQuestionIndex].explanation || ''}
                      onChange={(e) => handleQuestionEdit('explanation', e.target.value)}
                      placeholder="Provide an explanation for the correct answer..."
                      className="min-h-[80px]"
                    />
                  </div>

                  {/* Tags */}
                  <div className="space-y-2">
                    <Label>Tags (Optional)</Label>
                    <div className="border rounded-md p-3 space-y-2 max-h-[200px] overflow-y-auto">
                      {tags.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No tags available</p>
                      ) : (
                        tags.map((tag) => (
                          <div key={tag.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`tag-${tag.id}`}
                              checked={parsedQuestions[currentQuestionIndex].tagIds.includes(tag.id)}
                              onCheckedChange={() => handleTagToggle(tag.id)}
                            />
                            <Label
                              htmlFor={`tag-${tag.id}`}
                              className="cursor-pointer font-normal"
                            >
                              {tag.name}
                            </Label>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0 || bulkInsertMutation.isPending}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextQuestion}
                disabled={currentQuestionIndex === parsedQuestions.length - 1 || bulkInsertMutation.isPending}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleCloseReview}
                disabled={bulkInsertMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleBulkSubmit}
                disabled={bulkInsertMutation.isPending}
              >
                {bulkInsertMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Importing...
                  </>
                ) : (
                  `Submit All Questions`
                )}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
