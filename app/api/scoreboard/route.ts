import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const filter = searchParams.get('filter') || 'all-time'
    const limit = parseInt(searchParams.get('limit') || '100')

    let whereClause = {}

    // Filter by time period
    if (filter === 'this-week') {
      const now = new Date()
      // Get Monday of current week at 00:00 Vietnam time
      const vietnamTime = new Date(now.toLocaleString('en-US', { 
        timeZone: 'Asia/Ho_Chi_Minh' 
      }))
      const weekStart = new Date(vietnamTime)
      weekStart.setDate(vietnamTime.getDate() - vietnamTime.getDay() + 1)
      weekStart.setHours(0, 0, 0, 0)
      
      whereClause = {
        completedAt: { gte: weekStart }
      }
    }

    const attempts = await prisma.quizAttempt.findMany({
      where: whereClause,
      take: limit,
      orderBy: [
        { score: 'desc' },
        { completedAt: 'asc' } // Earlier completion time wins ties
      ],
      include: {
        quiz: {
          select: { title: true }
        }
      }
    })

    // Add rank to each entry
    const leaderboard = attempts.map((attempt, index: number) => ({
      rank: index + 1,
      attemptId: attempt.id,
      userId: attempt.userId,
      userEmail: attempt.userEmail,
      quizTitle: attempt.quiz.title,
      score: attempt.score,
      totalQuestions: attempt.totalQuestions,
      percentage: Math.round((attempt.score / attempt.totalQuestions) * 100),
      completedAt: attempt.completedAt
    }))

    return NextResponse.json(leaderboard)
  } catch (error) {
    console.error('Failed to fetch scoreboard:', error)
    return NextResponse.json(
      { error: 'Failed to fetch scoreboard' },
      { status: 500 }
    )
  }
}