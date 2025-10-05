import { Lock } from 'lucide-react'

export function AchievementSection() {
  // Placeholder achievements for future enhancement
  const placeholderAchievements = [
    {
      id: 'first-question',
      name: 'First Steps',
      description: 'Answer your first question',
      icon: '🎯',
      unlocked: false
    },
    {
      id: 'daily-streak-7',
      name: 'Week Warrior',
      description: 'Complete daily quiz for 7 days in a row',
      icon: '🔥',
      unlocked: false
    },
    {
      id: 'perfect-score',
      name: 'Perfectionist',
      description: 'Get 100% on a daily quiz',
      icon: '⭐',
      unlocked: false
    },
    {
      id: 'hundred-questions',
      name: 'Century Club',
      description: 'Answer 100 questions correctly',
      icon: '💯',
      unlocked: false
    }
  ]

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Achievements</h3>
        <span className="text-sm text-gray-500">Coming soon</span>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {placeholderAchievements.map((achievement) => (
          <div 
            key={achievement.id}
            className={`p-4 rounded-lg border-2 border-dashed transition-all ${
              achievement.unlocked 
                ? 'border-green-200 bg-green-50' 
                : 'border-gray-200 bg-gray-50'
            }`}
          >
            <div className="text-center">
              <div className={`text-2xl mb-2 ${achievement.unlocked ? '' : 'grayscale opacity-50'}`}>
                {achievement.icon}
              </div>
              <h4 className={`font-medium text-sm ${
                achievement.unlocked ? 'text-gray-900' : 'text-gray-500'
              }`}>
                {achievement.name}
              </h4>
              <p className={`text-xs mt-1 ${
                achievement.unlocked ? 'text-gray-600' : 'text-gray-400'
              }`}>
                {achievement.description}
              </p>
              {!achievement.unlocked && (
                <Lock className="w-4 h-4 mx-auto mt-2 text-gray-400" />
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">
          Achievement system will be available in a future update. Keep practicing to unlock rewards!
        </p>
      </div>
    </div>
  )
}