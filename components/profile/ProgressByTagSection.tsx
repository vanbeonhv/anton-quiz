import type { TagStats } from '@/types'

interface ProgressByTagSectionProps {
  tagStats: TagStats[]
}

interface TagProgressBarProps {
  tagStat: TagStats
}

function TagProgressBar({ tagStat }: TagProgressBarProps) {
  const progressPercentage = tagStat.totalQuestions > 0 
    ? (tagStat.answeredQuestions / tagStat.totalQuestions) * 100 
    : 0

  // Color coding by accuracy
  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 80) return 'bg-green-500'
    if (accuracy >= 60) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const getAccuracyBgColor = (accuracy: number) => {
    if (accuracy >= 80) return 'bg-green-50 border-green-200'
    if (accuracy >= 60) return 'bg-yellow-50 border-yellow-200'
    return 'bg-red-50 border-red-200'
  }

  return (
    <div className={`p-4 rounded-lg border ${getAccuracyBgColor(tagStat.accuracyPercentage)}`}>
      <div className="flex justify-between items-center mb-3">
        <div>
          <h4 className="font-medium text-gray-900">{tagStat.tagName}</h4>
          <p className="text-sm text-gray-600">
            {tagStat.answeredQuestions} / {tagStat.totalQuestions} questions
          </p>
        </div>
        <div className="text-right">
          <div className="text-lg font-semibold text-gray-900">
            {tagStat.accuracyPercentage}%
          </div>
          <div className="text-xs text-gray-500">accuracy</div>
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
        <div 
          className={`h-3 rounded-full transition-all duration-300 ${getAccuracyColor(tagStat.accuracyPercentage)}`}
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
      
      <div className="flex justify-between text-xs text-gray-500">
        <span>{Math.round(progressPercentage)}% completed</span>
        <span>{tagStat.correctAnswers} correct</span>
      </div>
    </div>
  )
}

export function ProgressByTagSection({ tagStats }: ProgressByTagSectionProps) {
  if (!tagStats || tagStats.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Progress by Topic</h3>
        <div className="text-center py-8 text-gray-500">
          <p>No topic progress data available yet.</p>
          <p className="text-sm mt-1">Start answering questions to see your progress!</p>
        </div>
      </div>
    )
  }

  // Sort by progress percentage (descending) then by accuracy (descending)
  const sortedTagStats = [...tagStats].sort((a, b) => {
    const aProgress = a.totalQuestions > 0 ? (a.answeredQuestions / a.totalQuestions) : 0
    const bProgress = b.totalQuestions > 0 ? (b.answeredQuestions / b.totalQuestions) : 0
    
    if (aProgress !== bProgress) {
      return bProgress - aProgress
    }
    return b.accuracyPercentage - a.accuracyPercentage
  })

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Progress by Topic</h3>
        <div className="flex items-center space-x-4 text-xs text-gray-500">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>≥80% accuracy</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
            <span>60-79% accuracy</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span>&lt;60% accuracy</span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sortedTagStats.map((tagStat) => (
          <TagProgressBar key={tagStat.tagId} tagStat={tagStat} />
        ))}
      </div>
    </div>
  )
}