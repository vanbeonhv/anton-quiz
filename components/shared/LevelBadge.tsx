'use client'

import { Badge } from '@/components/ui/badge'
import { Trophy, Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUserLevelSafe } from '@/components/providers/UserLevelProvider'

interface LevelBadgeProps {
  level?: number
  title?: string
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
  className?: string
  variant?: 'clickable' | 'display-only'
}

/**
 * Display a user's level and title as a styled badge
 */
export function LevelBadge({
  level: propLevel,
  title: propTitle,
  size = 'md',
  showIcon = true,
  className,
  variant = 'clickable'
}: LevelBadgeProps) {
  // Use context data when available, but props take precedence when provided
  const userLevelContext = useUserLevelSafe()

  // Determine data source - props take precedence over context
  const level = propLevel ?? userLevelContext?.userStats?.currentLevel
  const title = propTitle ?? userLevelContext?.userStats?.currentTitle
  const isLoading = userLevelContext?.isLoading ?? false
  const hasError = userLevelContext?.error !== null && userLevelContext?.error !== undefined

  // Handle loading state when context is loading and no props provided
  if (isLoading && !propLevel && !propTitle) {
    return (
      <Badge
        variant="outline"
        className={cn(
          'font-semibold flex items-center animate-pulse',
          size === 'sm' ? 'text-xs px-2 py-1 gap-1' :
            size === 'md' ? 'text-sm px-3 py-1.5 gap-1.5' :
              'text-base px-4 py-2 gap-2',
          className
        )}
      >
        <div className="w-4 h-4 bg-gray-300 rounded"></div>
        <span>Loading...</span>
      </Badge>
    )
  }

  // Handle error state when context has error and no props provided
  if (hasError && !propLevel && !propTitle) {
    return (
      <Badge
        variant="outline"
        className={cn(
          'font-semibold flex items-center text-muted-foreground',
          size === 'sm' ? 'text-xs px-2 py-1 gap-1' :
            size === 'md' ? 'text-sm px-3 py-1.5 gap-1.5' :
              'text-base px-4 py-2 gap-2',
          className
        )}
      >
        <span>Level --</span>
      </Badge>
    )
  }

  // Early return if no level data is available from any source
  if (!level || !title) {
    return null
  }
  // Handle click to open drawer (only for current user's level, not other users)
  const handleClick = () => {
    if (variant === 'clickable') {
      console.log(userLevelContext);

      // Only allow opening drawer if we're showing current user's level (no props provided)
      if (userLevelContext?.openDrawer) {
        userLevelContext.openDrawer()
      } else {
        // Fallback behavior when context is not available
        console.warn('LevelBadge: UserLevelProvider context not available for drawer functionality')
      }
    }
  }

  // Determine badge color based on level ranges
  const getBadgeVariant = (level: number) => {
    if (level >= 15) return 'default' // Senior levels - purple/blue
    if (level >= 10) return 'secondary' // Mid-level - gray
    if (level >= 5) return 'outline' // Junior levels - outlined
    return 'beginner' // Newbie/Intern levels - light orange
  }

  // Size-based styling
  const sizeClasses = {
    sm: 'text-xs px-2 py-1 gap-1',
    md: 'text-sm px-3 py-1.5 gap-1.5',
    lg: 'text-base px-4 py-2 gap-2'
  }

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }

  // Choose icon based on level
  const getIcon = (level: number) => {
    if (level >= 15) return <Trophy className={iconSizes[size]} />
    return <Star className={iconSizes[size]} />
  }

  return (
    <Badge
      variant={getBadgeVariant(level)}
      className={cn(
        'font-semibold flex items-center transition-all',
        (variant === 'clickable' ? 'cursor-pointer hover:scale-105' : 'cursor-default'),
        sizeClasses[size],
        className
      )}
      onClick={handleClick}
    >
      {showIcon && getIcon(level)}
      <span>Level {level}</span>
      <span className="hidden sm:inline">- {title}</span>
    </Badge>
  )
}