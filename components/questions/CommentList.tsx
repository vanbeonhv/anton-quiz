'use client'

import { MessageSquare } from 'lucide-react'
import { CommentItem } from './CommentItem'
import { EmptyState } from '@/components/shared/EmptyState'
import { Skeleton, AvatarSkeleton } from '@/components/shared/Skeleton'
import type { QuestionCommentWithAuthor } from '@/types'

interface CommentListProps {
  comments: QuestionCommentWithAuthor[]
  currentUserId?: string
  onEdit: (commentId: string, content: string) => Promise<void>
  onDelete: (commentId: string) => Promise<void>
  isLoading?: boolean
  error?: Error | null
  editingCommentId?: string
  deletingCommentId?: string
}

// Skeleton loader for individual comment with animation
function CommentSkeleton({ delay = 0 }: { delay?: number }) {
  return (
    <div 
      className="py-3 sm:py-4 border-b border-gray-200 last:border-b-0 animate-pulse"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex gap-2 sm:gap-3">
        <AvatarSkeleton size="md" />
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 sm:h-4 w-20 sm:w-24" />
            <Skeleton className="h-3 sm:h-4 w-12 sm:w-16" />
          </div>
          <Skeleton className="h-3 sm:h-4 w-full" />
          <Skeleton className="h-3 sm:h-4 w-3/4" />
          <Skeleton className="h-3 sm:h-4 w-5/6" />
        </div>
      </div>
    </div>
  )
}

export function CommentList({
  comments,
  currentUserId,
  onEdit,
  onDelete,
  isLoading = false,
  error = null,
  editingCommentId,
  deletingCommentId
}: CommentListProps) {
  // Handle loading state with staggered animation
  if (isLoading) {
    return (
      <div className="space-y-0">
        {Array.from({ length: 3 }).map((_, i) => (
          <CommentSkeleton key={i} delay={i * 100} />
        ))}
      </div>
    )
  }

  // Handle error state
  if (error) {
    return (
      <div 
        className="py-6 sm:py-8 px-4 text-center" 
        role="alert"
        aria-live="polite"
      >
        <div className="text-sm sm:text-base text-red-600 mb-2 font-medium">
          Failed to load comments
        </div>
        <p className="text-xs sm:text-sm text-gray-500">
          {error.message || 'An error occurred while loading comments'}
        </p>
      </div>
    )
  }

  // Handle empty state
  if (comments.length === 0) {
    return (
      <EmptyState
        icon={MessageSquare}
        title="No comments yet"
        description="Be the first to share your thoughts on this question!"
      />
    )
  }

  // Sort comments chronologically (oldest first)
  const sortedComments = [...comments].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  )

  // Render comment list
  return (
    <div 
      className="space-y-0" 
      role="feed" 
      aria-label="Question comments"
    >
      {sortedComments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          isAuthor={currentUserId === comment.userId}
          onEdit={onEdit}
          onDelete={onDelete}
          isEditingComment={editingCommentId === comment.id}
          isDeletingComment={deletingCommentId === comment.id}
        />
      ))}
    </div>
  )
}
