'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { MessageSquare } from 'lucide-react'
import { CommentForm } from './CommentForm'
import { CommentList } from './CommentList'
import { useComments, useCreateComment, useUpdateComment, useDeleteComment } from '@/lib/queries'

interface QuestionCommentsProps {
  questionId: string
  isAuthenticated: boolean
  currentUserId?: string
}

export function QuestionComments({
  questionId,
  isAuthenticated,
  currentUserId
}: QuestionCommentsProps) {
  const [editingCommentId, setEditingCommentId] = useState<string | undefined>()
  const [deletingCommentId, setDeletingCommentId] = useState<string | undefined>()
  const [isVisible, setIsVisible] = useState(false)

  // Fade-in animation on mount
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  // Fetch comments
  const {
    data: comments = [],
    isLoading,
    error
  } = useComments(questionId)

  // Mutations
  const createCommentMutation = useCreateComment(questionId)
  const updateCommentMutation = useUpdateComment(questionId)
  const deleteCommentMutation = useDeleteComment(questionId)

  // Handle comment creation
  const handleCreateComment = async (content: string) => {
    try {
      await createCommentMutation.mutateAsync({ content })
      toast.success('Comment posted successfully')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to post comment')
      throw error // Re-throw to let CommentForm handle it
    }
  }

  // Handle comment editing
  const handleEditComment = async (commentId: string, content: string) => {
    setEditingCommentId(commentId)
    try {
      await updateCommentMutation.mutateAsync({ commentId, data: { content } })
      toast.success('Comment updated successfully')
      setEditingCommentId(undefined)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update comment')
      setEditingCommentId(undefined)
      throw error
    }
  }

  // Handle comment deletion
  const handleDeleteComment = async (commentId: string) => {
    setDeletingCommentId(commentId)
    try {
      await deleteCommentMutation.mutateAsync(commentId)
      toast.success('Comment deleted successfully')
      setDeletingCommentId(undefined)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete comment')
      setDeletingCommentId(undefined)
      throw error
    }
  }

  return (
    <section 
      className={`mt-6 sm:mt-8 border-t border-gray-200 pt-6 sm:pt-8 transition-all duration-500 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
      aria-labelledby="comments-heading"
    >
      {/* Section Header */}
      <div className="flex items-center gap-2 mb-4 sm:mb-6">
        <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" aria-hidden="true" />
        <h2 
          id="comments-heading" 
          className="text-lg sm:text-xl font-semibold text-gray-900"
        >
          Discussion
        </h2>
        <span 
          className="text-xs sm:text-sm text-gray-500"
          aria-label={`${comments.length} ${comments.length === 1 ? 'comment' : 'comments'}`}
        >
          ({comments.length})
        </span>
      </div>

      {/* Comment Form (only for authenticated users) */}
      {isAuthenticated && (
        <div className="mb-4 sm:mb-6">
          <CommentForm
            questionId={questionId}
            mode="create"
            onSubmit={handleCreateComment}
            isSubmitting={createCommentMutation.isPending}
          />
        </div>
      )}

      {/* Comment List */}
      <CommentList
        comments={comments}
        currentUserId={currentUserId}
        onEdit={handleEditComment}
        onDelete={handleDeleteComment}
        isLoading={isLoading}
        error={error}
        editingCommentId={editingCommentId}
        deletingCommentId={deletingCommentId}
      />
    </section>
  )
}
