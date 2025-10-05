'use client'

import { Calendar, Clock, Globe } from 'lucide-react'

type TimeFilterType = 'all-time' | 'this-week' | 'this-month'

interface TimeFilterProps {
  activeFilter: TimeFilterType
  onFilterChange: (filter: TimeFilterType) => void
}

export function TimeFilter({ activeFilter, onFilterChange }: TimeFilterProps) {
  const filters = [
    {
      id: 'all-time' as TimeFilterType,
      label: 'All Time',
      icon: Globe,
      description: 'Since the beginning'
    },
    {
      id: 'this-week' as TimeFilterType,
      label: 'This Week',
      icon: Clock,
      description: 'Monday to Sunday'
    },
    {
      id: 'this-month' as TimeFilterType,
      label: 'This Month',
      icon: Calendar,
      description: 'Current month'
    }
  ]

  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((filter) => {
        const Icon = filter.icon
        const isActive = activeFilter === filter.id
        
        return (
          <button
            key={filter.id}
            onClick={() => onFilterChange(filter.id)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg border
              transition-all duration-200 font-medium text-sm
              ${isActive 
                ? 'bg-primary-green text-white border-primary-green shadow-sm' 
                : 'bg-bg-cream text-text-secondary border-bg-peach hover:text-text-primary hover:border-primary-green/30 hover:bg-primary-green/5'
              }
            `}
          >
            <Icon className="w-4 h-4" />
            <div className="flex flex-col items-start">
              <span className="font-semibold">{filter.label}</span>
              <span className={`text-xs ${isActive ? 'text-white/80' : 'text-text-muted'}`}>
                {filter.description}
              </span>
            </div>
          </button>
        )
      })}
    </div>
  )
}