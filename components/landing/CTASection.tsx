'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { GradientBackground } from './GradientBackground'
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver'

export function CTASection() {
  const { ref, isVisible } = useIntersectionObserver({ threshold: 0.3 })

  return (
    <GradientBackground variant="cta" className="py-12 md:py-16 lg:py-20">
      <section 
        ref={ref as any} 
        className="container mx-auto px-4 max-w-4xl text-center"
        aria-label="Call to action"
      >
        <h2 className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 md:mb-4 transition-all duration-500 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          Ready to Level Up Your Knowledge?
        </h2>
        <p className={`text-base sm:text-lg md:text-xl text-gray-600 mb-6 md:mb-8 max-w-2xl mx-auto px-4 transition-all duration-500 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`} style={{ transitionDelay: '100ms' }}>
          Join thousands of learners practicing questions, tracking progress, and competing on leaderboards.
        </p>
        <div className={`flex flex-col sm:flex-row gap-4 justify-center items-stretch sm:items-center transition-all duration-500 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`} style={{ transitionDelay: '200ms' }}>
          <Link href="/questions" className="w-full sm:w-auto">
            <Button 
              size="lg" 
              className="bg-primary-green hover:bg-primary-green/90 text-white px-6 sm:px-8 py-3 sm:py-6 text-base sm:text-lg min-h-[44px] w-full landing-button focus:ring-2 focus:ring-primary-green focus:ring-offset-2"
              aria-label="Browse all available questions"
            >
              Browse Questions
            </Button>
          </Link>
          <Link href="/login" className="w-full sm:w-auto">
            <Button 
              size="lg" 
              variant="outline"
              className="border-2 border-primary-orange text-primary-orange hover:bg-primary-orange hover:text-white px-6 sm:px-8 py-3 sm:py-6 text-base sm:text-lg min-h-[44px] w-full landing-button focus:ring-2 focus:ring-primary-orange focus:ring-offset-2"
              aria-label="Create a free account to get started"
            >
              Create Account
            </Button>
          </Link>
        </div>
      </section>
    </GradientBackground>
  )
}
