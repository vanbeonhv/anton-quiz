'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { User, LogOut, Trophy, Settings } from 'lucide-react'
import type { User as SupabaseUser } from '@supabase/supabase-js'

export function Header() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    // Get initial user
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }
    getUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <header className="bg-bg-white border-b border-bg-peach">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center">
            <h1 className="text-2xl font-bold text-text-primary">
              QuizApp
            </h1>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center space-x-4">
            {loading ? (
              <div className="text-text-secondary">Loading...</div>
            ) : user ? (
              <>
                {/* Navigation Links */}
                <Link 
                  href="/dashboard" 
                  className="text-text-secondary hover:text-text-primary transition-colors"
                >
                  Dashboard
                </Link>
                <Link 
                  href="/scoreboard" 
                  className="text-text-secondary hover:text-text-primary transition-colors flex items-center gap-1"
                >
                  <Trophy className="w-4 h-4" />
                  Scoreboard
                </Link>
                
                {/* User Info */}
                <div className="flex items-center gap-2 text-text-secondary">
                  <User className="w-4 h-4" />
                  <span className="text-sm">{user.email}</span>
                </div>

                {/* Admin Link (if admin) */}
                {isAdmin(user.email || '') && (
                  <Link 
                    href="/admin" 
                    className="text-primary-orange hover:text-primary-orange-dark transition-colors flex items-center gap-1"
                  >
                    <Settings className="w-4 h-4" />
                    Admin
                  </Link>
                )}

                {/* Logout Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="flex items-center gap-1"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              </>
            ) : (
              <Link href="/login">
                <Button className="bg-primary-green hover:bg-primary-green-dark">
                  Sign In
                </Button>
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}

// Helper function to check if user is admin
function isAdmin(email: string): boolean {
  const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',').map(e => e.trim()) || []
  return adminEmails.includes(email)
}