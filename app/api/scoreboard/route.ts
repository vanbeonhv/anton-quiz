import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import type { ScoreboardType } from '@/types'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = (searchParams.get('type') || 'recent') as ScoreboardType | 'recent'
    const filter = searchParams.get('filter') || 'all-time'
    const limit = parseInt(searchParams.get('limit') || '100')

    // Handle new scoreboard types
    if (type === 'daily-points') {
      return getDailyPointsLeaderboard(filter, limit)
    }
    
    if (type === 'questions-solved') {
      return getQuestionsSolvedLeaderboard(filter, limit)
    }

    // Default behavior for backward compatibility (type === 'recent')
    return getRecentScores(filter, limit)
  } catch (error) {
    console.error('Failed to fetch scoreboard:', error)
    return NextResponse.json(
      { error: 'Failed to fetch scoreboard' },
      { status: 500 }
    )
  }
}

// Original implementation for backward compatibility
async function getRecentScores(filter: string, limit: number) {
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
}

// New daily points leaderboard
async function getDailyPointsLeaderboard(filter: string, limit: number) {
  let whereClause = {}

  // Apply time filtering to UserStats
  if (filter === 'this-week' || filter === 'this-month') {
    const now = new Date()
    let startDate: Date

    if (filter === 'this-week') {
      // Get Monday of current week at 00:00 Vietnam time
      const vietnamTime = new Date(now.toLocaleString('en-US', { 
        timeZone: 'Asia/Ho_Chi_Minh' 
      }))
      startDate = new Date(vietnamTime)
      startDate.setDate(vietnamTime.getDate() - vietnamTime.getDay() + 1)
      startDate.setHours(0, 0, 0, 0)
    } else {
      // First day of current month
      startDate = new Date(now.getFullYear(), now.getMonth(), 1)
    }

    whereClause = {
      updatedAt: { gte: startDate }
    }
  }

  const userStats = await prisma.userStats.findMany({
    where: whereClause,
    take: limit,
    orderBy: [
      { dailyQuizzesTaken: 'desc' },
      { updatedAt: 'asc' } // Earlier update time wins ties
    ]
  })

  const leaderboard = userStats.map((stats, index) => ({
    rank: index + 1,
    userId: stats.userId,
    userEmail: stats.userEmail,
    totalDailyPoints: stats.dailyQuizzesTaken, // Using dailyQuizzesTaken as proxy for daily points
    dailyQuizStreak: stats.currentStreak,
    updatedAt: stats.updatedAt
  }))

  return NextResponse.json(leaderboard)
}

// New questions solved leaderboard
async function getQuestionsSolvedLeaderboard(filter: string, limit: number) {
  let whereClause = {}

  // Apply time filtering to UserStats
  if (filter === 'this-week' || filter === 'this-month') {
    const now = new Date()
    let startDate: Date

    if (filter === 'this-week') {
      // Get Monday of current week at 00:00 Vietnam time
      const vietnamTime = new Date(now.toLocaleString('en-US', { 
        timeZone: 'Asia/Ho_Chi_Minh' 
      }))
      startDate = new Date(vietnamTime)
      startDate.setDate(vietnamTime.getDate() - vietnamTime.getDay() + 1)
      startDate.setHours(0, 0, 0, 0)
    } else {
      // First day of current month
      startDate = new Date(now.getFullYear(), now.getMonth(), 1)
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
}