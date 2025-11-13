import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/db'
import { withMetrics } from '@/lib/withMetrics'
import { cache, getCacheKey } from '@/lib/cache'

export const dynamic = 'force-dynamic'

// GET /api/questions/[id] - Get single question for display
export const GET = withMetrics(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  const cacheKey = getCacheKey(request)

  try {
    const cachedData = cache.get(cacheKey)
    if (cachedData) {
      return NextResponse.json(cachedData)
    }

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const questionId = params.id

    const question = await prisma.question.findUnique({
      where: { 
        id: questionId,
        isActive: true
      },
      include: {
        tags: {
          include: {
            tag: true
          }
        },
        ...(user && {
          questionAttempts: {
            where: { userId: user.id },
            orderBy: { answeredAt: 'desc' },
            take: 1
          }
        })
      }
    })

    if (!question) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      )
    }

    // Transform the data
    // Note: correctAnswer and explanation are NOT included for unauthenticated users
    // They are only revealed after submission via the attempt API
    const transformedQuestion = {
      id: question.id,
      number: question.number,
      text: question.text,
      optionA: question.optionA,
      optionB: question.optionB,
      optionC: question.optionC,
      optionD: question.optionD,
      difficulty: question.difficulty,
      // Only include explanation if user has attempted the question
      ...(user && question.questionAttempts?.[0] && {
        explanation: question.explanation
      }),
      createdAt: question.createdAt,
      updatedAt: question.updatedAt,
      tags: question.tags.map(qt => qt.tag),
      userAttempt: user && question.questionAttempts?.[0] ? question.questionAttempts[0] : null,
      // Add computed fields for UI (only if authenticated)
      isSolved: user && question.questionAttempts?.length > 0 && question.questionAttempts[0].isCorrect,
      hasAttempted: user && question.questionAttempts?.length > 0
    }

    cache.set(cacheKey, transformedQuestion)

    return NextResponse.json(transformedQuestion)
  } catch (error) {
    console.error('Failed to fetch question:', error)
    return NextResponse.json(
      { error: 'Failed to fetch question' },
      { status: 500 }
    )
  }
}, '/api/questions/[id]')