import React from 'react'
import { cn } from '@/lib/utils'

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
  accentColor: 'green' | 'orange' | 'yellow'
}

const accentColorClasses = {
  green: {
    iconBg: 'bg-green-100',
    iconColor: 'text-primary-green',
    hoverBorder: 'hover:border-primary-green',
  },
  orange: {
    iconBg: 'bg-orange-100',
    iconColor: 'text-primary-orange',
    hoverBorder: 'hover:border-primary-orange',
  },
  yellow: {
    iconBg: 'bg-yellow-100',
    iconColor: 'text-accent-yellow',
    hoverBorder: 'hover:border-accent-yellow',
  },
}

export function FeatureCard({ icon, title, description, accentColor }: FeatureCardProps) {
  const colors = accentColorClasses[accentColor]

  return (
    <div
      className={cn(
        'group',
        'bg-white rounded-lg border-2 border-gray-200 p-6 md:p-8',
        'transition-all duration-200 ease-in-out',
        'hover:scale-[1.02] hover:shadow-xl hover:-translate-y-1',
        colors.hoverBorder,
        'cursor-default'
      )}
    >
      <div className="flex flex-col items-center text-center space-y-3 md:space-y-4">
        {/* Icon */}
        <div
          className={cn(
            'w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center',
            'transition-transform duration-200',
            'group-hover:scale-110',
            colors.iconBg
          )}
          aria-hidden="true"
        >
          <div className={cn('w-7 h-7 md:w-8 md:h-8 transition-transform duration-200', colors.iconColor)}>
            {icon}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 transition-colors duration-200">
          {title}
        </h3>

        {/* Description */}
        <p className="text-sm md:text-base text-gray-600 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  )
}
