'use client'

import { useState, useEffect } from 'react'
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { LoadingOverlay } from '@/components/shared/LoadingOverlay'
import {
  validateCommentContent,
  getCommentCharacterCount,
  COMMENT_CONSTRAINTS
} from '@/lib/utils/comments'

interface CommentFormProps {
  questionId: string
  mode: 'create' | 'edit'
  initialContent?: string
  commentId?: string
  onSubmit: (content: string, commentId?: string) => Promise<void>
  onCancel?: () => void
  isSubmitting?: boolean
}

export function CommentForm({
  questionId,
  mode,
  initialContent = '',
  commentId,
  onSubmit,
  onCancel,
  isSubmitting = false
}: CommentFormProps) {
  const [content, setContent] = useState(initialContent)
  const [error, setError] = useState<string | undefined>()

  // Reset content when initialContent changes (for edit mode)
  useEffect(() => {
    setContent(initialContent)
    setError(undefined)
  }, [initialContent])

  const charCount = getCommentCharacterCount(content)
  const validation = validateCommentContent(content)
  const isValid = validation.isValid
  const isOverLimit = charCount > COMMENT_CONSTRAINTS.MAX_LENGTH
  const isEmpty = charCount === 0

  // Determine character counter state
  const getCounterState = () => {
    if (isEmpty) return 'empty'
    if (isOverLimit) return 'error'
    return 'valid'
  }

  const counterState = getCounterState()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate before submission
    const validationResult = validateCommentContent(content)
    if (!validationResult.isValid) {
      setError(validationResult.error)
      return
    }

    try {
      setError(undefined)
      await onSubmit(content.trim(), commentId)
      
      // Clear form after successful submission (only in create mode)
      if (mode === 'create') {
        setContent('')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit comment')
    }
  }

  const handleCancel = () => {
    setContent(initialContent)
    setError(undefined)
    onCancel?.()
  }

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value)
    // Clear error when user starts typing
    if (error) {
      setError(undefined)
    }
  }

  return (
    <LoadingOverlay 
      isLoading={isSubmitting} 
      loadingText={mode === 'create' ? 'Posting comment...' : 'Saving changes...'}
      className="rounded-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-2">
        <Textarea
          value={content}
          onChange={handleContentChange}
          placeholder={mode === 'create' ? 'Write your comment...' : 'Edit your comment...'}
          disabled={isSubmitting}
          className={`min-h-[100px] sm:min-h-[120px] resize-none ${
            error ? 'border-red-500 focus-visible:ring-red-500' : ''
          }`}
          aria-label={mode === 'create' ? 'Comment content' : 'Edit comment content'}
          aria-invalid={!!error}
          aria-describedby={error ? 'comment-error' : 'character-counter'}
          autoFocus={mode === 'edit'}
        />

        {/* Character Counter */}
        <div className="flex items-center justify-between">
          <div
            id="character-counter"
            className={`flex items-center gap-1.5 text-xs sm:text-sm ${
              counterState === 'empty'
                ? 'text-gray-400'
                : counterState === 'error'
                ? 'text-red-600'
                : 'text-green-600'
            }`}
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            {counterState === 'valid' && (
              <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" aria-hidden="true" />
            )}
            {counterState === 'error' && (
              <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" aria-hidden="true" />
            )}
            <span>
              Characters: {charCount} / {COMMENT_CONSTRAINTS.MAX_LENGTH}
            </span>
          </div>
        </div>

        {/* Inline Error Message */}
        {error && (
          <div
            id="comment-error"
            className="flex items-center gap-1.5 text-xs sm:text-sm text-red-600"
            role="alert"
            aria-live="assertive"
          >
            <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <Button
          type="submit"
          disabled={!isValid || isSubmitting}
          className="bg-primary-green hover:bg-primary-green/90 w-full sm:w-auto"
          aria-label={mode === 'create' ? 'Post comment' : 'Save comment changes'}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" aria-hidden="true" />
              {mode === 'create' ? 'Posting...' : 'Saving...'}
            </>
          ) : (
            <>{mode === 'create' ? 'Post Comment' : 'Save Changes'}</>
          )}
        </Button>

        {mode === 'edit' && onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
            className="w-full sm:w-auto"
            aria-label="Cancel editing comment"
          >
            Cancel
          </Button>
        )}
      </div>
      </form>
    </LoadingOverlay>
  )
}
