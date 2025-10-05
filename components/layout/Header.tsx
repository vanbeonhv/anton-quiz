'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { User, LogOut, Settings, ChevronDown, Menu, X } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { isAdmin } from '@/lib/utils/admin'
import type { User as SupabaseUser } from '@supabase/supabase-js'

export function Header() {
  const { user, isLoading: loading, logout } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
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
                {/* Main Navigation Links - Desktop */}
                <div className="hidden md:flex items-center gap-1 mr-2">
                  <Link
                    href="/dashboard"
                    className="px-3 py-2 rounded-lg text-text-primary hover:text-primary-green hover:bg-primary-green-light transition-all duration-200 font-medium"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/questions"
                    className="px-3 py-2 rounded-lg text-text-primary hover:text-primary-green hover:bg-primary-green-light transition-all duration-200 font-medium"
                  >
                    Questions
                  </Link>
                  <Link
                    href="/scoreboard"
                    className="px-3 py-2 rounded-lg text-text-primary hover:text-primary-green hover:bg-primary-green-light transition-all duration-200 font-medium"
                  >
                    Scoreboard
                  </Link>
                </div>

                {/* Mobile Menu Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="md:hidden p-2"
                  onClick={toggleMobileMenu}
                  aria-label="Toggle mobile menu"
                >
                  {isMobileMenuOpen ? (
                    <X className="w-5 h-5" />
                  ) : (
                    <Menu className="w-5 h-5" />
                  )}
                </Button>

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
                      {user.user_metadata?.avatar_url ? (
                        <Image
                          src={user.user_metadata.avatar_url}
                          alt="User avatar"
                          width={32}
                          height={32}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-primary-green text-white rounded-full flex items-center justify-center text-sm font-semibold shadow-sm">
                          {getUserInitials(user)}
                        </div>
                      )}

                      {/* User Info */}
                      <div className="hidden sm:flex flex-col items-start">
                        <span className="text-sm font-semibold text-text-primary">
                          {getDisplayName(user)}
                        </span>
                        {getDisplaySubtext(user) && (
                          <span className="text-xs text-text-muted">
                            {getDisplaySubtext(user)}
                          </span>
                        )}
                      </div>

                      <ChevronDown className="w-4 h-4 text-text-muted" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64 p-2">
                    {/* User Info Header */}
                    <div className="px-2 py-3 border-b border-border">
                      <div className="flex items-center gap-3">
                        {user.user_metadata?.avatar_url ? (
                          <Image
                            src={user.user_metadata.avatar_url}
                            alt="User avatar"
                            width={40}
                            height={40}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-primary-green text-white rounded-full flex items-center justify-center text-sm font-semibold">
                            {getUserInitials(user)}
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-text-primary truncate">
                            {getDisplayName(user)}
                          </p>
                          <p className="text-xs text-text-muted truncate">
                            {getDropdownSubtext(user)}
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
                        onClick={logout}
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

      {/* Mobile Navigation Menu */}
      {user && isMobileMenuOpen && (
        <div className="md:hidden bg-bg-white border-b border-bg-peach shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-4 space-y-2">
            <Link
              href="/dashboard"
              className="block px-3 py-2 rounded-lg text-text-primary hover:text-primary-green hover:bg-primary-green-light transition-all duration-200 font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              href="/questions"
              className="block px-3 py-2 rounded-lg text-text-primary hover:text-primary-green hover:bg-primary-green-light transition-all duration-200 font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Questions
            </Link>
            <Link
              href="/scoreboard"
              className="block px-3 py-2 rounded-lg text-text-primary hover:text-primary-green hover:bg-primary-green-light transition-all duration-200 font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Scoreboard
            </Link>
            <Link
              href="/profile"
              className="block px-3 py-2 rounded-lg text-text-primary hover:text-primary-green hover:bg-primary-green-light transition-all duration-200 font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Profile & Stats
            </Link>
            {isAdmin(user.email || '') && (
              <Link
                href="/admin"
                className="block px-3 py-2 rounded-lg text-primary-orange hover:text-primary-orange-dark hover:bg-primary-orange-light transition-all duration-200 font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Admin
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

// Get display name for user (handles both GitHub and email users)
function getDisplayName(user: SupabaseUser): string {
  // For GitHub users, prefer full_name, then user_name, then name
  if (user.user_metadata?.full_name) {
    return user.user_metadata.full_name
  }
  if (user.user_metadata?.user_name) {
    return user.user_metadata.user_name
  }
  if (user.user_metadata?.name) {
    return user.user_metadata.name
  }

  // For email users, use the part before @
  if (user.email) {
    return user.email.split('@')[0]
  }

  return 'User'
}

// Get display subtext (handles both GitHub and email users)
function getDisplaySubtext(user: SupabaseUser): string {
  // Check if user logged in via GitHub (has user_metadata with GitHub-specific fields)
  const isGitHubUser = user.user_metadata?.user_name || user.user_metadata?.avatar_url

  if (isGitHubUser) {
    // For GitHub users, show @username if available
    if (user.user_metadata?.user_name) {
      return `@${user.user_metadata.user_name}`
    }
    return 'GitHub User'
  }

  // For email users, show domain
  if (user.email) {
    return user.email.split('@')[1]
  }

  return ''
}

// Get dropdown subtext (different from header subtext)
function getDropdownSubtext(user: SupabaseUser): string {
  // Check if user logged in via GitHub
  const isGitHubUser = user.user_metadata?.user_name || user.user_metadata?.avatar_url

  if (isGitHubUser) {
    // For GitHub users, show email if available, otherwise show GitHub
    return user.email || 'GitHub User'
  }

  // For email users, show full email
  return user.email || ''
}

// Get user initials for avatar (handles both GitHub and email users)
function getUserInitials(user: SupabaseUser): string {
  // Try to get initials from full name first
  if (user.user_metadata?.full_name) {
    const names = user.user_metadata.full_name.split(' ')
    if (names.length >= 2) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase()
    }
    return names[0].slice(0, 2).toUpperCase()
  }

  // Try username
  if (user.user_metadata?.user_name) {
    return user.user_metadata.user_name.slice(0, 2).toUpperCase()
  }

  // Fall back to email
  if (user.email) {
    return user.email.split('@')[0].slice(0, 2).toUpperCase()
  }

  return 'U'
}