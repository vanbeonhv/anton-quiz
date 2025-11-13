'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { User, LogOut, Settings, ChevronDown, Menu, X, Star, BarChart3 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { isAdmin } from '@/lib/utils/admin'
import { LevelBadge } from '@/components/shared/LevelBadge'
import { useUserLevelSafe } from '@/components/providers/UserLevelProvider'
import type { User as SupabaseUser } from '@supabase/supabase-js'

const MONITORING_URL = 'https://monitoring-quiz.huuvan.dev/public-dashboards/2035ffafbf4741e584b40584a924a3c1?from=now-6h&to=now&timezone=browser&refresh=5s'

export function Header() {
  const { user, isLoading: loading, logout } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  // Use context for user level information
  const userLevelContext = useUserLevelSafe()
  const userStats = userLevelContext?.userStats

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  // Helper function to determine if a navigation item is active
  const isActiveRoute = (route: string) => {
    if (route === '/dashboard') {
      return pathname === '/dashboard' || pathname === '/'
    }
    return pathname.startsWith(route)
  }

  // Helper function to get navigation link classes
  const getNavLinkClasses = (route: string, isMobile = false) => {
    const baseClasses = "px-3 py-2 rounded-lg font-medium transition-all duration-200 relative"
    const isActive = isActiveRoute(route)

    if (isActive) {
      const borderClass = isMobile ? 'border-l-4 border-primary-green' : 'border-b-2 border-primary-green'
      return `${baseClasses} text-primary-green bg-primary-green-light shadow-sm ${borderClass}`
    }

    return `${baseClasses} text-text-primary hover:text-primary-green hover:bg-primary-green-light hover:shadow-md hover:scale-105`
  }

  return (
    <header className="sticky top-0 z-50 bg-bg-white/95 backdrop-blur-sm border-b border-bg-peach shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            href={user ? "/dashboard" : "/"}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity duration-200"
          >
            <div className="relative">
              <Image
                src="/logo.svg"
                alt="Anton Questions Logo"
                width={40}
                height={40}
                className="w-10 h-10 drop-shadow-sm"
              />
            </div>
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">
              Anton Questions
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
                    className={getNavLinkClasses('/dashboard')}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/questions"
                    className={getNavLinkClasses('/questions')}
                  >
                    Questions
                  </Link>
                  <Link
                    href="/scoreboard"
                    className={getNavLinkClasses('/scoreboard')}
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

                {/* Monitoring Link */}
                <a
                  href={MONITORING_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 hover:shadow-sm hover:scale-105"
                >
                  <BarChart3 className="w-4 h-4" />
                  <span className="hidden sm:inline">Monitoring</span>
                </a>

                {/* Admin Link (if admin) */}
                {isAdmin(user.email || '') && (
                  <Link
                    href="/admin"
                    className={`${isActiveRoute('/admin')
                      ? 'px-3 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 text-primary-orange bg-primary-orange-light shadow-sm border-b-2 border-primary-orange'
                      : 'px-3 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 text-primary-orange hover:text-primary-orange-dark hover:bg-primary-orange-light hover:shadow-sm hover:scale-105'
                      }`}
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
                        {userStats ? (
                          <div className="flex items-center gap-1 text-xs text-text-muted">
                            <Star className="w-3 h-3" />
                            <span>Level {userStats.currentLevel} - {userStats.currentTitle}</span>
                          </div>
                        ) : getDisplaySubtext(user) && (
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
                        {/* Avatar - Clickable */}
                        <Link 
                          href="/profile" 
                          className="flex-shrink-0 hover:opacity-80 transition-opacity"
                        >
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
                        </Link>

                        <div className="flex-1 min-w-0">
                          {/* Display Name - Clickable */}
                          <Link 
                            href="/profile"
                            className="block hover:opacity-80 transition-opacity hover:underline"
                          >
                            <p className="text-sm font-semibold text-text-primary truncate">
                              {getDisplayName(user)}
                            </p>
                          </Link>
                          {userStats ? (
                            <div className="space-y-1">
                              <LevelBadge
                                size="sm"
                                showIcon={false}
                              />
                              <p className="text-xs text-text-muted">
                                {userStats.totalXp?.toLocaleString() ?? 0} XP
                              </p>
                            </div>
                          ) : (
                            <p className="text-xs text-text-muted truncate">
                              {getDropdownSubtext(user)}
                            </p>
                          )}
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
              <>
                {/* Main Navigation Links for Unauthenticated Users - Desktop */}
                <div className="hidden md:flex items-center gap-1 mr-2">
                  <Link
                    href="/questions"
                    className={getNavLinkClasses('/questions')}
                  >
                    Questions
                  </Link>
                  <Link
                    href="/scoreboard"
                    className={getNavLinkClasses('/scoreboard')}
                  >
                    Scoreboard
                  </Link>
                </div>

                {/* Mobile Menu Button for Unauthenticated Users */}
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

                {/* Auth Buttons for Unauthenticated Users */}
                <div className="hidden md:flex items-center gap-2">
                  <Button 
                    asChild
                    variant="ghost"
                    className="text-text-primary hover:text-primary-green hover:bg-primary-green-light px-4 py-2 rounded-lg font-medium transition-all duration-200"
                  >
                    <Link href="/login">
                      Log In
                    </Link>
                  </Button>
                  <Button asChild className="bg-primary-green hover:bg-primary-green-dark text-white px-4 py-2 rounded-lg font-medium shadow-sm hover:shadow-md transition-all duration-200">
                    <Link href="/login">
                      Sign Up
                    </Link>
                  </Button>
                </div>

                {/* Mobile Auth Buttons */}
                <div className="md:hidden flex items-center gap-2">
                  <Button asChild className="bg-primary-green hover:bg-primary-green-dark text-white px-4 py-2 rounded-lg font-medium shadow-sm hover:shadow-md transition-all duration-200 text-sm">
                    <Link href="/login">
                      Sign Up
                    </Link>
                  </Button>
                </div>
              </>
            )}
          </nav>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-bg-white border-b border-bg-peach shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-4 space-y-2">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className={`block ${getNavLinkClasses('/dashboard', true)}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  href="/questions"
                  className={`block ${getNavLinkClasses('/questions', true)}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Questions
                </Link>
                <Link
                  href="/scoreboard"
                  className={`block ${getNavLinkClasses('/scoreboard', true)}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Scoreboard
                </Link>
                <Link
                  href="/profile"
                  className={`block ${getNavLinkClasses('/profile', true)}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Profile & Stats
                </Link>
                <a
                  href={MONITORING_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all duration-200 relative text-blue-600 hover:text-blue-700 hover:bg-blue-50 hover:shadow-sm hover:scale-105 border-l-4 border-transparent hover:border-blue-600"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <BarChart3 className="w-4 h-4" />
                  Monitoring
                </a>
                {isAdmin(user.email || '') && (
                  <Link
                    href="/admin"
                    className={`block ${isActiveRoute('/admin')
                      ? 'px-3 py-2 rounded-lg font-medium transition-all duration-200 relative text-primary-orange bg-primary-orange-light shadow-sm border-l-4 border-primary-orange'
                      : 'px-3 py-2 rounded-lg font-medium transition-all duration-200 relative text-primary-orange hover:text-primary-orange-dark hover:bg-primary-orange-light hover:shadow-sm hover:scale-105'
                      }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Admin
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link
                  href="/questions"
                  className={`block ${getNavLinkClasses('/questions', true)}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Questions
                </Link>
                <Link
                  href="/scoreboard"
                  className={`block ${getNavLinkClasses('/scoreboard', true)}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Scoreboard
                </Link>
                <div className="pt-2 border-t border-bg-peach space-y-2">
                  <Link
                    href="/login"
                    className="block px-3 py-2 rounded-lg font-medium transition-all duration-200 text-text-primary hover:text-primary-green hover:bg-primary-green-light border-l-4 border-transparent hover:border-primary-green"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Log In
                  </Link>
                  <Link
                    href="/login"
                    className="block px-3 py-2 rounded-lg font-medium transition-all duration-200 bg-primary-green text-white hover:bg-primary-green-dark shadow-sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

// Get display name for user (handles both GitHub and email users)
function getDisplayName(user: SupabaseUser): string {
  // Priority order: full_name > preferred_username > user_name > name > email
  if (user.user_metadata?.full_name) {
    return user.user_metadata.full_name
  }
  if (user.user_metadata?.preferred_username) {
    return user.user_metadata.preferred_username
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