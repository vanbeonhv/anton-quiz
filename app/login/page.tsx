import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import LoginForm from './LoginForm'

export default async function LoginPage() {
  const supabase = createClient()
  
  // Check if user is already authenticated
  const { data: { user } } = await supabase.auth.getUser()
  
  // If user is logged in, redirect to dashboard
  if (user) {
    redirect('/dashboard')
  }

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-bg-peach flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-green border-t-transparent mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading...</p>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}