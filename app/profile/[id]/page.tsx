import { Suspense } from 'react'
import {
  UserProfileContent,
  UserProfileSkeleton,
} from '@/components/profile'

interface MemberProfilePageProps {
  params: {
    id: string
  }
}

export default function MemberProfilePage({ params }: MemberProfilePageProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<UserProfileSkeleton />}>
        <UserProfileContent userId={params.id} />
      </Suspense>
    </div>
  )
}