'use client'

import { useState, useEffect } from 'react'
import { Trophy, Crown, Star, Sparkles, ArrowUp, X } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { UserProgress } from '@/types'

interface LevelUpModalProps {
  isOpen: boolean
  onClose: () => void
  userProgress: UserProgress
  previousLevel: number
  previousTitle: string
}

export function LevelUpModal({ 
  isOpen, 
  onClose, 
  userProgress, 
  previousLevel, 
  previousTitle 
}: LevelUpModalProps) {
  const [showAnimation, setShowAnimation] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)

  // Trigger animations when modal opens
  useEffect(() => {
    if (isOpen) {
      setShowAnimation(false)
      setShowConfetti(false)
      
      // Start main animation after a short delay
      const animationTimer = setTimeout(() => {
        setShowAnimation(true)
      }, 200)
      
      // Start confetti animation
      const confettiTimer = setTimeout(() => {
        setShowConfetti(true)
      }, 500)
      
      return () => {
        clearTimeout(animationTimer)
        clearTimeout(confettiTimer)
      }
    }
  }, [isOpen])

  // Confetti particles component
  const ConfettiParticle = ({ delay, color, size }: { delay: number, color: string, size: string }) => (
    <div
      className={`absolute ${size} ${color} rounded-full animate-bounce opacity-80`}
      style={{
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        animationDelay: `${delay}ms`,
        animationDuration: `${1000 + Math.random() * 1000}ms`,
      }}
    />
  )

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 animate-in fade-in-0"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative z-10 w-full max-w-lg mx-4 bg-gradient-to-br from-primary-green/5 via-bg-cream to-primary-orange/5 border-2 border-primary-green/30 rounded-lg shadow-xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-200">
        {/* Confetti Animation */}
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 20 }).map((_, i) => (
              <ConfettiParticle
                key={i}
                delay={i * 100}
                color={i % 3 === 0 ? 'bg-primary-green' : i % 3 === 1 ? 'bg-primary-orange' : 'bg-yellow-400'}
                size={i % 2 === 0 ? 'w-2 h-2' : 'w-1 h-1'}
              />
            ))}
          </div>
        )}

        <div className="text-center space-y-6 relative z-10 p-6">
          {/* Celebration Icon */}
          <div className="flex justify-center">
            <div className={`relative transition-all duration-1000 ${showAnimation ? 'scale-110' : 'scale-100'}`}>
              <div className="w-20 h-20 bg-gradient-to-br from-primary-green to-primary-orange rounded-full flex items-center justify-center shadow-lg">
                <Crown className="w-10 h-10 text-white" />
              </div>
              
              {/* Animated sparkles around the crown */}
              <div className={`absolute -top-2 -right-2 transition-all duration-500 ${showAnimation ? 'animate-pulse' : 'opacity-0'}`}>
                <Sparkles className="w-6 h-6 text-primary-orange fill-current" />
              </div>
              <div className={`absolute -bottom-2 -left-2 transition-all duration-500 delay-200 ${showAnimation ? 'animate-pulse' : 'opacity-0'}`}>
                <Star className="w-5 h-5 text-primary-green fill-current" />
              </div>
              <div className={`absolute top-0 -left-3 transition-all duration-500 delay-400 ${showAnimation ? 'animate-pulse' : 'opacity-0'}`}>
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
              </div>
            </div>
          </div>
          
          <h2 className="text-3xl font-bold text-text-primary">
            🎉 Level Up! 🎉
          </h2>
        </div>

        <div className="space-y-6 px-6 pb-6 relative z-10">
          {/* Congratulations Message */}
          <div className="text-center">
            <p className="text-lg text-text-secondary mb-4">
              Congratulations! You've reached a new level!
            </p>
          </div>

          {/* Level Progression Display */}
          <div className="bg-bg-white/80 rounded-lg p-6 space-y-4 border border-primary-green/20">
            {/* From Level */}
            <div className="flex items-center justify-center gap-4">
              <div className="text-center">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="w-5 h-5 text-text-secondary" />
                  <span className="text-sm text-text-secondary font-medium">From</span>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-text-secondary">
                    Level {previousLevel}
                  </div>
                  <Badge variant="outline" className="text-xs bg-gray-50 text-gray-600 border-gray-200">
                    {previousTitle}
                  </Badge>
                </div>
              </div>

              {/* Arrow */}
              <div className={`transition-all duration-1000 ${showAnimation ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'}`}>
                <ArrowUp className="w-8 h-8 text-primary-green rotate-90" />
              </div>

              {/* To Level */}
              <div className="text-center">
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="w-5 h-5 text-primary-green" />
                  <span className="text-sm text-primary-green font-medium">To</span>
                </div>
                <div className="space-y-1">
                  <div className={`text-2xl font-bold text-primary-green transition-all duration-1000 ${showAnimation ? 'scale-110' : 'scale-100'}`}>
                    Level {userProgress.currentLevel}
                  </div>
                  <Badge className="bg-gradient-to-r from-primary-green to-primary-orange text-white text-xs">
                    {userProgress.newTitle || userProgress.currentTitle}
                  </Badge>
                </div>
              </div>
            </div>

            {/* New Title Highlight */}
            {userProgress.newTitle && (
              <div className="text-center pt-2 border-t border-bg-peach">
                <p className="text-sm text-text-secondary mb-2">Your new title:</p>
                <Badge className="bg-primary-orange/10 text-primary-orange border-primary-orange/30 text-base px-4 py-2">
                  ✨ {userProgress.newTitle} ✨
                </Badge>
              </div>
            )}
          </div>

          {/* Progress to Next Level */}
          {userProgress.xpToNextLevel > 0 && (
            <div className="bg-bg-white/50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm text-text-secondary">
                <span>Progress to Level {userProgress.currentLevel + 1}</span>
                <span>{userProgress.xpToNextLevel} XP to go</span>
              </div>
              <div className="w-full bg-bg-peach rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-primary-green to-primary-orange h-2 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: '15%' }} // Start fresh at new level
                />
              </div>
            </div>
          )}

          {/* Max Level Achievement */}
          {userProgress.xpToNextLevel === 0 && (
            <div className="bg-gradient-to-r from-primary-green/10 to-primary-orange/10 rounded-lg p-4 text-center border border-primary-green/20">
              <Trophy className="w-8 h-8 text-primary-orange mx-auto mb-2" />
              <p className="font-bold text-primary-green">Maximum Level Achieved!</p>
              <p className="text-sm text-text-secondary">You've reached the highest level possible!</p>
            </div>
          )}

          {/* Close Button */}
          <div className="flex justify-center pt-4">
            <Button
              onClick={onClose}
              className="px-8 py-3 bg-gradient-to-r from-primary-green to-primary-orange hover:from-primary-green/90 hover:to-primary-orange/90 text-white font-medium text-lg shadow-lg"
            >
              Awesome! 🚀
            </Button>
          </div>
        </div>
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-text-secondary hover:text-text-primary"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
      </div>
    </div>
  )
}