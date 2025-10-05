import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/db'
import { Difficulty } from '@/types'

export const dynamic = 'force-dynamic'

// GET /api/tags/[id]/questions - Get questions by tag with filtering and pagination
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const tagId = params.id
    const { searchParams } = new URL(request.url)
    
    // Parse query parameters
    const difficulty = searchParams.get('difficulty')?.split(',').filter(Boolean) as Difficulty[] || []
    const status = searchParams.get('status') || 'all' // 'all' | 'solved' | 'unsolved'
    const search = searchParams.get('search') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const sortBy = searchParams.get('sortBy') || 'newest' // 'newest' | 'difficulty' | 'number'
    const sortOrder = searchParams.get('sortOrder') || 'desc' // 'asc' | 'desc'

    // Verify tag exists
    const tag = await prisma.tag.findUnique({
      where: { id: tagId }
    })

    if (!tag) {
      return NextResponse.json(
        { error: 'Tag not found' },
        { status: 404 }
      )
    }

    // Calculate pagination
    const skip = (page - 1) * limit

    // Build where clause
    let whereClause: any = {
      isActive: true,
      tags: {
        some: {
          tagId: tagId
        }
      }
    }

    // Filter by difficulty
    if (difficulty.length > 0) {
      whereClause.difficulty = { in: difficulty }
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
          isCorrect: true,
          question: {
            tags: {
              some: {
                tagId: tagId
              }
            }
          }
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
        take: limit
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
    const totalPages = Math.ceil(totalCount / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    // Get tag statistics for this user
    const tagQuestions = await prisma.question.findMany({
      where: {
        isActive: true,
        tags: {
          some: {
            tagId: tagId
          }
        }
      },
      select: { id: true }
    })

    const tagQuestionIds = tagQuestions.map(q => q.id)

    const userCorrectAttempts = await prisma.questionAttempt.findMany({
      where: {
        userId: user.id,
        questionId: { in: tagQuestionIds },
        isCorrect: true
      },
      select: { questionId: true },
      distinct: ['questionId']
    })

    const userTotalAttempts = await prisma.questionAttempt.findMany({
      where: {
        userId: user.id,
        questionId: { in: tagQuestionIds }
      },
      select: { questionId: true },
      distinct: ['questionId']
    })

    const tagStats = {
      totalQuestions: tagQuestionIds.length,
      answeredQuestions: userCorrectAttempts.length,
      totalAttempted: userTotalAttempts.length,
      accuracyPercentage: userTotalAttempts.length > 0 
        ? Math.round((userCorrectAttempts.length / userTotalAttempts.length) * 100) 
        : 0,
      progressPercentage: tagQuestionIds.length > 0 
        ? Math.round((userCorrectAttempts.length / tagQuestionIds.length) * 100) 
        : 0
    }

    return NextResponse.json({
      tag: {
        id: tag.id,
        name: tag.name,
        description: tag.description,
        createdAt: tag.createdAt,
        updatedAt: tag.updatedAt
      },
      questions: transformedQuestions,
      tagStats,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage,
        hasPrevPage
      }
    })
  } catch (error) {
    console.error('Failed to fetch questions by tag:', error)
    return NextResponse.json(
      { error: 'Failed to fetch questions by tag' },
      { status: 500 }
    )
  }
}