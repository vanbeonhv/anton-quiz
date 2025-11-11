import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import dayjs from '@/lib/dayjs'
import { createClient } from '@/lib/supabase/server'
import { filterEmailPrivacy } from '@/lib/utils/privacy'
import { withMetrics } from '@/lib/withMetrics'

export const dynamic = 'force-dynamic'

export const GET = withMetrics(async (request: NextRequest) => {
  try {
    // Get current user from Supabase auth
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

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
        { totalDailyPoints: 'desc' },
        { updatedAt: 'asc' } // Earlier update time wins ties
      ]
    })

    // Fetch avatar URLs and display names from Supabase Auth using raw SQL query
    const avatarMap = new Map<string, { avatarUrl: string | null; displayName: string | null }>()

    const userIds = userStats.map(stats => stats.userId)

    if (userIds.length > 0) {
      try {
        // Query auth.users table directly via Prisma raw SQL with parameterized query
        const authUsers = await prisma.$queryRaw<Array<{ id: string; raw_user_meta_data: any }>>`
          SELECT id, raw_user_meta_data 
          FROM auth.users 
          WHERE id = ANY(${userIds}::uuid[])
        `

        authUsers.forEach((user) => {
          const avatarUrl = user.raw_user_meta_data?.avatar_url || null
          // Priority: full_name > preferred_username > user_name
          const displayName = user.raw_user_meta_data?.full_name || 
                            user.raw_user_meta_data?.preferred_username || 
                            user.raw_user_meta_data?.user_name || 
                            null
          avatarMap.set(user.id, { avatarUrl, displayName })
        })
      } catch (error) {
        // If we can't fetch user metadata, just continue with null values
        console.warn('Failed to fetch user metadata:', error)
      }
    }

    const leaderboard = userStats.map((stats, index) => {
      const userMetadata = avatarMap.get(stats.userId)
      return {
        rank: index + 1,
        userId: stats.userId,
        userEmail: stats.userEmail,
        avatarUrl: userMetadata?.avatarUrl || null,
        displayName: userMetadata?.displayName || null,
        totalDailyPoints: stats.totalDailyPoints,
        dailyQuizStreak: stats.currentStreak,
        currentLevel: stats.currentLevel,
        currentTitle: stats.currentTitle,
        totalXp: stats.totalXp,
        updatedAt: stats.updatedAt
      }
    })

    // Apply privacy filter before returning response
    const filteredLeaderboard = filterEmailPrivacy(leaderboard, {
      currentUserId: user?.id,
      preserveEmailForCurrentUser: true
    })

    return NextResponse.json(filteredLeaderboard)
  } catch (error) {
    console.error('Failed to fetch daily points leaderboard:', error)
    return NextResponse.json(
      { error: 'Failed to fetch daily points leaderboard' },
      { status: 500 }
    )
  }
})