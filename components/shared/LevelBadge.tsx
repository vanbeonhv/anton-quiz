'use client'

import { Badge } from '@/components/ui/badge'
import { Trophy, Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LevelBadgeProps {
  level: number
  title: string
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
  className?: string
}

/**
 * Display a user's level and title as a styled badge
 */
export function LevelBadge({ 
  level, 
  title, 
  size = 'md', 
  showIcon = true,
  className 
}: LevelBadgeProps) {
  // Determine badge color based on level ranges
  const getBadgeVariant = (level: number) => {
    if (level >= 15) return 'default' // Senior levels - purple/blue
    if (level >= 10) return 'secondary' // Mid-level - gray
    if (level >= 5) return 'outline' // Junior levels - outlined
    return 'destructive' // Newbie/Intern levels - red/orange
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
        'font-semibold flex items-center',
        sizeClasses[size],
        className
      )}
    >
      {showIcon && getIcon(level)}
      <span>Level {level}</span>
      <span className="hidden sm:inline">- {title}</span>
    </Badge>
  )
}