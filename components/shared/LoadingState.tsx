import { Loader2 } from 'lucide-react'

interface LoadingStateProps {
  message?: string
  size?: 'sm' | 'md' | 'lg'
}

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

// Skeleton components for specific loading states
export function QuizCardSkeleton() {
  return (
    <div className="bg-bg-cream rounded-lg border border-bg-peach p-6 animate-pulse">
      <div className="flex justify-between items-start mb-3">
        <div className="h-6 bg-bg-peach rounded w-3/4"></div>
        <div className="h-5 bg-bg-peach rounded w-12"></div>
      </div>
      <div className="h-4 bg-bg-peach rounded w-full mb-2"></div>
      <div className="h-4 bg-bg-peach rounded w-2/3 mb-4"></div>
      <div className="flex justify-between">
        <div className="h-4 bg-bg-peach rounded w-20"></div>
        <div className="h-4 bg-bg-peach rounded w-16"></div>
      </div>
    </div>
  )
}

export function LeaderboardSkeleton() {
  return (
    <div className="bg-bg-cream rounded-lg border border-bg-peach overflow-hidden">
      <div className="p-4 bg-bg-peach/50">
        <div className="h-5 bg-bg-peach rounded w-32"></div>
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="p-4 border-b border-bg-peach last:border-b-0 animate-pulse">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-bg-peach rounded-full"></div>
              <div className="h-4 bg-bg-peach rounded w-24"></div>
            </div>
            <div className="h-4 bg-bg-peach rounded w-16"></div>
          </div>
        </div>
      ))}
    </div>
  )
}