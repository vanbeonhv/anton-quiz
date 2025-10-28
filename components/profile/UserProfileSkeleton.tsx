import {
  Skeleton,
  StatCardSkeleton,
  AvatarSkeleton,
  ProgressBarSkeleton,
  ListItemSkeleton
} from '@/components/shared/Skeleton'

export function UserProfileSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header Skeleton */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center space-x-4">
          <AvatarSkeleton />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      {/* Progress Section Skeleton */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <Skeleton className="h-6 w-48 mb-6" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <ProgressBarSkeleton key={i} />
          ))}
        </div>
      </div>

      {/* Activity Timeline Skeleton */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <Skeleton className="h-6 w-40 mb-6" />
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <ListItemSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  )
}