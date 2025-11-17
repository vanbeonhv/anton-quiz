'use client'

import { useState, useEffect } from 'react'
import { Edit2, Trash2 } from 'lucide-react'
import dayjs from '@/lib/dayjs'
import { UserAvatar } from '@/components/shared/UserAvatar'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { CommentForm } from './CommentForm'
import type { QuestionCommentWithAuthor } from '@/types'

interface CommentItemProps {
  comment: QuestionCommentWithAuthor
  isAuthor: boolean
  onEdit: (commentId: string, content: string) => Promise<void>
  onDelete: (commentId: string) => Promise<void>
  isEditingComment?: boolean
  isDeletingComment?: boolean
}

export function CommentItem({
  comment,
  isAuthor,
  onEdit,
  onDelete,
  isEditingComment = false,
  isDeletingComment = false,
}: CommentItemProps) {
  const [isEditMode, setIsEditMode] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Fade-in animation on mount
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50)
    return () => clearTimeout(timer)
  }, [])

  // Calculate if comment is edited (updatedAt > createdAt + 60 seconds)
  const isEdited = comment.isEdited

  // Format relative timestamp
  const relativeTime = dayjs(comment.createdAt).fromNow()

  // Get display name or fallback to email
  const displayName = comment.author.displayName || comment.userEmail

  const handleEditSubmit = async (content: string) => {
    try {
      await onEdit(comment.id, content)
      setIsEditMode(false)
    } catch (error) {
      // Let the error propagate to the form for display
      throw error
    }
  }

  const handleEditCancel = () => {
    setIsEditMode(false)
  }

  const handleDeleteConfirm = async () => {
    try {
      // Trigger fade-out animation
      setIsDeleting(true)
      
      // Wait for animation to complete before deleting
      await new Promise(resolve => setTimeout(resolve, 300))
      
      await onDelete(comment.id)
      setShowDeleteDialog(false)
    } catch (error) {
      // Reset state on error so user can retry
      setIsDeleting(false)
      // Keep dialog open to show error or allow retry
      throw error
    }
  }

  // If in edit mode, show the form with smooth transition
  if (isEditMode) {
    return (
      <div 
        className={`py-3 sm:py-4 border-b border-gray-200 last:border-b-0 transition-all duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="flex gap-2 sm:gap-3">
          <div className="flex-shrink-0">
            <UserAvatar
              userEmail={comment.userEmail}
              avatarUrl={comment.author.avatarUrl ?? undefined}
              displayName={comment.author.displayName ?? undefined}
              userId={comment.userId}
              size="md"
            />
          </div>
          <div className="flex-1 min-w-0">
            <CommentForm
              questionId={comment.questionId}
              mode="edit"
              initialContent={comment.content}
              commentId={comment.id}
              onSubmit={handleEditSubmit}
              onCancel={handleEditCancel}
              isSubmitting={isEditingComment}
            />
          </div>
        </div>
      </div>
    )
  }

  // Normal display mode
  return (
    <>
      <article 
        className={`py-3 sm:py-4 border-b border-gray-200 last:border-b-0 transition-all duration-300 ${
          isDeleting 
            ? 'opacity-0 scale-95 -translate-y-2' 
            : isVisible 
            ? 'opacity-100 scale-100 translate-y-0' 
            : 'opacity-0 scale-95 translate-y-2'
        }`}
        aria-label={`Comment by ${displayName}`}
      >
        <div className="flex gap-2 sm:gap-3">
          {/* Author Avatar */}
          <div className="flex-shrink-0">
            <UserAvatar
              userEmail={comment.userEmail}
              avatarUrl={comment.author.avatarUrl ?? undefined}
              displayName={comment.author.displayName ?? undefined}
              userId={comment.userId}
              size="md"
            />
          </div>

          <div className="flex-1 min-w-0">
            {/* Author Info and Timestamp */}
            <div className="flex items-center gap-1.5 sm:gap-2 mb-1 flex-wrap">
              <span className="font-medium text-sm sm:text-base text-gray-900 truncate">
                {displayName}
              </span>
              <span className="text-gray-400 text-xs sm:text-sm" aria-hidden="true">·</span>
              <time 
                className="text-xs sm:text-sm text-gray-500"
                dateTime={typeof comment.createdAt === 'string' ? comment.createdAt : comment.createdAt.toISOString()}
                title={dayjs(comment.createdAt).format('MMMM D, YYYY [at] h:mm A')}
              >
                {relativeTime}
              </time>
              {isEdited && (
                <>
                  <span className="text-gray-400 text-xs sm:text-sm" aria-hidden="true">·</span>
                  <span className="text-xs text-gray-500 italic">
                    edited
                  </span>
                </>
              )}
            </div>

            {/* Comment Content */}
            <div className="text-sm sm:text-base text-gray-700 whitespace-pre-wrap break-words">
              {comment.content}
            </div>

            {/* Action Buttons (only for author) */}
            {isAuthor && (
              <div className="flex items-center gap-1 sm:gap-2 mt-2 sm:mt-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditMode(true)}
                  disabled={isEditingComment || isDeletingComment}
                  className="h-7 sm:h-8 px-1.5 sm:px-2 text-xs sm:text-sm text-gray-600 hover:text-primary-green hover:bg-primary-green/10 focus-visible:ring-2 focus-visible:ring-primary-green focus-visible:ring-offset-2"
                  aria-label={`Edit your comment: ${comment.content.substring(0, 50)}${comment.content.length > 50 ? '...' : ''}`}
                >
                  <Edit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-1" aria-hidden="true" />
                  <span className="hidden sm:inline">Edit</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDeleteDialog(true)}
                  disabled={isEditingComment || isDeletingComment}
                  className="h-7 sm:h-8 px-1.5 sm:px-2 text-xs sm:text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                  aria-label={`Delete your comment: ${comment.content.substring(0, 50)}${comment.content.length > 50 ? '...' : ''}`}
                >
                  <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-1" aria-hidden="true" />
                  <span className="hidden sm:inline">Delete</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </article>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[425px]" aria-describedby="delete-dialog-description">
          <DialogHeader>
            <DialogTitle>Delete Comment</DialogTitle>
            <DialogDescription id="delete-dialog-description">
              Are you sure you want to delete this comment? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeletingComment}
              className="w-full sm:w-auto"
              aria-label="Cancel deletion"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeletingComment}
              className="w-full sm:w-auto"
              aria-label="Confirm delete comment"
            >
              {isDeletingComment ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
