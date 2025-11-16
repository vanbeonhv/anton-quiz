'use client'

import { useState, type MouseEvent, type KeyboardEvent } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { GradientBackground } from './GradientBackground'
import { ArrowRight } from 'lucide-react'

interface HeroSectionProps {
  onTryDemo?: () => void
}

export function HeroSection({ onTryDemo }: HeroSectionProps) {
  const [imageLoaded, setImageLoaded] = useState(false)

  const handleTryQuestion = (e: MouseEvent | KeyboardEvent) => {
    if (onTryDemo) {
      e.preventDefault()
      onTryDemo()
    }
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    // Handle Enter and Space keys for accessibility
    if (e.key === 'Enter' || e.key === ' ') {
      handleTryQuestion(e)
    }
  }

  return (
    <GradientBackground variant="hero" className="px-4 py-16 md:py-24 lg:py-32">
      <div className="max-w-6xl mx-auto">
        {/* Logo */}
        <div className="flex justify-center mb-8 lg:hidden animate-fade-in">
          <div className="relative w-16 h-16 md:w-20 md:h-20">
            <Image
              src="/logo.svg"
              alt="Anton Questions App Logo"
              fill
              className="object-contain"
              priority
              sizes="80px"
            />
          </div>
        </div>

        {/* Two-column layout for desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left column: Content */}
          <div className="text-center lg:text-left animate-fade-in-left">
            {/* Logo for desktop */}
            <div className="hidden lg:flex mb-8 animate-fade-in">
              <div className="relative w-20 h-20">
                <Image
                  src="/logo.svg"
                  alt="Anton Questions App Logo"
                  fill
                  className="object-contain"
                  priority
                  sizes="80px"
                />
              </div>
            </div>

            {/* Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-black text-text-primary mb-4 md:mb-6 animate-fade-in animation-delay-100 tracking-tight leading-tight font-heading">
              Practice, Learn, and Level Up
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl lg:text-2xl text-text-secondary mb-6 md:mb-8 animate-fade-in animation-delay-200 font-medium">
              Master your knowledge with thousands of questions across multiple topics and difficulty levels
            </p>

            {/* Description */}
            <p className="text-base md:text-lg text-text-secondary/80 mb-8 md:mb-10 animate-fade-in animation-delay-300 font-light">
              Track your progress, earn XP, and compete on leaderboards while improving your skills
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-in animation-delay-400">
              <Button
                asChild={!onTryDemo}
                size="lg"
                className="bg-primary-green hover:bg-primary-green/90 text-white px-6 py-3 sm:px-8 sm:py-6 text-base sm:text-lg font-semibold min-h-[48px] min-w-[48px] landing-button focus:ring-2 focus:ring-primary-green focus:ring-offset-2 transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95"
                onClick={onTryDemo ? handleTryQuestion : undefined}
                onKeyDown={onTryDemo ? handleKeyDown : undefined}
                aria-label="Try a sample question"
              >
                {onTryDemo ? (
                  <span className="group flex items-center justify-center">
                    Try a Question
                    <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:translate-x-1" />
                  </span>
                ) : (
                  <Link href="/questions" className="flex items-center justify-center group">
                    Try a Question
                    <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:translate-x-1" />
                  </Link>
                )}
              </Button>

              <Button
                asChild
                size="lg"
                className="bg-primary-orange hover:bg-primary-orange/90 text-white px-6 py-3 sm:px-8 sm:py-6 text-base sm:text-lg font-semibold min-h-[48px] min-w-[48px] landing-button focus:ring-2 focus:ring-primary-orange focus:ring-offset-2 transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95"
                aria-label="Sign up for free account"
              >
                <Link href="/login" className="flex items-center justify-center">
                  Sign Up Free
                </Link>
              </Button>
            </div>
          </div>

          {/* Right column: Screenshot */}
          <div className="relative animate-fade-in-right animation-delay-200">
            <div 
              className={`relative w-full aspect-[4/3] transition-all duration-500 hover:scale-[1.02] ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <Image
                src="/screenshots/question.png"
                alt="Question interface showing multiple choice options with difficulty levels and tags"
                fill
                className="object-contain rounded-lg md:shadow-2xl transition-shadow duration-300 hover:shadow-3xl"
                priority
                onLoad={() => setImageLoaded(true)}
                sizes="(max-width: 640px) 95vw, (max-width: 1024px) 50vw, 600px"
                quality={90}
              />
            </div>
            
            {/* Loading placeholder */}
            {!imageLoaded && (
              <div className="absolute inset-0 bg-bg-cream rounded-lg animate-pulse" />
            )}
          </div>
        </div>
      </div>
    </GradientBackground>
  )
}
