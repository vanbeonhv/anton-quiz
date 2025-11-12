'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Github, Loader2 } from 'lucide-react'

interface PendingAnswer {
  questionId: string
  answer: string
  isDailyQuestion: boolean
  timestamp: number
}

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

  // Handle redirect after successful authentication
  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // Get return URL from query params
        const returnUrl = searchParams.get('returnUrl')
        
        // Check session storage for pending answer
        const pendingAnswerData = sessionStorage.getItem('pendingAnswer')
        
        if (pendingAnswerData) {
          try {
            const pendingAnswer: PendingAnswer = JSON.parse(pendingAnswerData)
            
            // Clear session storage after reading
            sessionStorage.removeItem('pendingAnswer')
            
            // Redirect to question page with auto-submit parameters
            const questionType = pendingAnswer.isDailyQuestion ? 'daily' : 'regular'
            router.push(
              `/questions/${pendingAnswer.questionId}?autoSubmit=true&answer=${pendingAnswer.answer}&type=${questionType}`
            )
          } catch (error) {
            console.error('Failed to parse pending answer:', error)
            // Fall back to return URL or dashboard
            if (returnUrl) {
              router.push(returnUrl)
            } else {
              router.push('/dashboard')
            }
          }
        } else if (returnUrl) {
          // Redirect to return URL if no pending answer
          router.push(returnUrl)
        } else {
          // Default redirect to dashboard
          router.push('/dashboard')
        }
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
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${globalThis.location.origin}/auth/callback`
          }
        })
        if (error) throw error
        setMessage('Check your email for verification link!')
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        })
        if (error) throw error
        // Redirect will be handled by the useEffect hook
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setLoading(false)
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
            {isSignUp ? 'Sign Up' : 'Sign In'}
          </CardTitle>
          <CardDescription className="text-text-secondary">
            {isSignUp 
              ? 'Create an account to start taking quizzes'
              : 'Welcome back! Please sign in to continue'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {message && (
            <div className={`p-3 rounded-md text-sm ${
              message.includes('Check your email') 
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
              {loading ? 'Signing in...' : (isSignUp ? 'Sign Up' : 'Sign In')}
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
                ? 'Already have an account? Sign in'
                : "Don't have an account? Sign up"
              }
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}