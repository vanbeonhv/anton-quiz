import { useAuth } from './useAuth'
import { useUserStats } from '@/lib/queries'

/**
 * Combined hook that provides auth state and user stats
 * Only fetches stats when user is authenticated
 */
export function useAuthWithStats() {
  const auth = useAuth()
  
  // Only fetch user stats when authenticated
  const userStats = useUserStats()
  
  return {
    ...auth,
    userStats: auth.isAuthenticated ? userStats : { data: null, isLoading: false, error: null }
  }
}