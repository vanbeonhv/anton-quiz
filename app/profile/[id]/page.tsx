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

/**
 * Renders the member profile page for the given route params.
 *
 * @param params - Route parameters with `id` set to the user's identifier
 * @returns A page element that displays a user profile inside a Suspense boundary, showing a skeleton fallback while the profile content loads
 */
export default function MemberProfilePage({ params }: MemberProfilePageProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<UserProfileSkeleton />}>
        <UserProfileContent userId={params.id} />
      </Suspense>
    </div>
  )
}