import { Calendar } from 'lucide-react'
import dayjs from '@/lib/dayjs'
import { UserAvatar } from '@/components/shared/UserAvatar'
import { LevelBadge } from '@/components/shared/LevelBadge'
import { LevelProgress } from '@/components/shared/LevelProgress'

interface UserProfileHeaderProps {
  userEmail: string
  displayName?: string | null
  avatarUrl?: string | null
  joinDate: Date
  currentLevel?: number
  currentTitle?: string
  totalXp?: number
}

export function UserProfileHeader({
  userEmail,
  displayName,
  avatarUrl,
  joinDate,
  currentLevel = 1,
  currentTitle = "Newbie",
  totalXp = 0
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
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">
              {preferredName}
            </h1>
            <LevelBadge 
              level={currentLevel} 
              title={currentTitle} 
              size="lg"
            />
          </div>
          <div className="flex items-center text-gray-600 mb-3">
            <Calendar className="w-4 h-4 mr-2" />
            <span>Joined {formatJoinDate(joinDate)}</span>
          </div>
          {displayName && (
            <p className="text-sm text-gray-500 mb-3">{userEmail}</p>
          )}
          <div className="max-w-md">
            <LevelProgress 
              currentLevel={currentLevel}
              totalXp={totalXp}
              showDetails={true}
            />
          </div>
        </div>
      </div>
    </div>
  )
}