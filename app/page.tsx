'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { BookOpen, TrendingUp, Trophy, ArrowRight, Sparkles } from 'lucide-react'

export default function LandingPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState({
    totalQuestions: 0,
    totalUsers: 0,
    questionsAnsweredToday: 0
  })

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!isLoading && user) {
      router.push('/dashboard')
    }
  }, [user, isLoading, router])

  // Fetch public statistics
  useEffect(() => {
    async function fetchStats() {
      try {
        // Fetch total questions count (we'll need to create a public endpoint or use existing data)
        // For now, using placeholder values
        setStats({
          totalQuestions: 500,
          totalUsers: 1200,
          questionsAnsweredToday: 350
        })
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      }
    }

    if (!user) {
      fetchStats()
    }
  }, [user])

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-peach flex items-center justify-center">
        <div className="text-text-primary">Loading...</div>
      </div>
    )
  }

  // Don't render landing page for authenticated users
  if (user) {
    return null
  }

  return (
    <div className="min-h-screen bg-bg-peach">
      {/* Hero Section */}
      <section className="px-4 py-16 md:py-24 lg:py-32">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex justify-center mb-8">
            <div className="relative w-20 h-20 md:w-24 md:h-24">
              <Image
                src="/logo.png"
                alt="Anton Questions App"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-text-primary mb-4 md:mb-6">
            Practice, Learn, and Level Up
          </h1>
          
          <p className="text-lg md:text-xl lg:text-2xl text-text-secondary mb-8 md:mb-12 max-w-3xl mx-auto">
            Master your knowledge with thousands of questions across multiple topics and difficulty levels
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              asChild
              size="lg"
              className="bg-primary-green hover:bg-primary-green-dark text-white px-8 py-6 text-lg w-full sm:w-auto"
            >
              <Link href="/questions">
                Browse Questions
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            
            <Button
              asChild
              size="lg"
              variant="outline"
              className="bg-primary-orange hover:bg-primary-orange-dark text-white border-primary-orange px-8 py-6 text-lg w-full sm:w-auto"
            >
              <Link href="/login">
                Sign Up Free
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-12 md:py-20 bg-bg-cream">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary text-center mb-12 md:mb-16">
            Why Choose Anton Questions?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {/* Feature 1 */}
            <Card className="p-6 md:p-8 bg-bg-white border-2 border-bg-peach hover:border-primary-green transition-colors">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-primary-green-light flex items-center justify-center">
                  <BookOpen className="w-8 h-8 text-primary-green" />
                </div>
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-text-primary mb-4 text-center">
                Thousands of Questions
              </h3>
              <p className="text-text-secondary text-center">
                Browse questions across multiple topics and difficulty levels. From easy warm-ups to challenging brain teasers.
              </p>
            </Card>

            {/* Feature 2 */}
            <Card className="p-6 md:p-8 bg-bg-white border-2 border-bg-peach hover:border-primary-orange transition-colors">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-primary-orange-light flex items-center justify-center">
                  <TrendingUp className="w-8 h-8 text-primary-orange" />
                </div>
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-text-primary mb-4 text-center">
                Track Your Progress
              </h3>
              <p className="text-text-secondary text-center">
                Level up, earn XP, and maintain streaks. Watch your knowledge grow with detailed statistics and achievements.
              </p>
            </Card>

            {/* Feature 3 */}
            <Card className="p-6 md:p-8 bg-bg-white border-2 border-bg-peach hover:border-accent-yellow transition-colors md:col-span-2 lg:col-span-1 md:mx-auto md:max-w-md lg:max-w-none">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-accent-yellow/20 flex items-center justify-center">
                  <Trophy className="w-8 h-8 text-accent-yellow" />
                </div>
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-text-primary mb-4 text-center">
                Compete on Leaderboards
              </h3>
              <p className="text-text-secondary text-center">
                See how you rank against other users. Climb the leaderboard and prove your expertise.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Quick Stats Section */}
      <section className="px-4 py-12 md:py-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <div className="text-center p-6 md:p-8 bg-bg-white rounded-lg border-2 border-bg-peach">
              <div className="flex justify-center mb-4">
                <Sparkles className="w-10 h-10 text-primary-green" />
              </div>
              <div className="text-4xl md:text-5xl font-bold text-primary-green mb-2">
                {stats.totalQuestions.toLocaleString()}+
              </div>
              <div className="text-text-secondary text-lg">
                Questions Available
              </div>
            </div>

            <div className="text-center p-6 md:p-8 bg-bg-white rounded-lg border-2 border-bg-peach">
              <div className="flex justify-center mb-4">
                <Trophy className="w-10 h-10 text-primary-orange" />
              </div>
              <div className="text-4xl md:text-5xl font-bold text-primary-orange mb-2">
                {stats.totalUsers.toLocaleString()}+
              </div>
              <div className="text-text-secondary text-lg">
                Active Learners
              </div>
            </div>

            <div className="text-center p-6 md:p-8 bg-bg-white rounded-lg border-2 border-bg-peach md:col-span-3 lg:col-span-1 md:mx-auto md:max-w-md lg:max-w-none">
              <div className="flex justify-center mb-4">
                <TrendingUp className="w-10 h-10 text-accent-yellow" />
              </div>
              <div className="text-4xl md:text-5xl font-bold text-accent-yellow mb-2">
                {stats.questionsAnsweredToday.toLocaleString()}+
              </div>
              <div className="text-text-secondary text-lg">
                Answered Today
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="px-4 py-12 md:py-20 bg-gradient-to-br from-primary-green-light to-primary-orange-light">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-text-primary mb-4 md:mb-6">
            Ready to Get Started?
          </h2>
          
          <p className="text-lg md:text-xl text-text-secondary mb-8 md:mb-12">
            Join thousands of learners improving their knowledge every day
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              asChild
              size="lg"
              className="bg-primary-green hover:bg-primary-green-dark text-white px-8 py-6 text-lg w-full sm:w-auto"
            >
              <Link href="/questions">
                Browse Questions
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            
            <Button
              asChild
              size="lg"
              className="bg-primary-orange hover:bg-primary-orange-dark text-white px-8 py-6 text-lg w-full sm:w-auto"
            >
              <Link href="/login">
                Create Account
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 py-8 bg-bg-cream border-t-2 border-bg-peach">
        <div className="max-w-6xl mx-auto text-center text-text-muted">
          <p>&copy; {new Date().getFullYear()} Anton Questions App. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
