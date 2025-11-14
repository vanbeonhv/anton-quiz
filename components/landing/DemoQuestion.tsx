'use client'

import { useState } from 'react'
import { AnswerOption } from '@/components/questions/AnswerOption'
import { Button } from '@/components/ui/button'
import { MarkdownText } from '@/lib/utils/markdown'
import { ArrowRight } from 'lucide-react'
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver'

interface DemoQuestionProps {
  question?: {
    text: string
    options: { label: 'A' | 'B' | 'C' | 'D'; text: string }[]
    correctAnswer: 'A' | 'B' | 'C' | 'D'
    explanation: string
  }
}

const DEFAULT_QUESTION = {
  text: "What is the time complexity of binary search?",
  options: [
    { label: 'A' as const, text: 'O(n)' },
    { label: 'B' as const, text: 'O(log n)' },
    { label: 'C' as const, text: 'O(n²)' },
    { label: 'D' as const, text: 'O(1)' }
  ],
  correctAnswer: 'B' as const,
  explanation: "Binary search has O(log n) time complexity because it divides the search space in half with each iteration."
}

export function DemoQuestion({ question = DEFAULT_QUESTION }: DemoQuestionProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<'A' | 'B' | 'C' | 'D' | null>(null)
  const [showResult, setShowResult] = useState(false)
  const { ref, isVisible } = useIntersectionObserver({ threshold: 0.3 })

  const handleAnswerSelect = (label: 'A' | 'B' | 'C' | 'D') => {
    if (showResult) return // Prevent answer changes after submission
    
    setSelectedAnswer(label)
    // Auto-submit after selection
    setShowResult(true)
  }

  const isCorrect = selectedAnswer === question.correctAnswer

  return (
    <div ref={ref as any} className="w-full max-w-3xl mx-auto px-4">
      <div 
        className={`bg-white rounded-xl md:rounded-2xl border-2 border-bg-peach p-4 sm:p-6 md:p-8 shadow-lg transition-all duration-500 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
        role="region"
        aria-label="Interactive demo question"
      >
        {/* Question Text */}
        <div className="mb-4 md:mb-6">
          <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-text-primary mb-2">
            Try a Sample Question
          </h3>
          <p className="text-sm sm:text-base md:text-lg text-text-primary" role="heading" aria-level={4}>
            <MarkdownText>{question.text}</MarkdownText>
          </p>
        </div>

        {/* Answer Options */}
        <div 
          className="space-y-2 md:space-y-3 mb-4 md:mb-6"
          role="radiogroup"
          aria-label="Answer options"
        >
          {question.options.map((option) => (
            <AnswerOption
              key={option.label}
              label={option.label}
              text={option.text}
              selected={selectedAnswer === option.label}
              showResult={showResult}
              isCorrect={option.label === question.correctAnswer}
              isUserAnswer={selectedAnswer === option.label}
              onClick={() => handleAnswerSelect(option.label)}
            />
          ))}
        </div>

        {/* Result and Explanation */}
        {showResult && (
          <div className="space-y-4 animate-in fade-in duration-300">
            {/* Result Badge */}
            <div className={`p-3 sm:p-4 rounded-lg md:rounded-xl ${
              isCorrect 
                ? 'bg-primary-green/10 border-2 border-primary-green' 
                : 'bg-primary-orange/10 border-2 border-primary-orange'
            }`}>
              <p className={`font-semibold text-base sm:text-lg ${
                isCorrect ? 'text-primary-green' : 'text-primary-orange'
              }`}>
                {isCorrect ? '✓ Correct!' : '✗ Incorrect'}
              </p>
              <p className="text-text-secondary mt-2 text-sm sm:text-base">
                <MarkdownText>{question.explanation}</MarkdownText>
              </p>
            </div>

            {/* Sign Up Prompt */}
            <div className="bg-gradient-to-r from-primary-green/5 to-primary-orange/5 p-4 sm:p-6 rounded-lg md:rounded-xl border-2 border-bg-peach">
              <h4 className="text-base sm:text-lg font-semibold text-text-primary mb-2">
                Want to continue learning?
              </h4>
              <p className="text-text-secondary mb-4 text-sm sm:text-base">
                Sign up for free to access hundreds of questions, track your progress, and compete on leaderboards!
              </p>
              <Button 
                asChild
                className="bg-primary-orange hover:bg-primary-orange/90 text-white font-semibold min-h-[44px] w-full sm:w-auto landing-button focus:ring-2 focus:ring-primary-orange focus:ring-offset-2"
              >
                <a href="/login" className="flex items-center justify-center group">
                  Sign Up Free
                  <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                </a>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
