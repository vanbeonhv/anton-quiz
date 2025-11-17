'use client'

import { useEffect, useRef } from 'react'
import { HeroSection } from '@/components/landing/HeroSection'
import { ProductShowcase } from '@/components/landing/ProductShowcase'
import { FeaturesSection } from '@/components/landing/FeaturesSection'
import { DemoQuestion } from '@/components/landing/DemoQuestion'
import { StatsSection } from '@/components/landing/StatsSection'
import { CTASection } from '@/components/landing/CTASection'
import { ScrollToTop } from '@/components/landing/ScrollToTop'

export default function LandingPage() {
  const demoRef = useRef<HTMLElement>(null)

  // Preload critical images for better performance
  useEffect(() => {
    // Preload hero image
    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = 'image'
    link.href = '/screenshots/question.png'
    link.fetchPriority = 'high'
    document.head.appendChild(link)

    return () => {
      document.head.removeChild(link)
    }
  }, [])

  // Smooth scroll to demo section
  const handleTryDemo = () => {
    demoRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'center'
    })
  }

  return (
    <div className="min-h-screen bg-bg-peach">
      {/* Main content */}
      <main role="main">
        {/* Hero Section */}
        <HeroSection onTryDemo={handleTryDemo} />

        {/* Product Showcase - Question Interface */}
        <ProductShowcase
          title="Practice with Real Questions"
          description="Experience our intuitive question interface designed for effective learning. Each question comes with multiple difficulty levels, detailed explanations, and instant feedback to help you understand concepts better."
          imageSrc="/screenshots/question.png"
          imageAlt="Question interface showing multiple choice options with difficulty levels and instant feedback"
          features={[
            'Multiple difficulty levels (Easy, Medium, Hard)',
            'Instant feedback with detailed explanations',
            'Tag-based organization for easy navigation',
            'Track your progress with XP and level system'
          ]}
        />

        {/* Product Showcase - Dashboard */}
        <ProductShowcase
          title="Track Your Progress"
          description="Monitor your learning journey with comprehensive statistics and insights. See your performance across different difficulty levels, maintain streaks, and watch your knowledge grow over time."
          imageSrc="/screenshots/dashboard.png"
          imageAlt="Dashboard displaying user statistics, performance metrics, and progress tracking"
          reverse
          features={[
            'Detailed performance analytics by difficulty',
            'Streak tracking to maintain consistency',
            'Visual progress indicators and achievements',
            'Leaderboard rankings to compete with others'
          ]}
        />

        {/* Features Section */}
        <FeaturesSection />

        {/* Interactive Demo Section */}
        <section 
          ref={demoRef} 
          className="px-4 py-12 md:py-20 bg-bg-peach"
          aria-label="Interactive demo question"
        >
          <DemoQuestion />
        </section>

        {/* Statistics Section */}
        <StatsSection />

        {/* Final CTA Section */}
        <CTASection />
      </main>

      {/* Footer */}
      <footer className="px-4 py-8 bg-bg-cream border-t-2 border-bg-peach" role="contentinfo">
        <div className="max-w-6xl mx-auto text-center text-text-muted">
          <p>&copy; {new Date().getFullYear()} Anton Questions App. All rights reserved.</p>
        </div>
      </footer>

      {/* Scroll to Top Button */}
      <ScrollToTop />
    </div>
  )
}
