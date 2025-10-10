import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import dayjs from '@/lib/dayjs'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const filter = searchParams.get('filter') || 'all-time'
    const limit = parseInt(searchParams.get('limit') || '100')

    let whereClause = {}

    // Apply time filtering
    if (filter === 'this-week' || filter === 'this-month') {
      let startDate: Date

      if (filter === 'this-week') {
        // Get Monday of current week at 00:00 Vietnam time
        startDate = dayjs().tz('Asia/Ho_Chi_Minh').startOf('week').add(1, 'day').toDate()
      } else {
        // First day of current month
        startDate = dayjs().tz('Asia/Ho_Chi_Minh').startOf('month').toDate()
      }

      whereClause = {
        updatedAt: { gte: startDate }
      }
    }

    const userStats = await prisma.userStats.findMany({
      where: whereClause,
      take: limit,
      orderBy: [
        { totalCorrectAnswers: 'desc' },
        { updatedAt: 'asc' } // Earlier update time wins ties
      ]
    })

    const leaderboard = userStats.map((stats, index) => ({
      rank: index + 1,
      userId: stats.userId,
      userEmail: stats.userEmail,
      totalCorrectAnswers: stats.totalCorrectAnswers,
      totalQuestionsAnswered: stats.totalQuestionsAnswered,
      accuracyPercentage: stats.totalQuestionsAnswered > 0 
        ? Math.round((stats.totalCorrectAnswers / stats.totalQuestionsAnswered) * 100)
        : 0,
      updatedAt: stats.updatedAt
    }))

    return NextResponse.json(leaderboard)
  } catch (error) {
    console.error('Failed to fetch questions solved leaderboard:', error)
    return NextResponse.json(
      { error: 'Failed to fetch questions solved leaderboard' },
      { status: 500 }
    )
  }
}