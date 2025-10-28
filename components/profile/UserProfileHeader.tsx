import { Calendar } from 'lucide-react'
import dayjs from '@/lib/dayjs'
import { UserAvatar } from '@/components/shared/UserAvatar'

interface UserProfileHeaderProps {
  userEmail: string
  displayName?: string | null
  avatarUrl?: string | null
  joinDate: Date
}

export function UserProfileHeader({
  userEmail,
  displayName,
  avatarUrl,
  joinDate
}: UserProfileHeaderProps) {
  const formatJoinDate = (date: Date) => {
    return dayjs(date).format('MMMM D, YYYY')
  }

  // Use display name if available, otherwise fall back to email username
  const preferredName = displayName || userEmail.split('@')[0]

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center space-x-6">
        <UserAvatar
          userEmail={userEmail}
          avatarUrl={avatarUrl}
          size="xl"
        />
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">
            {preferredName}
          </h1>
          <div className="flex items-center text-gray-600 mb-2">
            <Calendar className="w-4 h-4 mr-2" />
            <span>Joined {formatJoinDate(joinDate)}</span>
          </div>
          {displayName && (
            <p className="text-sm text-gray-500">{userEmail}</p>
          )}
        </div>
      </div>
    </div>
  )
}