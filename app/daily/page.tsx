'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { LoadingState } from '@/components/shared/LoadingState'
import { EmptyState } from '@/components/shared/EmptyState'
import { DailyQuestionInfo } from '@/types'

export default function DailyQuestionPage() {
    const router = useRouter()

    // Fetch daily question info to get the current question ID
    const { data, isLoading, error } = useQuery<DailyQuestionInfo>({
        queryKey: ['daily-question'],
        queryFn: async () => {
            const res = await fetch('/api/daily-question')
            if (!res.ok) {
                const errorData = await res.json()
                throw new Error(errorData.error || 'Failed to fetch daily question')
            }
            return res.json()
        },
        staleTime: 60 * 1000, // 1 minute
    })

    // Redirect to the actual question page once we have the data
    useEffect(() => {
        if (data?.id) {
            router.replace(`/questions/${data.id}?type=daily`)
        }
    }, [data?.id, router])

    if (isLoading) {
        return (
            <div className="min-h-screen bg-bg-peach">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <LoadingState message="Loading today's daily question..." />
                </div>
            </div>
        )
    }

    if (error || !data) {
        const errorMessage = error instanceof Error
            ? error.message
            : 'Failed to load daily question'

        return (
            <div className="min-h-screen bg-bg-peach">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <EmptyState
                        title="Daily Question Unavailable"
                        description={errorMessage}
                        actionLabel="Back to Dashboard"
                        onAction={() => router.push('/dashboard')}
                    />
                </div>
            </div>
        )
    }

    // This should not render as we redirect in useEffect, but just in case
    return (
        <div className="min-h-screen bg-bg-peach">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <LoadingState message="Redirecting to daily question..." />
            </div>
        </div>
    )
}