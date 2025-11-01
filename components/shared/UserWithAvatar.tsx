'use client'

import Link from 'next/link'
import { UserAvatar } from './UserAvatar'
import { LevelBadge } from './LevelBadge'
import { cn } from '@/lib/utils'

interface UserWithAvatarProps {
  userId?: string
  userEmail: string
  avatarUrl?: string | null
  displayName?: string
  className?: string
  avatarSize?: 'sm' | 'md' | 'lg'
  rank?: number
  currentLevel?: number
  currentTitle?: string
  showLevel?: boolean
}

/**
 * Render a user avatar alongside the user's display name, and wrap them in a profile link when an ID is provided.
 *
 * @param userId - When present, wraps the avatar and name in a link to `/profile/{userId}`; when absent, renders a non-clickable container.
 * @param displayName - Text shown next to the avatar; if omitted the user's email is used instead.
 * @param className - Additional CSS classes applied to the outer container/link.
 * @param avatarSize - Explicit avatar size override; when omitted the size is determined from `rank` (top 3 => 'lg', otherwise 'md').
 * @param rank - Numeric ranking used to auto-determine avatar size when `avatarSize` is not provided.
 * @returns A JSX element containing the avatar and display text, optionally wrapped in a link to the user's profile.
 */
export function UserWithAvatar({
  userId,
  userEmail,
  avatarUrl,
  displayName,
  className,
  avatarSize,
  rank,
  currentLevel,
  currentTitle,
  showLevel = false,
}: UserWithAvatarProps) {
  // Auto-determine avatar size based on rank if not explicitly provided
  // Top 3 users (ranks 1-3) get 'lg' (40px), others get 'md' (32px)
  const determinedSize = avatarSize || (rank && rank <= 3 ? 'lg' : 'md')

  // Use displayName if provided, otherwise use email
  const displayText = displayName || userEmail

  // If userId is missing, render without link
  if (!userId) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <UserAvatar
          userEmail={userEmail}
          avatarUrl={avatarUrl}
          size={determinedSize}
          rank={rank}
        />
        <div className="flex flex-col">
          <span className="truncate font-medium text-sm">
            {displayText}
          </span>
          {showLevel && currentLevel && currentTitle && (
            <LevelBadge 
              level={currentLevel} 
              title={currentTitle} 
              size="sm"
              showIcon={false}
              className="mt-1"
              variant="display-only"
            />
          )}
        </div>
      </div>
    )
  }

  return (
    <Link
      href={`/profile/${userId}`}
      className={cn('flex items-center gap-2 group', className)}
    >
      <UserAvatar
        userEmail={userEmail}
        avatarUrl={avatarUrl}
        size={determinedSize}
        rank={rank}
      />
      <div className="flex flex-col">
        <span className="truncate font-medium text-sm group-hover:underline">
          {displayText}
        </span>
        {showLevel && currentLevel && currentTitle && (
          <LevelBadge 
            level={currentLevel} 
            title={currentTitle} 
            size="sm"
            showIcon={false}
            className="mt-1"
            variant="display-only"
          />
        )}
      </div>
    </Link>
  )
}