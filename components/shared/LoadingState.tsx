import { Loader2 } from 'lucide-react'
import { AvatarSkeleton, Skeleton } from './Skeleton'

interface LoadingStateProps {
  message?: string
  size?: 'sm' | 'md' | 'lg'
}

/**
 * Standard loading state component with spinner and message
 * 
 * Usage:
 * - <LoadingState /> - Default loading with "Loading..." message
 * - <LoadingState message="Loading profile..." /> - Custom message
 * - <LoadingState size="sm" /> - Smaller spinner for compact areas
 */
export function LoadingState({ 
  message = 'Loading...', 
  size = 'md' 
}: LoadingStateProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <Loader2 className={`${sizeClasses[size]} animate-spin text-primary-green mb-4`} />
      <p className="text-text-secondary">{message}</p>
    </div>
  )
}

// Re-export skeleton components for backward compatibility
export { 
  Skeleton,
  CardSkeleton as QuizCardSkeleton,
  StatCardSkeleton,
  AvatarSkeleton,
  ProgressBarSkeleton,
  ListItemSkeleton
} from './Skeleton'

// Specific skeleton for leaderboard
export function LeaderboardSkeleton() {
  return (
    <div className="bg-bg-cream rounded-lg border border-bg-peach overflow-hidden">
      <div className="p-4 bg-bg-peach/50">
        <Skeleton className="h-5 w-32" />
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="p-4 border-b border-bg-peach last:border-b-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AvatarSkeleton size="sm" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
      ))}
    </div>
  )
}