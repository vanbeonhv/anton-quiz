'use client'

import { useState } from 'react'
import { ScoreboardTabs } from '@/components/scoreboard/ScoreboardTabs'
import { TimeFilter } from '@/components/scoreboard/TimeFilter'
import { DailyPointsLeaderboard } from '@/components/scoreboard/DailyPointsLeaderboard'
import { QuestionsSolvedLeaderboard } from '@/components/scoreboard/QuestionsSolvedLeaderboard'
import type { ScoreboardType } from '@/types'

type TimeFilterType = 'all-time' | 'this-week' | 'this-month'

export default function ScoreboardPage() {
  const [activeTab, setActiveTab] = useState<ScoreboardType>('daily-points')
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

        {/* Tab Navigation */}
        <div className="mb-6">
          <ScoreboardTabs 
            activeTab={activeTab} 
            onTabChange={setActiveTab} 
          />
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
          {activeTab === 'daily-points' ? (
            <DailyPointsLeaderboard timeFilter={timeFilter} />
          ) : (
            <QuestionsSolvedLeaderboard timeFilter={timeFilter} />
          )}
        </div>
      </div>
    </div>
  )
}