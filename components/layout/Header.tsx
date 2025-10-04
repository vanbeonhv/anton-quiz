'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { User, LogOut, Settings, ChevronDown } from 'lucide-react'
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

  // Get user initials for avatar
  const getUserInitials = (email: string) => {
    return email.split('@')[0].slice(0, 2).toUpperCase()
  }

  return (
    <header className="sticky top-0 z-50 bg-bg-white/95 backdrop-blur-sm border-b border-bg-peach shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            href="/dashboard"
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <div className="relative">
              <Image
                src="/logo.svg"
                alt="Anton Quiz Logo"
                width={40}
                height={40}
                className="w-10 h-10 drop-shadow-sm"
              />
            </div>
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">
              Anton Quiz
            </h1>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-3">
            {loading ? (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-bg-peach rounded-full animate-pulse" />
                <div className="w-20 h-4 bg-bg-peach rounded animate-pulse" />
              </div>
            ) : user ? (
              <>
                {/* Admin Link (if admin) */}
                {isAdmin(user.email || '') && (
                  <Link
                    href="/admin"
                    className="px-3 py-2 rounded-lg text-primary-orange hover:text-primary-orange-dark hover:bg-primary-orange-light transition-all duration-200 flex items-center gap-2 font-medium"
                  >
                    <Settings className="w-4 h-4" />
                    <span className="hidden sm:inline">Admin</span>
                  </Link>
                )}

                {/* User Dropdown Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex items-center gap-3 px-3 py-2 h-auto hover:bg-bg-peach/50 transition-colors duration-200"
                    >
                      {/* User Avatar */}
                      <div className="w-8 h-8 bg-primary-green text-white rounded-full flex items-center justify-center text-sm font-semibold shadow-sm">
                        {getUserInitials(user.email || '')}
                      </div>

                      {/* User Info */}
                      <div className="hidden sm:flex flex-col items-start">
                        <span className="text-sm font-medium text-text-primary">
                          {user.email?.split('@')[0]}
                        </span>
                        <span className="text-xs text-text-muted">
                          {user.email?.split('@')[1]}
                        </span>
                      </div>

                      <ChevronDown className="w-4 h-4 text-text-muted" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64 p-2">
                    {/* User Info Header */}
                    <div className="px-2 py-3 border-b border-border">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-green text-white rounded-full flex items-center justify-center text-sm font-semibold">
                          {getUserInitials(user.email || '')}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-text-primary truncate">
                            {user.email?.split('@')[0]}
                          </p>
                          <p className="text-xs text-text-muted truncate">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <DropdownMenuItem asChild>
                        <Link href="/profile" className="flex items-center gap-3 px-2 py-2 rounded-md">
                          <User className="w-4 h-4" />
                          <span>Profile Settings</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="my-2" />
                      <DropdownMenuItem
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-2 py-2 rounded-md text-red-600 focus:text-red-600 focus:bg-red-50"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </DropdownMenuItem>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Link href="/login">
                <Button className="bg-primary-green hover:bg-primary-green-dark text-white px-6 py-2 rounded-lg font-medium shadow-sm hover:shadow-md transition-all duration-200">
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