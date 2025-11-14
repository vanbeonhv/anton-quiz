import React from 'react'
import { BookOpen, TrendingUp, Trophy } from 'lucide-react'
import { FeatureCard } from './FeatureCard'
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver'

export function FeaturesSection() {
  const { ref, isVisible } = useIntersectionObserver({ threshold: 0.2 })

  return (
    <section ref={ref} className="py-12 md:py-20 px-4 bg-gradient-to-br from-bg-cream to-bg-peach">
      <div className="max-w-6xl mx-auto">
        {/* Section Heading */}
        <div className={`text-center mb-12 md:mb-16 transition-all duration-500 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Everything You Need to Excel
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Practice, track your progress, and compete with others in a comprehensive learning platform
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          <div className={`transition-all duration-500 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`} style={{ transitionDelay: '100ms' }}>
            <FeatureCard
              icon={<BookOpen className="w-full h-full" />}
              title="Practice Questions"
              description="Access hundreds of questions across multiple difficulty levels. Learn at your own pace with instant feedback and detailed explanations."
              accentColor="green"
            />
          </div>

          <div className={`transition-all duration-500 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`} style={{ transitionDelay: '200ms' }}>
            <FeatureCard
              icon={<TrendingUp className="w-full h-full" />}
              title="Track Progress"
              description="Monitor your learning journey with comprehensive statistics, accuracy rates, and performance insights across different topics."
              accentColor="orange"
            />
          </div>

          <div className={`transition-all duration-500 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`} style={{ transitionDelay: '300ms' }}>
            <FeatureCard
              icon={<Trophy className="w-full h-full" />}
              title="Compete on Leaderboards"
              description="Challenge yourself and compete with others. Climb the rankings, earn XP, and level up as you master new skills."
              accentColor="yellow"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
