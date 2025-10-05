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
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
                // Update the query cache with new user data
                queryClient.setQueryData(['auth', 'user'], session?.user ?? null)

                // Invalidate related queries when user changes
                if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
                    queryClient.invalidateQueries({
                        queryKey: ['user-stats'],
                        exact: false
                    })
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

    return {
        user,
        isLoading,
        error,
        logout,
        isAuthenticated: !!user
    }
}