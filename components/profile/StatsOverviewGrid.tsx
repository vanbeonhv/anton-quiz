import { TrendingUp, TrendingDown, Target, Award, Flame, Trophy, Star, Zap } from 'lucide-react'
import type { UserStatsWithComputed } from '@/types'

interface StatsOverviewGridProps {
  userStats: UserStatsWithComputed
}

interface StatCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  trend?: 'up' | 'down' | 'neutral'
  subtitle?: string
  color: 'blue' | 'green' | 'orange' | 'purple'
}

function StatCard({ title, value, icon, trend, subtitle, color }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    orange: 'bg-orange-50 text-orange-600 border-orange-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200'
  }

  const iconBgClasses = {
    blue: 'bg-blue-100',
    green: 'bg-green-100',
    orange: 'bg-orange-100',
    purple: 'bg-purple-100'
  }

  return (
    <div className={`rounded-lg border p-6 ${colorClasses[color]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <div className="flex items-center space-x-2 mt-1">
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {trend && (
              <div className="flex items-center">
                {trend === 'up' && <TrendingUp className="w-4 h-4 text-green-500" />}
                {trend === 'down' && <TrendingDown className="w-4 h-4 text-red-500" />}
              </div>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-lg ${iconBgClasses[color]} flex items-center justify-center`}>
          {icon}
        </div>
      </div>
    </div>
  )
}

export function StatsOverviewGrid({ userStats }: StatsOverviewGridProps) {
  // For now, show a placeholder for global rank
  // In a real implementation, this would come from a separate API call
  const globalRank = 'N/A'

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <StatCard
        title="Total XP"
        value={userStats.totalXp.toLocaleString()}
        icon={<Zap className="w-6 h-6" />}
        color="purple"
        subtitle={`Level ${userStats.currentLevel} - ${userStats.currentTitle}`}
        trend="up"
      />
      
      <StatCard
        title="Daily Points"
        value={userStats.totalDailyPoints}
        icon={<Award className="w-6 h-6" />}
        color="blue"
        subtitle="From daily quizzes"
        trend="up"
      />
      
      <StatCard
        title="Questions Solved"
        value={userStats.totalCorrectAnswers}
        icon={<Target className="w-6 h-6" />}
        color="green"
        subtitle={`${userStats.accuracyPercentage}% accuracy`}
        trend="up"
      />
      
      <StatCard
        title="Current Streak"
        value={userStats.dailyQuizStreak}
        icon={<Flame className="w-6 h-6" />}
        color="orange"
        subtitle="Days in a row"
        trend={userStats.dailyQuizStreak > 0 ? 'up' : 'neutral'}
      />
      
      <StatCard
        title="XP to Next Level"
        value={userStats.xpToNextLevel || 0}
        icon={<Star className="w-6 h-6" />}
        color="green"
        subtitle="Keep practicing!"
        trend="neutral"
      />
      
      <StatCard
        title="Global Rank"
        value={globalRank}
        icon={<Trophy className="w-6 h-6" />}
        color="blue"
        subtitle="Among all users"
      />
    </div>
  )
}