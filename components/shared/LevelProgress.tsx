'use client'

import { Progress } from '@/components/ui/progress'
import { LevelCalculatorService } from '@/lib/utils/levels'
import { cn } from '@/lib/utils'

interface LevelProgressProps {
  currentLevel: number
  totalXp: number
  showDetails?: boolean
  className?: string
}

/**
 * Display XP progress toward the next level
 */
export function LevelProgress({ 
  currentLevel, 
  totalXp, 
  showDetails = true,
  className 
}: LevelProgressProps) {
  const xpToNextLevel = LevelCalculatorService.calculateXpToNextLevel(currentLevel, totalXp)
  const progressPercentage = LevelCalculatorService.calculateProgressToNextLevel(currentLevel, totalXp)
  
  // Get current and next level configs for detailed display
  const currentLevelConfig = LevelCalculatorService.getLevelConfig(currentLevel)
  const nextLevelConfig = LevelCalculatorService.getLevelConfig(currentLevel + 1)
  
  // Calculate XP earned in current level
  const currentLevelXp = currentLevelConfig?.cumulativeXpNeeded || 0
  const xpInCurrentLevel = totalXp - currentLevelXp
  const xpNeededForNextLevel = nextLevelConfig ? nextLevelConfig.cumulativeXpNeeded - currentLevelXp : 0

  // If at max level, show completion
  const isMaxLevel = currentLevel >= 20

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">
          {isMaxLevel ? 'Max Level Reached!' : `Progress to Level ${currentLevel + 1}`}
        </span>
        {!isMaxLevel && showDetails && (
          <span className="text-sm text-gray-500">
            {xpToNextLevel} XP to go
          </span>
        )}
      </div>
      
      <Progress 
        value={progressPercentage} 
        className="h-2"
      />
      
      {showDetails && !isMaxLevel && (
        <div className="flex justify-between text-xs text-gray-500">
          <span>{xpInCurrentLevel.toLocaleString()} XP</span>
          <span>{xpNeededForNextLevel.toLocaleString()} XP</span>
        </div>
      )}
      
      {isMaxLevel && showDetails && (
        <div className="text-center text-sm text-gray-600">
          🎉 You've reached the highest level! Total XP: {totalXp.toLocaleString()}
        </div>
      )}
    </div>
  )
}