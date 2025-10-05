import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/db'
import { QuestionsApiResponse, parseQuestionsSearchParams } from '@/types/api'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)

    // Parse and validate query parameters
    const {
      tags,
      difficulty,
      status,
      search,
      page,
      pageSize,
      sortBy,
      sortOrder
    } = parseQuestionsSearchParams(searchParams)

    // Calculate pagination
    const skip = (page - 1) * pageSize

    // Build where clause
    let whereClause: any = {
      isActive: true
    }

    // Filter by difficulty
    if (difficulty.length > 0) {
      whereClause.difficulty = { in: difficulty }
    }

    // Filter by tags
    if (tags.length > 0) {
      whereClause.tags = {
        some: {
          tag: {
            name: { in: tags }
          }
        }
      }
    }

    // Search in question text
    if (search) {
      whereClause.text = {
        contains: search,
        mode: 'insensitive'
      }
    }

    // Get user's question attempts for status filtering
    let userAttemptedQuestionIds: string[] = []
    if (status !== 'all') {
      const userAttempts = await prisma.questionAttempt.findMany({
        where: {
          userId: user.id,
          isCorrect: true
        },
        select: { questionId: true },
        distinct: ['questionId']
      })
      userAttemptedQuestionIds = userAttempts.map(attempt => attempt.questionId)
    }

    // Apply status filter
    if (status === 'solved') {
      whereClause.id = { in: userAttemptedQuestionIds }
    } else if (status === 'unsolved') {
      whereClause.id = { notIn: userAttemptedQuestionIds }
    }

    // Build order by clause
    let orderBy: any = {}
    switch (sortBy) {
      case 'difficulty':
        orderBy = { difficulty: sortOrder }
        break
      case 'number':
        orderBy = { number: sortOrder }
        break
      case 'newest':
      default:
        orderBy = { createdAt: sortOrder }
        break
    }

    // Get questions with pagination
    const [questions, totalCount] = await Promise.all([
      prisma.question.findMany({
        where: whereClause,
        include: {
          tags: {
            include: {
              tag: true
            }
          },
          questionAttempts: {
            where: { userId: user.id },
            orderBy: { answeredAt: 'desc' },
            take: 1
          }
        },
        orderBy,
        skip,
        take: pageSize
      }),
      prisma.question.count({ where: whereClause })
    ])

    // Transform the data to match our interface
    const transformedQuestions = questions.map(question => ({
      id: question.id,
      number: question.number,
      text: question.text,
      optionA: question.optionA,
      optionB: question.optionB,
      optionC: question.optionC,
      optionD: question.optionD,
      difficulty: question.difficulty,
      isActive: question.isActive,
      createdAt: question.createdAt,
      updatedAt: question.updatedAt,
      tags: question.tags.map(qt => qt.tag),
      userAttempt: question.questionAttempts[0] || null,
      // Add computed fields for UI
      isSolved: question.questionAttempts.length > 0 && question.questionAttempts[0].isCorrect,
      hasAttempted: question.questionAttempts.length > 0
    }))

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / pageSize)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    const response: QuestionsApiResponse = {
      questions: transformedQuestions,
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages,
        hasNextPage,
        hasPrevPage
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Failed to fetch questions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch questions' },
      { status: 500 }
    )
  }
}