'use client'

import { Badge } from '@/components/ui/badge'
import { Trophy, Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUserLevelSafe } from '@/components/providers/UserLevelProvider'

/**
 * Get badge color classes based on level ranges
 * Matches LevelDrawer progressive colors (lighter variant)
 */
function getBadgeColor(level: number): string {
  // Senior levels (15-20) - spectacular purples, pinks, and golds (lighter)
  if (level >= 20) return 'bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 text-white shadow-lg border-yellow-500'
  if (level >= 19) return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-purple-700'
  if (level >= 18) return 'bg-pink-500 text-white border-pink-700'
  if (level >= 17) return 'bg-fuchsia-500 text-white border-fuchsia-700'
  if (level >= 16) return 'bg-violet-500 text-white border-violet-700'
  if (level >= 15) return 'bg-purple-500 text-white border-purple-700'
  
  // Mid levels (10-14) - intense blues (lighter)
  if (level >= 14) return 'bg-indigo-500 text-white border-indigo-700'
  if (level >= 13) return 'bg-blue-500 text-white border-blue-700'
  if (level >= 12) return 'bg-blue-400 text-white border-blue-600'
  if (level >= 11) return 'bg-sky-400 text-white border-sky-600'
  if (level >= 10) return 'bg-cyan-400 text-white border-cyan-600'
  
  // Junior levels (5-9) - vibrant greens (lighter)
  if (level >= 9) return 'bg-teal-400 text-white border-teal-600'
  if (level >= 8) return 'bg-green-400 text-white border-green-600'
  if (level >= 7) return 'bg-green-300 text-green-900 border-green-500'
  if (level >= 6) return 'bg-emerald-300 text-emerald-900 border-emerald-500'
  if (level >= 5) return 'bg-emerald-200 text-emerald-800 border-emerald-400'
  
  // Beginner levels (1-4) - warm oranges and reds (lighter)
  if (level >= 4) return 'bg-red-300 text-red-900 border-red-500'
  if (level >= 3) return 'bg-red-200 text-red-800 border-red-400'
  if (level >= 2) return 'bg-orange-200 text-orange-800 border-orange-400'
  return 'bg-orange-100 text-orange-700 border-orange-300'
}

interface LevelBadgeProps {
  level?: number
  title?: string
  totalXp?: number
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
  className?: string
  variant?: 'clickable' | 'display-only'
  onClick?: () => void
}

/**
 * Display a user's level and title as a styled badge
 */
export function LevelBadge({
  level: propLevel,
  title: propTitle,
  totalXp: propTotalXp,
  size = 'md',
  showIcon = true,
  className,
  variant = 'clickable',
  onClick: customOnClick
}: LevelBadgeProps) {
  // Use context data when available, but props take precedence when provided
  const userLevelContext = useUserLevelSafe()

  // Determine data source - props take precedence over context
  const level = propLevel ?? userLevelContext?.userStats?.currentLevel
  const title = propTitle ?? userLevelContext?.userStats?.currentTitle
  const totalXp = propTotalXp ?? userLevelContext?.userStats?.totalXp
  const isLoading = userLevelContext?.isLoading ?? false
  const hasError = userLevelContext?.error !== null && userLevelContext?.error !== undefined

  // Size-based styling constants
  const sizeClasses = {
    sm: 'text-xs px-2 py-1 gap-1',
    md: 'text-sm px-3 py-1.5 gap-1.5',
    lg: 'text-base px-4 py-2 gap-2'
  }

  // Handle loading state when context is loading and no props provided
  if (isLoading && !propLevel && !propTitle) {
    return (
      <Badge
        variant="outline"
        className={cn(
          'font-semibold flex items-center animate-pulse',
          sizeClasses[size],
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
          sizeClasses[size],
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
  // Handle click to open drawer
  const handleClick = () => {
    if (variant === 'clickable') {
      // Use custom onClick if provided, otherwise use context drawer
      if (customOnClick) {
        customOnClick()
      } else if (userLevelContext?.openDrawer) {
        userLevelContext.openDrawer()
      } else {
        console.warn('LevelBadge: UserLevelProvider context not available for drawer functionality')
      }
    }
  }

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }

  // Choose icon based on level (Trophy for senior levels, Star for others)
  const Icon = level >= 15 ? Trophy : Star

  return (
    <div
      className={cn(
        'font-semibold inline-flex items-center transition-all rounded-md border hover:scale-105 hover:shadow-lg hover:brightness-110',
        getBadgeColor(level),
        variant === 'clickable' 
          ? 'cursor-pointer ' 
          : 'cursor-default',
        sizeClasses[size],
        className
      )}
      onClick={handleClick}
    >
      {showIcon && <Icon className={iconSizes[size]} />}
      <span>Level {level}</span>
      <span className="hidden sm:inline">- {title}</span>
    </div>
  )
}