'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

export default function RootPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        // Authenticated users go to dashboard
        router.push('/dashboard')
      } else {
        // Unauthenticated users go to landing page
        router.push('/landing')
      }
    }
  }, [user, isLoading, router])

  // Show loading state while checking authentication
  return (
    <div className="min-h-screen bg-bg-peach flex items-center justify-center">
      <div className="text-text-primary">Loading...</div>
    </div>
  )
}
