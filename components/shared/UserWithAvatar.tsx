'use client'

import { UserAvatar } from './UserAvatar'
import { cn } from '@/lib/utils'

interface UserWithAvatarProps {
  userEmail: string
  avatarUrl?: string | null
  displayName?: string
  className?: string
  avatarSize?: 'sm' | 'md' | 'lg'
  rank?: number
}

export function UserWithAvatar({
  userEmail,
  avatarUrl,
  displayName,
  className,
  avatarSize,
  rank,
}: UserWithAvatarProps) {
  // Auto-determine avatar size based on rank if not explicitly provided
  // Top 3 users (ranks 1-3) get 'lg' (40px), others get 'md' (32px)
  const determinedSize = avatarSize || (rank && rank <= 3 ? 'lg' : 'md')
  
  // Use displayName if provided, otherwise use email
  const displayText = displayName || userEmail

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <UserAvatar
        userEmail={userEmail}
        avatarUrl={avatarUrl}
        size={determinedSize}
      />
      <span className="truncate font-medium text-sm">
        {displayText}
      </span>
    </div>
  )
}
