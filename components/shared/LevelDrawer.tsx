'use client'

import React from 'react'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerClose,
} from '@/components/ui/drawer'
import { useUserLevel } from '@/components/providers/UserLevelProvider'
import { X, Trophy, Star, Target } from 'lucide-react'
import { Button } from '@/components/ui/button'

import { LEVEL_DATA, LevelCalculatorService } from '@/lib/utils/levels'
import { cn } from '@/lib/utils'

// Helper function to get level icon based on level
function getLevelIcon(level: number) {
  if (level >= 15) return <Trophy className="w-6 h-6" />
  return <Star className="w-6 h-6" />
}

// Helper function to get header gradient that matches the progression
function getHeaderGradient(currentLevel: number) {
  if (currentLevel >= 19) return 'bg-gradient-to-r from-yellow-500 via-red-600 to-pink-700'
  if (currentLevel >= 17) return 'bg-gradient-to-r from-purple-600 to-pink-700'
  if (currentLevel >= 15) return 'bg-gradient-to-r from-purple-600 to-violet-700'
  if (currentLevel >= 12) return 'bg-gradient-to-r from-blue-600 to-indigo-700'
  if (currentLevel >= 10) return 'bg-gradient-to-r from-cyan-600 to-blue-700'
  if (currentLevel >= 7) return 'bg-gradient-to-r from-green-600 to-teal-700'
  if (currentLevel >= 5) return 'bg-gradient-to-r from-emerald-600 to-green-700'
  return 'bg-gradient-to-r from-orange-500 to-red-600'
}

// Progressive color scheme - gets more vibrant and impressive as level increases
function getProgressiveLevelColors(levelNum: number, isCurrentLevel: boolean, isPastLevel: boolean) {
  if (isPastLevel) {
    return 'bg-muted text-muted-foreground'
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

  return colorMap[levelNum] || (isCurrentLevel ? 'bg-muted text-foreground border-2 border-border' : 'bg-muted/50 text-muted-foreground')
}

// Helper function to get motivational messages based on level
function getMotivationalMessage(level: number) {
  if (level >= 20) return "🏆 You've reached the pinnacle of mastery!"
  if (level >= 15) return "🌟 You're among the senior developers!"
  if (level >= 10) return "🚀 You've reached mid-level expertise!"
  if (level >= 5) return "💪 You're building solid junior skills!"
  return "🌱 Every expert was once a beginner!"
}

interface LevelDrawerProps {
  isOpen?: boolean
  onClose?: () => void
  level?: number
  title?: string
  totalXp?: number
  userEmail?: string
}

/**
 * LevelDrawer component that displays comprehensive user level information
 * Can use UserLevelProvider context or accept props for viewing other users' levels
 */
export function LevelDrawer({
  isOpen: externalIsOpen,
  onClose: externalOnClose,
  level: externalLevel,
  title: externalTitle,
  totalXp: externalTotalXp,
  userEmail: externalUserEmail
}: LevelDrawerProps = {}) {
  const context = useUserLevel()
  
  // Use external props if provided, otherwise use context
  const isDrawerOpen = externalIsOpen !== undefined ? externalIsOpen : context.isDrawerOpen
  const closeDrawer = externalOnClose || context.closeDrawer
  const isLoading = externalLevel === undefined ? context.isLoading : false
  const error = externalLevel === undefined ? context.error : null
  
  // Build userStats from external props or context
  const userStats = externalLevel !== undefined && externalTitle !== undefined && externalTotalXp !== undefined
    ? {
        currentLevel: externalLevel,
        currentTitle: externalTitle,
        totalXp: externalTotalXp,
        xpToNextLevel: LevelCalculatorService.calculateXpToNextLevel(externalLevel, externalTotalXp)
      }
    : context.userStats

  // Handle escape key press
  React.useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isDrawerOpen) {
        closeDrawer()
      }
    }

    if (isDrawerOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isDrawerOpen, closeDrawer])

  return (
    <Drawer open={isDrawerOpen} onOpenChange={(open) => !open && closeDrawer()}>
      <DrawerContent 
        side="right" 
        className="w-full max-w-md h-full overflow-hidden flex flex-col"
      >
        {/* Header with close button */}
        <DrawerHeader className="flex items-center justify-between border-b">
          <div>
            <DrawerTitle>Level Progression</DrawerTitle>
            <DrawerDescription>
              {externalUserEmail 
                ? `${externalUserEmail.split('@')[0]}'s journey` 
                : 'Your journey to mastery'}
            </DrawerDescription>
          </div>
          <DrawerClose asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </DrawerClose>
        </DrawerHeader>

        {/* Content area with flex layout */}
        <div className="flex-1 flex flex-col min-h-0">
          {isLoading && (
            <div className="flex items-center justify-center h-32">
              <div className="text-sm text-muted-foreground">Loading level data...</div>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center h-32">
              <div className="text-sm text-destructive">
                Failed to load level data. Please try again.
              </div>
            </div>
          )}

          {userStats && !isLoading && !error && (
            <>
              {/* Current Level Header - Fixed */}
              <div className={cn(
                'p-6 text-white flex-shrink-0',
                getHeaderGradient(userStats.currentLevel)
              )}>
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 rounded-full">
                    {getLevelIcon(userStats.currentLevel)}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold">Level {userStats.currentLevel}</h2>
                    <p className="text-lg opacity-90">{userStats.currentTitle}</p>
                    <p className="text-sm opacity-75">{userStats.totalXp.toLocaleString()} Total XP</p>
                  </div>
                </div>
                
                {/* XP Progress Bar */}
                {userStats.currentLevel < 20 && (
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress to Level {userStats.currentLevel + 1}</span>
                      <span>{userStats.xpToNextLevel} XP needed</span>
                    </div>
                    <div className="bg-white/20 rounded-full h-2">
                      <div 
                        className="bg-white rounded-full h-2 transition-all duration-500"
                        style={{ 
                          width: `${LevelCalculatorService.calculateProgressToNextLevel(userStats.currentLevel, userStats.totalXp)}%` 
                        }}
                      />
                    </div>
                  </div>
                )}
                
                {userStats.currentLevel >= 20 && (
                  <div className="mt-4 text-center">
                    <div className="text-sm opacity-90">🎉 Maximum Level Achieved! 🎉</div>
                  </div>
                )}
              </div>

              {/* Level Progression List - Expandable */}
              <div className="flex-1 flex flex-col min-h-0 px-4 py-4">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 flex-shrink-0">
                  <Target className="w-5 h-5" />
                  All Levels
                </h3>
                
                <div className="flex-1 overflow-y-auto space-y-2">
                  {LEVEL_DATA.map((levelConfig) => {
                    const isCurrentLevel = levelConfig.level === userStats.currentLevel
                    const isPastLevel = levelConfig.level < userStats.currentLevel
                    const isFutureLevel = levelConfig.level > userStats.currentLevel

                    return (
                      <div
                        key={levelConfig.level}
                        className={cn(
                          'flex items-center justify-between p-3 rounded-lg transition-all',
                          isCurrentLevel && 'border-2 border-blue-500 bg-blue-50/50',
                          isPastLevel && 'opacity-60 bg-muted/30 border border-muted',
                          isFutureLevel && 'hover:bg-muted border border-muted/50 cursor-pointer'
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            'w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all',
                            getProgressiveLevelColors(levelConfig.level, isCurrentLevel, isPastLevel)
                          )}>
                            {levelConfig.level}
                          </div>
                          <div>
                            <div className={cn(
                              'font-medium',
                              isCurrentLevel && 'text-primary font-semibold',
                              isPastLevel && 'text-muted-foreground'
                            )}>
                              {levelConfig.title}
                            </div>
                            {isCurrentLevel && (
                              <div className="text-xs text-primary">Current Level</div>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className={cn(
                            'text-sm font-semibold',
                            isCurrentLevel && 'text-primary',
                            isPastLevel && 'text-muted-foreground'
                          )}>
                            {levelConfig.cumulativeXpNeeded.toLocaleString()} XP
                          </div>
                          {!isPastLevel && !isCurrentLevel && levelConfig.level > 1 && (
                            <div className="text-xs text-muted-foreground">
                              +{(levelConfig.cumulativeXpNeeded - (LEVEL_DATA[levelConfig.level - 2]?.cumulativeXpNeeded || 0)).toLocaleString()}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Motivational Footer - Fixed at bottom */}
              <div className="flex-shrink-0 px-4 pb-4">
                <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-4 text-center">
                  <div className="text-sm font-medium text-primary mb-1">
                    {getMotivationalMessage(userStats.currentLevel)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Keep practicing to level up and unlock new achievements!
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  )
}