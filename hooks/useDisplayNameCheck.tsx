import { useAuth } from '@/hooks/useAuth'
import type { User as SupabaseUser } from '@supabase/supabase-js'

interface UseDisplayNameCheckReturn {
  needsDisplayName: boolean
  isLoading: boolean
  user: SupabaseUser | null
}

/**
 * Helper function to check if a user has a display name set
 * Checks all possible display name fields in user metadata
 */
function hasDisplayName(user: SupabaseUser): boolean {
  const metadata = user.user_metadata
  
  // Check all possible display name fields
  const fullName = metadata?.full_name
  const preferredUsername = metadata?.preferred_username
  const userName = metadata?.user_name
  
  // Return true if any field has a non-empty value
  return !!(
    (fullName && fullName.trim()) ||
    (preferredUsername && preferredUsername.trim()) ||
    (userName && userName.trim())
  )
}

/**
 * Hook to check if the current user needs to set a display name
 * Returns needsDisplayName flag, loading state, and user object
 */
export function useDisplayNameCheck(): UseDisplayNameCheckReturn {
  const { user, isLoading } = useAuth()

  const needsDisplayName = user ? !hasDisplayName(user) : false

  return {
    needsDisplayName,
    isLoading,
    user: user ?? null
  }
}
