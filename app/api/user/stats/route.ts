import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get user's total score (exp points)
        const userAttempts = await prisma.quizAttempt.findMany({
            where: { userId: user.id },
            select: { score: true }
        })

        const expPoints = userAttempts.reduce((total: number, attempt) => total + attempt.score, 0)

        // Get user's ranking
        const allUsersScores = await prisma.quizAttempt.groupBy({
            by: ['userId'],
            _sum: {
                score: true
            },
            orderBy: {
                _sum: {
                    score: 'desc'
                }
            }
        })

        const userRank = allUsersScores.findIndex((userScore) => userScore.userId === user.id) + 1
        const ranking = userRank === 0 ? allUsersScores.length + 1 : userRank

        return NextResponse.json({
            expPoints,
            ranking,
            totalUsers: allUsersScores.length
        })
    } catch (error) {
        console.error('Failed to fetch user stats:', error)
        return NextResponse.json(
            { error: 'Failed to fetch user stats' },
            { status: 500 }
        )
    }
}