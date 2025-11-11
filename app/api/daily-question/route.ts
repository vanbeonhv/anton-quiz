import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getDailyQuestion, hasAttemptedDailyQuestion } from '@/lib/utils/dailyQuestion'
import { withMetrics } from '@/lib/withMetrics'

export const dynamic = 'force-dynamic'

export const GET = withMetrics(async (request: NextRequest) => {
  try {
    // Authenticate user
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get today's daily question
    const dailyQuestionResult = await getDailyQuestion()

    // Check if daily question could not be determined
    if (!dailyQuestionResult.questionId || !dailyQuestionResult.question) {
      return NextResponse.json(
        { error: 'Today\'s daily question is not available' },
        { status: 404 }
      )
    }

    // Check if user has already attempted today's daily question
    const hasAttempted = await hasAttemptedDailyQuestion(
      user.id,
      dailyQuestionResult.questionId
    )

    // Check if the attempt was correct (completed)
    let isCompleted = false
    if (hasAttempted) {
      const { prisma } = await import('@/lib/db')
      const dayjs = (await import('@/lib/dayjs')).default
      const { DAILY_QUESTION_CONFIG } = await import('@/lib/utils/dailyQuestion')

      // Get start of today in GMT+7
      const todayStart = dayjs()
        .tz(DAILY_QUESTION_CONFIG.timezone)
        .startOf('day')
        .toDate()

      // Get end of today in GMT+7
      const todayEnd = dayjs()
        .tz(DAILY_QUESTION_CONFIG.timezone)
        .endOf('day')
        .toDate()

      const attempt = await prisma.questionAttempt.findFirst({
        where: {
          userId: user.id,
          questionId: dailyQuestionResult.questionId,
          answeredAt: {
            gte: todayStart,
            lte: todayEnd,
          },
        },
      })

      isCompleted = attempt?.isCorrect || false
    }

    // Return daily question metadata
    const response = {
      id: dailyQuestionResult.questionId,
      number: dailyQuestionResult.questionNumber,
      difficulty: dailyQuestionResult.question.difficulty,
      resetTime: dailyQuestionResult.resetTime.toISOString(),
      timeUntilReset: dailyQuestionResult.timeUntilReset,
      hasAttempted,
      isCompleted,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Failed to fetch daily question:', error)
    return NextResponse.json(
      { error: 'Failed to fetch daily question' },
      { status: 500 }
    )
  }
})
