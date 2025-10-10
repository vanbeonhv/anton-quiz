import { User, Calendar } from 'lucide-react'
import dayjs from '@/lib/dayjs'

interface UserProfileHeaderProps {
  userEmail: string
  joinDate: Date
}

export function UserProfileHeader({ userEmail, joinDate }: UserProfileHeaderProps) {
  const formatJoinDate = (date: Date) => {
    return dayjs(date).format('MMMM D, YYYY')
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center space-x-4">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
          <User className="w-8 h-8 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{userEmail}</h1>
          <div className="flex items-center text-gray-600 mt-1">
            <Calendar className="w-4 h-4 mr-2" />
            <span>Joined {formatJoinDate(joinDate)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}