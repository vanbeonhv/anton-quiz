'use client'

import { useState, useEffect } from 'react'
import { Trophy, Star, Zap } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { UserProgress } from '@/types'

interface XpGainModalProps {
  isOpen: boolean
  onClose: () => void
  xpEarned: number
  userProgress: UserProgress
}

export function XpGainModal({ isOpen, onClose, xpEarned, userProgress }: XpGainModalProps) {
  const [animatedXp, setAnimatedXp] = useState(0)
  const [showProgressBar, setShowProgressBar] = useState(false)

  // Animate XP counter when modal opens
  useEffect(() => {
    if (isOpen && xpEarned > 0) {
      setAnimatedXp(0)
      setShowProgressBar(false)

      // Start XP animation after a short delay
      const xpTimer = setTimeout(() => {
        const duration = 1000 // 1 second
        const steps = 30
        const increment = xpEarned / steps
        let current = 0

        const interval = setInterval(() => {
          current += increment
          if (current >= xpEarned) {
            setAnimatedXp(xpEarned)
            clearInterval(interval)
            // Show progress bar after XP animation completes
            setTimeout(() => setShowProgressBar(true), 200)
          } else {
            setAnimatedXp(Math.floor(current))
          }
        }, duration / steps)

        return () => clearInterval(interval)
      }, 300)

      return () => clearTimeout(xpTimer)
    }
  }, [isOpen, xpEarned])

  // Calculate progress percentage for the progress bar
  const progressPercentage = userProgress.xpToNextLevel > 0
    ? ((userProgress.totalXp - getPreviousLevelXp()) / (getPreviousLevelXp() + userProgress.xpToNextLevel - getPreviousLevelXp())) * 100
    : 100

  // Helper function to get previous level XP (simplified calculation)
  function getPreviousLevelXp(): number {
    // This is a simplified calculation - in a real implementation, 
    // you'd want to import the level configuration
    return Math.max(0, userProgress.totalXp - userProgress.xpToNextLevel)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-bg-cream to-bg-peach border-primary-green/20">
        <DialogHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-16 h-16 bg-primary-green/10 rounded-full flex items-center justify-center">
                <Zap className="w-8 h-8 text-primary-green" />
              </div>
              {/* Animated sparkles */}
              <div className="absolute -top-1 -right-1 animate-pulse">
                <Star className="w-4 h-4 text-primary-orange fill-current" />
              </div>
              <div className="absolute -bottom-1 -left-1 animate-pulse delay-300">
                <Star className="w-3 h-3 text-primary-green fill-current" />
              </div>
            </div>
          </div>

          <DialogTitle className="text-2xl font-bold text-text-primary">
            XP Earned!
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* XP Earned Display */}
          <div className="text-center">
            <div className="text-4xl font-bold text-primary-green mb-2">
              +{animatedXp}
            </div>
            <p className="text-text-secondary">Experience Points</p>
          </div>

          {/* Current Level Info */}
          <div className="bg-bg-white/50 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-primary-orange" />
                <span className="font-medium text-text-primary">
                  Level {userProgress.currentLevel}
                </span>
              </div>
              <Badge className="bg-primary-orange/10 text-primary-orange border-primary-orange/30">
                {userProgress.currentTitle}
              </Badge>
            </div>

            {/* Progress Bar */}
            {showProgressBar && userProgress.xpToNextLevel > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-text-secondary">
                  <span>Progress to Level {userProgress.currentLevel + 1}</span>
                  <span>{userProgress.xpToNextLevel} XP to go</span>
                </div>
                <div className="w-full bg-bg-peach rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-primary-green to-primary-orange h-2 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                  />
                </div>
                <div className="text-center text-sm text-text-secondary">
                  {userProgress.totalXp} / {userProgress.totalXp + userProgress.xpToNextLevel} XP
                </div>
              </div>
            )}

            {/* Max Level Reached */}
            {userProgress.xpToNextLevel === 0 && (
              <div className="text-center py-2">
                <Badge className="bg-gradient-to-r from-primary-green to-primary-orange text-white">
                  🏆 Max Level Reached!
                </Badge>
              </div>
            )}
          </div>

          {/* Close Button */}
          <div className="flex justify-center pt-2">
            <Button
              onClick={onClose}
              className="px-8 py-2 bg-primary-green hover:bg-primary-green/90 text-white font-medium"
            >
              Continue
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}