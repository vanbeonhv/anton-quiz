'use client'

import { Badge } from '@/components/ui/badge'
import { Trophy, Star, Target } from 'lucide-react'
import { cn } from '@/lib/utils'
import { LEVEL_DATA } from '@/lib/utils/levels'
import { useState, useRef, useEffect } from 'react'

interface LevelBadgeProps {
  level: number
  title: string
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
  className?: string
}

/**
 * Display a user's level and title as a styled badge
 */
export function LevelBadge({
  level,
  title,
  size = 'md',
  showIcon = true,
  className
}: LevelBadgeProps) {
  const [showTooltip, setShowTooltip] = useState(false)
  const [tooltipPosition, setTooltipPosition] = useState<'top' | 'bottom' | 'left' | 'right'>('top')
  const badgeRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)

  // Handle click outside to close tooltip
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showTooltip &&
        tooltipRef.current &&
        badgeRef.current &&
        !tooltipRef.current.contains(event.target as Node) &&
        !badgeRef.current.contains(event.target as Node)
      ) {
        setShowTooltip(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showTooltip])
  // Determine badge color based on level ranges
  const getBadgeVariant = (level: number) => {
    if (level >= 15) return 'default' // Senior levels - purple/blue
    if (level >= 10) return 'secondary' // Mid-level - gray
    if (level >= 5) return 'outline' // Junior levels - outlined
    return 'beginner' // Newbie/Intern levels - light orange
  }

  // Size-based styling
  const sizeClasses = {
    sm: 'text-xs px-2 py-1 gap-1',
    md: 'text-sm px-3 py-1.5 gap-1.5',
    lg: 'text-base px-4 py-2 gap-2'
  }

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }

  // Choose icon based on level
  const getIcon = (level: number) => {
    if (level >= 15) return <Trophy className={iconSizes[size]} />
    return <Star className={iconSizes[size]} />
  }

  // Smart positioning logic
  const calculateTooltipPosition = () => {
    if (!badgeRef.current) return

    const badgeRect = badgeRef.current.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    // Check available space
    const spaceTop = badgeRect.top
    const spaceBottom = viewportHeight - badgeRect.bottom
    const spaceLeft = badgeRect.left
    const spaceRight = viewportWidth - badgeRect.right

    // Tooltip dimensions (approximate)
    const tooltipWidth = 320
    const tooltipHeight = 400

    // Determine best position
    if (spaceRight >= tooltipWidth) {
      setTooltipPosition('right')
    } else if (spaceLeft >= tooltipWidth) {
      setTooltipPosition('left')
    } else if (spaceTop >= tooltipHeight) {
      setTooltipPosition('top')
    } else {
      setTooltipPosition('bottom')
    }
  }

  // Handle click to toggle tooltip
  const handleClick = () => {
    if (!showTooltip) {
      setShowTooltip(true)
      setTimeout(calculateTooltipPosition, 0)
    } else {
      setShowTooltip(false)
    }
  }

  // Get level category for styling

  // Progressive color scheme - gets more vibrant and impressive as level increases
  const getProgressiveLevelColors = (levelNum: number, isCurrentLevel: boolean, isPastLevel: boolean) => {
    if (isPastLevel) {
      return 'bg-gray-200 text-gray-600'
    }

    // Progressive color scheme from subtle to spectacular
    const colorMap: { [key: number]: string } = {
      // Beginner levels - warm oranges
      1: isCurrentLevel ? 'bg-orange-200 text-orange-800 border-2 border-orange-400' : 'bg-orange-100 text-orange-700',
      2: isCurrentLevel ? 'bg-orange-300 text-orange-900 border-2 border-orange-500' : 'bg-orange-200 text-orange-800',
      3: isCurrentLevel ? 'bg-red-300 text-red-900 border-2 border-red-500' : 'bg-red-200 text-red-800',
      4: isCurrentLevel ? 'bg-red-400 text-white border-2 border-red-600' : 'bg-red-300 text-red-900',

      // Junior levels - greens getting more vibrant
      5: isCurrentLevel ? 'bg-emerald-300 text-emerald-900 border-2 border-emerald-500' : 'bg-emerald-200 text-emerald-800',
      6: isCurrentLevel ? 'bg-emerald-400 text-white border-2 border-emerald-600' : 'bg-emerald-300 text-emerald-900',
      7: isCurrentLevel ? 'bg-green-400 text-white border-2 border-green-600' : 'bg-green-300 text-green-900',
      8: isCurrentLevel ? 'bg-green-500 text-white border-2 border-green-700' : 'bg-green-400 text-white',
      9: isCurrentLevel ? 'bg-teal-500 text-white border-2 border-teal-700' : 'bg-teal-400 text-white',

      // Mid levels - blues getting more intense
      10: isCurrentLevel ? 'bg-cyan-500 text-white border-2 border-cyan-700' : 'bg-cyan-400 text-white',
      11: isCurrentLevel ? 'bg-sky-500 text-white border-2 border-sky-700' : 'bg-sky-400 text-white',
      12: isCurrentLevel ? 'bg-blue-500 text-white border-2 border-blue-700' : 'bg-blue-400 text-white',
      13: isCurrentLevel ? 'bg-blue-600 text-white border-2 border-blue-800' : 'bg-blue-500 text-white',
      14: isCurrentLevel ? 'bg-indigo-600 text-white border-2 border-indigo-800' : 'bg-indigo-500 text-white',

      // Senior levels - spectacular purples and golds
      15: isCurrentLevel ? 'bg-purple-600 text-white border-2 border-purple-800 shadow-lg shadow-purple-300' : 'bg-purple-500 text-white',
      16: isCurrentLevel ? 'bg-violet-600 text-white border-2 border-violet-800 shadow-lg shadow-violet-300' : 'bg-violet-500 text-white',
      17: isCurrentLevel ? 'bg-fuchsia-600 text-white border-2 border-fuchsia-800 shadow-lg shadow-fuchsia-300' : 'bg-fuchsia-500 text-white',
      18: isCurrentLevel ? 'bg-pink-600 text-white border-2 border-pink-800 shadow-lg shadow-pink-300' : 'bg-pink-500 text-white',
      19: isCurrentLevel ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-2 border-purple-800 shadow-lg shadow-purple-400' : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white',
      20: isCurrentLevel ? 'bg-gradient-to-r from-yellow-400 via-red-500 to-pink-600 text-white border-2 border-yellow-600 shadow-xl shadow-yellow-400 ring-2 ring-yellow-300' : 'bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 text-white shadow-lg'
    }

    return colorMap[levelNum] || (isCurrentLevel ? 'bg-gray-300 text-gray-900 border-2 border-gray-500' : 'bg-gray-200 text-gray-800')
  }

  // Get header gradient that matches the progression
  const getHeaderGradient = (currentLevel: number) => {
    if (currentLevel >= 19) return 'bg-gradient-to-r from-yellow-500 via-red-600 to-pink-700'
    if (currentLevel >= 17) return 'bg-gradient-to-r from-purple-600 to-pink-700'
    if (currentLevel >= 15) return 'bg-gradient-to-r from-purple-600 to-violet-700'
    if (currentLevel >= 12) return 'bg-gradient-to-r from-blue-600 to-indigo-700'
    if (currentLevel >= 10) return 'bg-gradient-to-r from-cyan-600 to-blue-700'
    if (currentLevel >= 7) return 'bg-gradient-to-r from-green-600 to-teal-700'
    if (currentLevel >= 5) return 'bg-gradient-to-r from-emerald-600 to-green-700'
    return 'bg-gradient-to-r from-orange-500 to-red-600'
  }

  // Create level progression tooltip content
  const renderLevelProgression = () => (
    <div className="w-80">
      {/* Header with gradient matching current level */}
      <div className={cn(
        'p-4 rounded-t-lg text-white',
        getHeaderGradient(level)
      )}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-full">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Level Progression</h3>
            <p className="text-sm opacity-90">Your journey to mastery</p>
          </div>
        </div>
      </div>

      {/* Levels list */}
      <div className="max-h-80 overflow-y-auto bg-white">
        {LEVEL_DATA.map((levelConfig) => {
          const isCurrentLevel = levelConfig.level === level
          const isPastLevel = levelConfig.level < level

          return (
            <div
              key={levelConfig.level}
              className={cn(
                'flex items-center justify-between p-3 border-b border-gray-100 transition-all hover:bg-gray-50',
                isCurrentLevel && 'ring-2 ring-blue-500 ring-inset bg-blue-50',
                isPastLevel && 'opacity-60'
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all',
                  getProgressiveLevelColors(levelConfig.level, isCurrentLevel, isPastLevel)
                )}>
                  {levelConfig.level}
                </div>
                <span className={cn(
                  'font-medium',
                  isCurrentLevel && 'text-blue-700 font-semibold',
                  isPastLevel && 'text-gray-500'
                )}>
                  {levelConfig.title}
                </span>
              </div>
              <div className="text-right">
                <div className={cn(
                  'text-sm font-semibold',
                  isCurrentLevel && 'text-blue-600',
                  isPastLevel && 'text-gray-400'
                )}>
                  {levelConfig.cumulativeXpNeeded.toLocaleString()} XP
                </div>
                {!isPastLevel && !isCurrentLevel && (
                  <div className="text-xs text-gray-500">
                    +{(levelConfig.cumulativeXpNeeded - (LEVEL_DATA[levelConfig.level - 2]?.cumulativeXpNeeded || 0)).toLocaleString()}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div className="bg-gray-50 p-3 rounded-b-lg text-center">
        <div className="text-xs text-gray-600">
          🎯 Keep practicing to level up!
        </div>
      </div>
    </div>
  )

  // Get tooltip positioning classes with maximum z-index
  const getTooltipClasses = () => {
    const baseClasses = "absolute z-[9999] transition-all duration-200"

    switch (tooltipPosition) {
      case 'top':
        return `${baseClasses} bottom-full left-1/2 transform -translate-x-1/2 mb-2`
      case 'bottom':
        return `${baseClasses} top-full left-1/2 transform -translate-x-1/2 mt-2`
      case 'left':
        return `${baseClasses} right-full top-1/2 transform -translate-y-1/2 mr-2`
      case 'right':
        return `${baseClasses} left-full top-1/2 transform -translate-y-1/2 ml-2`
      default:
        return `${baseClasses} bottom-full left-1/2 transform -translate-x-1/2 mb-2`
    }
  }

  // Get arrow classes
  const getArrowClasses = () => {
    const baseClasses = "absolute w-0 h-0"

    switch (tooltipPosition) {
      case 'top':
        return `${baseClasses} top-full left-1/2 transform -translate-x-1/2 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white`
      case 'bottom':
        return `${baseClasses} bottom-full left-1/2 transform -translate-x-1/2 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-white`
      case 'left':
        return `${baseClasses} left-full top-1/2 transform -translate-y-1/2 border-t-8 border-b-8 border-l-8 border-t-transparent border-b-transparent border-l-white`
      case 'right':
        return `${baseClasses} right-full top-1/2 transform -translate-y-1/2 border-t-8 border-b-8 border-r-8 border-t-transparent border-b-transparent border-r-white`
      default:
        return `${baseClasses} top-full left-1/2 transform -translate-x-1/2 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white`
    }
  }

  return (
    <div className="relative inline-block" ref={badgeRef}>
      <Badge
        variant={getBadgeVariant(level)}
        className={cn(
          'font-semibold flex items-center cursor-pointer transition-all hover:scale-105',
          sizeClasses[size],
          className
        )}
        onClick={handleClick}
      >
        {showIcon && getIcon(level)}
        <span>Level {level}</span>
        <span className="hidden sm:inline">- {title}</span>
      </Badge>

      {showTooltip && (
        <>
          {/* Backdrop overlay */}
          <div className="fixed inset-0 z-[9998] bg-black/10" onClick={() => setShowTooltip(false)} />

          {/* Tooltip */}
          <div className={getTooltipClasses()}>
            <div
              ref={tooltipRef}
              className="bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200"
            >
              {renderLevelProgression()}
            </div>
            {/* Arrow */}
            <div className={getArrowClasses()}></div>
          </div>
        </>
      )}
    </div>
  )
}