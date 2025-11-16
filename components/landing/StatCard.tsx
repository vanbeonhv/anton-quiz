'use client'

import { useEffect, useState } from 'react'

interface StatCardProps {
  icon: React.ReactNode
  value: number
  label: string
  color: 'green' | 'orange' | 'yellow'
  suffix?: string
  isVisible?: boolean
}

export function StatCard({ icon, value, label, color, suffix = '', isVisible = false }: StatCardProps) {
  const [displayValue, setDisplayValue] = useState(0)
  const [hasAnimated, setHasAnimated] = useState(false)

  const colorClasses = {
    green: 'text-primary-green',
    orange: 'text-primary-orange',
    yellow: 'text-accent-yellow',
  }

  useEffect(() => {
    if (isVisible && !hasAnimated) {
      setHasAnimated(true)
      animateValue()
    }
  }, [isVisible, hasAnimated])

  const animateValue = () => {
    const duration = 1500 // 1.5 seconds
    const startTime = performance.now()
    const startValue = 0

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Ease-out function
      const easeOut = 1 - Math.pow(1 - progress, 3)
      const currentValue = Math.floor(startValue + (value - startValue) * easeOut)

      setDisplayValue(currentValue)

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }

  return (
    <div
      className="bg-white border-2 border-gray-200 rounded-lg p-4 sm:p-6 md:p-8 text-center transition-all duration-200 hover:shadow-xl hover:border-gray-300 hover:-translate-y-1 cursor-default"
      role="region"
      aria-label={`${label}: ${value.toLocaleString()}${suffix}`}
    >
      <div 
        className={`flex justify-center mb-3 md:mb-4 transition-transform duration-200 hover:scale-110 ${colorClasses[color]}`}
        aria-hidden="true"
      >
        <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center">
          {icon}
        </div>
      </div>
      <div 
        className={`text-3xl sm:text-4xl md:text-5xl font-bold mb-2 transition-all duration-200 ${colorClasses[color]}`}
        aria-live="polite"
      >
        {displayValue.toLocaleString()}{suffix}
      </div>
      <div className="text-sm sm:text-base md:text-lg text-gray-600 transition-colors duration-200">
        {label}
      </div>
    </div>
  )
}
