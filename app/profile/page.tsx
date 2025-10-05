import { Suspense } from 'react'
import { UserProfileContent, UserProfileSkeleton } from '@/components/profile'

export default function ProfilePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<UserProfileSkeleton />}>
        <UserProfileContent />
      </Suspense>
    </div>
  )
}