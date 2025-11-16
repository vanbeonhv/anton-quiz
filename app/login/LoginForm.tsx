'use client'

import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Github, Loader2 } from 'lucide-react'
import { getPendingAnswer, clearPendingAnswer } from '@/lib/utils/sessionStorage'

export default function LoginForm() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const searchParams = useSearchParams()
  const router = useRouter()
  const supabase = createClient()

  // Check for error message in URL
  useEffect(() => {
    const urlMessage = searchParams.get('message')
    if (urlMessage) {
      setMessage(decodeURIComponent(urlMessage))
    }
  }, [searchParams])

  // Handle redirect if user is already authenticated
  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        handleRedirect()
      }
    }

    checkAuthAndRedirect()
  }, [searchParams, router, supabase])

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      if (isSignUp) {
        // Sign up the user
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${globalThis.location.origin}/auth/callback`
          }
        })

        if (signUpError) throw signUpError

        // If session exists, user is signed in immediately (email confirmation disabled)
        if (signUpData.session) {
          handleRedirect()
          return
        }

        // If no session, email confirmation is required
        if (signUpData.user && !signUpData.session) {
          setMessage('Account created! Please check your email to verify your account.')
          return
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        })
        if (error) throw error
        handleRedirect()
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleRedirect = () => {
    // Get return URL from query params
    const returnUrl = searchParams.get('returnUrl')

    // Check session storage for pending answer using utility
    const pendingAnswer = getPendingAnswer()

    if (pendingAnswer) {
      // Clear session storage after reading
      clearPendingAnswer()

      // Redirect to question page with auto-submit parameters
      const questionType = pendingAnswer.isDailyQuestion ? 'daily' : 'regular'
      const params = new URLSearchParams({
        autoSubmit: 'true',
        answer: pendingAnswer.answer,
        type: questionType
      })
      router.push(`/questions/${pendingAnswer.questionId}?${params.toString()}`)
    } else if (returnUrl) {
      // Redirect to return URL if no pending answer
      router.push(returnUrl)
    } else {
      // Default redirect to dashboard
      router.push('/dashboard')
    }
  }

  const handleGithubAuth = async () => {
    setLoading(true)
    try {
      // Preserve return URL in OAuth redirect
      const returnUrl = searchParams.get('returnUrl')
      const redirectUrl = new URL(`${globalThis.location.origin}/auth/callback`)
      if (returnUrl) {
        redirectUrl.searchParams.set('next', returnUrl)
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: redirectUrl.toString()
        }
      })
      if (error) throw error
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'An error occurred')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg-peach flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-text-primary">
            {isSignUp ? 'Sign Up' : 'Login'}
          </CardTitle>
          <CardDescription className="text-text-secondary">
            {isSignUp
              ? 'Create an account to start taking quizzes'
              : 'Welcome back! Please login to continue'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {message && (
            <div className={`p-3 rounded-md text-sm ${message.includes('Check your email')
              ? 'bg-primary-green-light text-primary-green-dark'
              : 'bg-accent-red/10 text-accent-red'
              }`}>
              {message}
            </div>
          )}

          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-primary-green hover:bg-primary-green-dark"
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? 'Logging in...' : (isSignUp ? 'Sign Up' : 'Login')}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-bg-peach" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-text-muted">Or continue with</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGithubAuth}
            disabled={loading}
          >
            <Github className="mr-2 h-4 w-4" />
            GitHub
          </Button>

          <div className="text-center">
            <button
              type="button"
              className="text-sm text-primary-green hover:text-primary-green-dark"
              onClick={() => setIsSignUp(!isSignUp)}
            >
              {isSignUp
                ? 'Already have an account? Login'
                : "Don't have an account? Sign up"
              }
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}