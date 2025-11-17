'use client'

import { useEffect, useState } from 'react'
import { Sparkles, Trophy, TrendingUp } from 'lucide-react'
import { StatCard } from './StatCard'
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver'

interface LandingPageStats {
  totalQuestions: number
  totalUsers: number
  questionsAnsweredToday: number
}

const FALLBACK_STATS: LandingPageStats = {
  totalQuestions: 500,
  totalUsers: 1200,
  questionsAnsweredToday: 350,
}

export function StatsSection() {
  const [stats, setStats] = useState<LandingPageStats>(FALLBACK_STATS)
  const [isLoading, setIsLoading] = useState(true)
  const { ref, isVisible } = useIntersectionObserver({ threshold: 0.2 })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/public/stats')
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error)
        // Use fallback stats
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  return (
    <section 
      ref={ref} 
      className="py-12 md:py-16 lg:py-20 bg-gradient-to-br from-bg-cream to-bg-peach min-h-[550px] flex items-center"
      aria-label="Platform statistics"
    >
      <div className="container mx-auto px-4 max-w-6xl w-full">
        <div className={`text-center mb-8 md:mb-12 transition-all duration-500 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 md:mb-4">
            Join Our Growing Community
          </h2>
          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto px-4">
            Thousands of learners are already improving their skills with our platform
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
          <div className={`transition-all duration-500 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`} style={{ transitionDelay: '100ms' }}>
            <StatCard
              icon={<Sparkles size={48} aria-hidden="true" />}
              value={stats.totalQuestions}
              label="Total Questions"
              color="green"
              isVisible={isVisible}
            />
          </div>
          <div className={`transition-all duration-500 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`} style={{ transitionDelay: '200ms' }}>
            <StatCard
              icon={<Trophy size={48} aria-hidden="true" />}
              value={stats.totalUsers}
              label="Active Users"
              color="orange"
              isVisible={isVisible}
            />
          </div>
          <div className={`transition-all duration-500 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`} style={{ transitionDelay: '300ms' }}>
            <StatCard
              icon={<TrendingUp size={48} aria-hidden="true" />}
              value={stats.questionsAnsweredToday}
              label="Questions Answered Today"
              color="yellow"
              isVisible={isVisible}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
