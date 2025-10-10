'use client'

import { useState } from 'react'
import { TimeFilter } from '@/components/scoreboard/TimeFilter'
import { QuestionsSolvedLeaderboard } from '@/components/scoreboard/QuestionsSolvedLeaderboard'

type TimeFilterType = 'all-time' | 'this-week' | 'this-month'

export default function ScoreboardPage() {
  const [timeFilter, setTimeFilter] = useState<TimeFilterType>('all-time')

  return (
    <div className="min-h-screen bg-bg-peach">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            Scoreboard
          </h1>
          <p className="text-text-secondary">
            Track your progress and compete with other learners
          </p>
        </div>

        {/* Time Filter */}
        <div className="mb-8">
          <TimeFilter 
            activeFilter={timeFilter} 
            onFilterChange={setTimeFilter} 
          />
        </div>

        {/* Leaderboard Content */}
        <div className="space-y-6">
          <QuestionsSolvedLeaderboard timeFilter={timeFilter} />
        </div>
      </div>
    </div>
  )
}