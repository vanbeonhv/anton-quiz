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
        'bg-gradient-to-br from-white to-bg-cream/30 rounded-xl border-2 border-gray-200 p-6 md:p-8',
        'transition-all duration-300 ease-out',
        'hover:scale-[1.03] hover:shadow-2xl hover:-translate-y-2',
        colors.hoverBorder,
        'cursor-default',
        'backdrop-blur-sm'
      )}
    >
      <div className="flex flex-col items-center text-center space-y-3 md:space-y-4">
        {/* Icon */}
        <div
          className={cn(
            'w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center',
            'transition-all duration-300',
            'group-hover:scale-110 group-hover:rotate-3',
            colors.iconBg,
            'shadow-md group-hover:shadow-lg'
          )}
          aria-hidden="true"
        >
          <div className={cn('w-8 h-8 md:w-10 md:h-10 transition-transform duration-300', colors.iconColor)}>
            {icon}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl md:text-2xl lg:text-3xl font-extrabold text-gray-900 transition-colors duration-200 font-heading">
          {title}
        </h3>

        {/* Description */}
        <p className="text-sm md:text-base lg:text-lg text-gray-600 leading-relaxed font-light">
          {description}
        </p>
      </div>
    </div>
  )
}
