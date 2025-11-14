import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// Fallback values if database queries fail
const FALLBACK_STATS = {
  totalQuestions: 500,
  totalUsers: 1200,
  questionsAnsweredToday: 350
}

// Cache duration: 5 minutes
const CACHE_DURATION = 5 * 60 * 1000

// In-memory cache
let cachedStats: {
  data: typeof FALLBACK_STATS
  timestamp: number
} | null = null

export async function GET() {
  try {
    // Check if we have valid cached data
    const now = Date.now()
    if (cachedStats && (now - cachedStats.timestamp) < CACHE_DURATION) {
      return NextResponse.json(cachedStats.data, {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
        }
      })
    }

    // Query database for statistics
    const [totalQuestions, totalUsers, questionsAnsweredToday] = await Promise.all([
      // Count total active questions
      prisma.question.count({
        where: {
          isActive: true
        }
      }),
      
      // Count total users (unique user IDs from UserStats)
      prisma.userStats.count(),
      
      // Count questions answered today
      prisma.questionAttempt.count({
        where: {
          answeredAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      })
    ])

    const stats = {
      totalQuestions,
      totalUsers,
      questionsAnsweredToday
    }

    // Update cache
    cachedStats = {
      data: stats,
      timestamp: now
    }

    return NextResponse.json(stats, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
      }
    })
  } catch (error) {
    // Log error in development mode only
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching statistics:', error)
    }

    // Return fallback values on error
    return NextResponse.json(FALLBACK_STATS, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120'
      }
    })
  }
}
