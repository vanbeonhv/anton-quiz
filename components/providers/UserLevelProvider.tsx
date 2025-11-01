'use client'

import React, { createContext, useContext, useState, ReactNode, Component, ErrorInfo } from 'react'
import { useUserStats } from '@/lib/queries'
import type { UserStats } from '@/types'

// Define the context type interface
export interface UserLevelContextType {
  userStats: (UserStats & { xpToNextLevel: number }) | null
  isLoading: boolean
  error: Error | null
  openDrawer: () => void
  closeDrawer: () => void
  isDrawerOpen: boolean
}

// Create the context with undefined as default
const UserLevelContext = createContext<UserLevelContextType | undefined>(undefined)

// Provider props interface
interface UserLevelProviderProps {
  children: ReactNode
}

// UserLevelProvider component that wraps useUserStats hook
export function UserLevelProvider({ children }: UserLevelProviderProps) {
  // Drawer state management
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  
  // Integrate with existing useUserStats hook with enhanced error handling
  const { data: userStats, isLoading, error, isError } = useUserStats()
  
  // Drawer control functions with error handling
  const openDrawer = () => {
    try {
      setIsDrawerOpen(true)
    } catch (err) {
      console.error('Error opening user level drawer:', err)
    }
  }
  
  const closeDrawer = () => {
    try {
      setIsDrawerOpen(false)
    } catch (err) {
      console.error('Error closing user level drawer:', err)
    }
  }
  
  // Enhanced error handling - convert query error to Error object if needed
  const processedError = React.useMemo(() => {
    if (!error) return null
    if (error instanceof Error) return error
    return new Error(typeof error === 'string' ? error : 'Failed to load user stats')
  }, [error])
  
  // Context value with proper error handling
  const contextValue: UserLevelContextType = {
    userStats: userStats || null,
    isLoading,
    error: processedError,
    openDrawer,
    closeDrawer,
    isDrawerOpen
  }
  
  // Log errors for debugging (only in development)
  React.useEffect(() => {
    if (isError && processedError && process.env.NODE_ENV === 'development') {
      console.error('UserLevelProvider error:', processedError)
    }
  }, [isError, processedError])
  
  return (
    <UserLevelContext.Provider value={contextValue}>
      {children}
    </UserLevelContext.Provider>
  )
}

// Error boundary component for UserLevel context
interface UserLevelErrorBoundaryState {
  hasError: boolean
  error?: Error
}

class UserLevelErrorBoundary extends Component<
  { children: ReactNode; fallback?: ReactNode },
  UserLevelErrorBoundaryState
> {
  constructor(props: { children: ReactNode; fallback?: ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): UserLevelErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('UserLevel Error Boundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="text-sm text-muted-foreground">
          Unable to load user level data
        </div>
      )
    }

    return this.props.children
  }
}

// Enhanced UserLevelProvider with error boundary wrapper
export function UserLevelProviderWithErrorBoundary({ 
  children, 
  fallback 
}: UserLevelProviderProps & { fallback?: ReactNode }) {
  return (
    <UserLevelErrorBoundary fallback={fallback}>
      <UserLevelProvider>{children}</UserLevelProvider>
    </UserLevelErrorBoundary>
  )
}

// Custom hook to use the UserLevel context
export function useUserLevel(): UserLevelContextType {
  const context = useContext(UserLevelContext)
  if (context === undefined) {
    throw new Error('useUserLevel must be used within a UserLevelProvider')
  }
  return context
}

// Safe hook that returns null if context is not available (for backward compatibility)
export function useUserLevelSafe(): UserLevelContextType | null {
  try {
    const context = useContext(UserLevelContext)
    return context || null
  } catch {
    return null
  }
}