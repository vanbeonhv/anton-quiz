'use client'

import { Trophy, Target } from 'lucide-react'
import type { ScoreboardType } from '@/types'

interface ScoreboardTabsProps {
  activeTab: ScoreboardType
  onTabChange: (tab: ScoreboardType) => void
}

export function ScoreboardTabs({ activeTab, onTabChange }: ScoreboardTabsProps) {
  const tabs = [
    {
      id: 'daily-points' as ScoreboardType,
      label: 'Daily Points',
      icon: Trophy,
      description: 'Points earned from daily quizzes'
    },
    {
      id: 'questions-solved' as ScoreboardType,
      label: 'Questions Solved',
      icon: Target,
      description: 'Total questions answered correctly'
    }
  ]

  return (
    <div className="bg-bg-cream rounded-lg p-1 border border-bg-peach">
      <div className="flex flex-col sm:flex-row gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                flex-1 flex items-center justify-center gap-3 px-4 py-3 rounded-md
                transition-all duration-200 font-medium text-sm
                ${isActive
                  ? 'bg-primary-green text-white shadow-sm'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-peach/50'
                }
              `}
            >
              <Icon className="w-4 h-4" />
              <div className="flex flex-col items-start">
                <span className="font-semibold">{tab.label}</span>
                <span className={`text-xs ${isActive ? 'text-white/80' : 'text-text-muted'}`}>
                  {tab.description}
                </span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}