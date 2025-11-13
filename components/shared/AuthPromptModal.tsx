'use client'

import { useEffect } from 'react'
import { Lock, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AuthPromptModalProps {
  readonly isOpen: boolean
  readonly onClose: () => void
  readonly onLogin: () => void
  readonly onSignup: () => void
  readonly message?: string
}

export function AuthPromptModal({
  isOpen,
  onClose,
  onLogin,
  onSignup,
  message
}: AuthPromptModalProps) {
  // Handle escape key press
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  // Focus trap implementation
  useEffect(() => {
    if (!isOpen) return

    const modal = document.getElementById('auth-prompt-modal')
    if (!modal) return

    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement?.focus()
        }
      } else if (document.activeElement === lastElement) {
        e.preventDefault()
        firstElement?.focus()
      }
    }

    modal.addEventListener('keydown', handleTab as EventListener)
    firstElement?.focus()

    return () => {
      modal.removeEventListener('keydown', handleTab as EventListener)
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 animate-in fade-in-0 duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Content */}
      <div
        id="auth-prompt-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        aria-describedby="auth-modal-description"
        className="relative z-10 w-full max-w-md bg-white border border-bg-peach rounded-lg shadow-xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-20 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-primary-green focus:ring-offset-2 text-text-muted hover:text-text-primary"
          aria-label="Close dialog"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>

        <div className="p-8 space-y-6">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-green/10 to-primary-orange/10 rounded-full flex items-center justify-center border-2 border-primary-green/20">
              <Lock className="w-8 h-8 text-primary-green" />
            </div>
          </div>

          {/* Heading */}
          <div className="text-center space-y-2">
            <h2
              id="auth-modal-title"
              className="text-text-primary font-bold text-2xl"
            >
              Login Required
            </h2>
            <p
              id="auth-modal-description"
              className="text-text-secondary text-base"
            >
              {message || 'Sign in to submit your answer and track your progress'}
            </p>
          </div>

          {/* Benefits List */}
          <div className="bg-bg-peach/30 rounded-lg p-4 space-y-2">
            <p className="text-text-primary text-sm font-medium mb-3">
              Create an account to:
            </p>
            <ul className="space-y-2 text-text-primary text-sm">
              <li className="flex items-start gap-2">
                <span className="text-primary-green mt-0.5">✓</span>
                <span>Track your progress and performance</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-green mt-0.5">✓</span>
                <span>Maintain your answer streak</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-green mt-0.5">✓</span>
                <span>Compete on the leaderboard</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-green mt-0.5">✓</span>
                <span>Earn XP and level up</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={onLogin}
              className="flex-1 bg-primary-green hover:bg-primary-green/90 text-white font-medium h-11 focus:ring-2 focus:ring-primary-green focus:ring-offset-2"
            >
              Log In
            </Button>
            <Button
              onClick={onSignup}
              className="flex-1 bg-primary-orange hover:bg-primary-orange/90 text-white font-medium h-11 focus:ring-2 focus:ring-primary-orange focus:ring-offset-2"
            >
              Sign Up
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
