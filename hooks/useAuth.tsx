import { useQuery, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import { useEffect } from 'react'

const supabase = createClient()

export function useAuth() {
    const queryClient = useQueryClient()

    // Query for getting current user
    const {
        data: user,
        isLoading,
        error
    } = useQuery({
        queryKey: ['auth', 'user'],
        queryFn: async (): Promise<SupabaseUser | null> => {
            const { data: { user }, error } = await supabase.auth.getUser()
            if (error) throw error
            return user
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 1,
    })

    // Listen for auth state changes and update query cache
    useEffect(() => {
        let lastUserId: string | null = null

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
                const currentUserId = session?.user?.id || null

                // Update the query cache with new user data
                queryClient.setQueryData(['auth', 'user'], session?.user ?? null)

                // Only invalidate queries when user actually changes (not just auth state refresh)
                if (event === 'SIGNED_OUT' || (event === 'SIGNED_IN' && currentUserId !== lastUserId)) {
                    queryClient.invalidateQueries({
                        queryKey: ['user-stats'],
                        exact: false
                    })
                    lastUserId = currentUserId
                }
            }
        )

        return () => subscription.unsubscribe()
    }, [queryClient])

    // Logout function
    const logout = async () => {
        await supabase.auth.signOut()
        // Clear all queries on logout
        queryClient.clear()
        window.location.href = '/login'
    }

    const isAuthenticated = !!user

    return {
        user,
        isLoading,
        error,
        logout,
        isAuthenticated
    }
}