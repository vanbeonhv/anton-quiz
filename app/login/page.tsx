import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { LoadingState } from '@/components/shared'
import LoginForm from './LoginForm'

export default async function LoginPage() {
  const supabase = await createClient()
  
  // Check if user is already authenticated
  const { data: { user } } = await supabase.auth.getUser()
  
  // If user is logged in, redirect to dashboard
  if (user) {
    redirect('/dashboard')
  }

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-bg-peach flex items-center justify-center p-4">
        <LoadingState message="Preparing login..." />
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}