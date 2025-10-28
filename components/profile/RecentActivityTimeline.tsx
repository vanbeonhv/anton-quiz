import { CheckCircle, XCircle, Trophy, Target, Clock } from 'lucide-react'
import dayjs from '@/lib/dayjs'
import { MarkdownText } from '@/lib/utils/markdown'

interface QuestionActivity {
  type: 'question'
  id: string
  date: Date
  isCorrect: boolean
  question: {
    id: string
    number: number
    text: string
  }
}

interface QuizActivity {
  type: 'quiz'
  id: string
  date: Date
  score: number
  totalQuestions: number
  quiz: {
    id: string
    title: string
    type: 'NORMAL' | 'DAILY'
  }
}

type Activity = QuestionActivity | QuizActivity

interface RecentActivityTimelineProps {
  activities: Activity[]
}

interface ActivityItemProps {
  activity: Activity
}

function ActivityItem({ activity }: ActivityItemProps) {
  const formatDate = (date: Date) => {
    const activityDate = dayjs(date)
    const now = dayjs()
    
    const diffInHours = now.diff(activityDate, 'hour')
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    
    const diffInDays = now.diff(activityDate, 'day')
    if (diffInDays < 7) return `${diffInDays}d ago`
    
    return activityDate.format('M/D/YYYY')
  }

  if (activity.type === 'question') {
    return (
      <div className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
          activity.isCorrect ? 'bg-green-100' : 'bg-red-100'
        }`}>
          {activity.isCorrect ? (
            <CheckCircle className="w-4 h-4 text-green-600" />
          ) : (
            <XCircle className="w-4 h-4 text-red-600" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <Target className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-900">
              Question #{activity.question.number}
            </span>
            <span className={`text-xs px-2 py-1 rounded-full ${
              activity.isCorrect 
                ? 'bg-green-100 text-green-700' 
                : 'bg-red-100 text-red-700'
            }`}>
              {activity.isCorrect ? 'Correct' : 'Incorrect'}
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-1 truncate">
            <MarkdownText>{activity.question.text}</MarkdownText>
          </p>
          <div className="flex items-center space-x-2 mt-1 text-xs text-gray-500">
            <span>Practice</span>
            <span>•</span>
            <span>{formatDate(activity.date)}</span>
          </div>
        </div>
      </div>
    )
  }

  // Quiz activity
  const percentage = Math.round((activity.score / activity.totalQuestions) * 100)
  const isDaily = activity.quiz.type === 'DAILY'

  return (
    <div className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
        isDaily ? 'bg-blue-100' : 'bg-purple-100'
      }`}>
        <Trophy className={`w-4 h-4 ${isDaily ? 'text-blue-600' : 'text-purple-600'}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-900">
            {activity.quiz.title}
          </span>
          <span className={`text-xs px-2 py-1 rounded-full ${
            percentage >= 80 
              ? 'bg-green-100 text-green-700'
              : percentage >= 60
              ? 'bg-yellow-100 text-yellow-700'
              : 'bg-red-100 text-red-700'
          }`}>
            {percentage}%
          </span>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          Scored {activity.score} out of {activity.totalQuestions} questions
        </p>
        <div className="flex items-center space-x-2 mt-1 text-xs text-gray-500">
          <span>{isDaily ? 'Daily Quiz' : 'Practice Quiz'}</span>
          <span>•</span>
          <span>{formatDate(activity.date)}</span>
        </div>
      </div>
    </div>
  )
}

export function RecentActivityTimeline({ activities }: RecentActivityTimelineProps) {
  if (!activities || activities.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h3>
        <div className="text-center py-8 text-gray-500">
          <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No recent activity yet.</p>
          <p className="text-sm mt-1">Start answering questions or taking quizzes to see your activity!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        <span className="text-sm text-gray-500">Last 20 activities</span>
      </div>
      
      <div className="space-y-1 max-h-96 overflow-y-auto">
        {activities.map((activity) => (
          <ActivityItem key={`${activity.type}-${activity.id}`} activity={activity} />
        ))}
      </div>
      
      {activities.length === 20 && (
        <div className="mt-4 text-center">
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            Load more activities
          </button>
        </div>
      )}
    </div>
  )
}