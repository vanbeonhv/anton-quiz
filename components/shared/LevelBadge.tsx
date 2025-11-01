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
  // Use context data when available, fallback to props for backward compatibility
  const userLevelContext = useUserLevelSafe()
  
  // Determine data source - context takes precedence if available and has data
  const hasContextData = userLevelContext?.userStats?.level && userLevelContext?.userStats?.levelTitle
  const level = hasContextData ? userLevelContext.userStats.level : propLevel
  const title = hasContextData ? userLevelContext.userStats.levelTitle : propTitle
  const isLoading = userLevelContext?.isLoading ?? false
  const hasError = userLevelContext?.error !== null
  
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
  // Handle click to open drawer (only for clickable variant and when context is available)
  const handleClick = () => {
    if (variant === 'clickable') {
      if (userLevelContext?.openDrawer) {
        console.log('opennn')
        userLevelContext.openDrawer()
      } else {
        // Fallback behavior when context is not available - could log or show a message
        console.warn('LevelBadge: UserLevelProvider context not available for drawer functionality')
      }
    }
  }
  
  // Determine if the badge should be clickable based on context availability
  const isClickable = variant === 'clickable' && userLevelContext?.openDrawer

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
        isClickable && 'cursor-pointer hover:scale-105',
        (variant === 'display-only' || !isClickable) && 'cursor-default',
        sizeClasses[size],
        className
      )}
      onClick={isClickable ? handleClick : undefined}
    >
      {showIcon && getIcon(level)}
      <span>Level {level}</span>
      <span className="hidden sm:inline">- {title}</span>
    </Badge>
  )
}