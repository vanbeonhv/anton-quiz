import { cn } from '@/lib/utils'

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
}

/**
 * Base skeleton component for loading placeholders
 * 
 * Usage:
 * - <Skeleton className="h-4 w-32" /> - Basic skeleton
 * - <StatCardSkeleton /> - Pre-built stat card skeleton
 * - <AvatarSkeleton size="lg" /> - Avatar placeholder
 */
export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-bg-peach/60",
        className
      )}
      {...props}
    />
  )
}

// Specific skeleton components for common patterns
export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("bg-white rounded-lg border p-6 space-y-4", className)}>
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  )
}

export function StatCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("bg-white rounded-lg border p-6", className)}>
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="w-12 h-12 rounded-lg" />
      </div>
    </div>
  )
}

export function AvatarSkeleton({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-16 h-16',
    lg: 'w-24 h-24'
  }
  
  return <Skeleton className={cn("rounded-full", sizeClasses[size])} />
}

export function ProgressBarSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-16" />
      </div>
      <Skeleton className="h-2 w-full rounded-full" />
    </div>
  )
}

export function ListItemSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center space-x-4 py-3", className)}>
      <AvatarSkeleton size="sm" />
      <div className="flex-1 space-y-1">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  )
}