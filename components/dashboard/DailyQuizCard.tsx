import { ChevronRight, Clock } from 'lucide-react'
import { useEffect, useState } from 'react'

interface DailyQuizCardProps {
  onClick: () => void
  canTake: boolean
  nextResetTime?: Date
}

export function DailyQuizCard({ onClick, canTake, nextResetTime }: DailyQuizCardProps) {
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    if (!nextResetTime || canTake) return

    const updateCountdown = () => {
      const now = new Date()
      const diff = nextResetTime.getTime() - now.getTime()
      
      if (diff <= 0) {
        setTimeLeft('Available now!')
        return
      }

      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      
      setTimeLeft(`${hours}h ${minutes}m`)
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [nextResetTime, canTake])

  return (
    <button
      onClick={onClick}
      disabled={!canTake}
      className={`w-full rounded-2xl p-6 text-white shadow-lg transition-all duration-200 ${
        canTake 
          ? 'bg-primary-green hover:bg-primary-green-dark hover:scale-[1.02] cursor-pointer' 
          : 'bg-text-muted cursor-not-allowed opacity-75'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Timer Circle */}
          <div className="flex flex-col items-center gap-1">
            <div className="w-12 h-12 border-4 border-white/30 rounded-full flex items-center justify-center">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                {canTake ? (
                  <div className="text-lg font-bold">✓</div>
                ) : (
                  <Clock className="w-6 h-6" />
                )}
              </div>
            </div>
            {!canTake && timeLeft && (
              <div className="text-xs font-medium bg-white/20 px-2 py-1 rounded-full whitespace-nowrap">
                {timeLeft}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="text-left">
            <h3 className="text-2xl font-bold mb-1">Daily Quiz</h3>
            <p className="text-white/80 text-sm">
              {canTake ? 'Complete your daily challenge!' : 'Come back tomorrow'}
            </p>
          </div>
        </div>

        {/* Arrow */}
        <ChevronRight className="w-8 h-8 text-white/80" />
      </div>
    </button>
  )
}