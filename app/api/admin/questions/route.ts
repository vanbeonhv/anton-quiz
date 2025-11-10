import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/utils/admin'
import { Difficulty, OptionKey } from '@/types'

interface CreateQuestionData {
  text: string
  optionA: string
  optionB: string
  optionC: string
  optionD: string
  correctAnswer: OptionKey
  explanation?: string
  difficulty: Difficulty
  tagIds?: string[]
}

// GET /api/admin/questions - Get all questions with tags and stats
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    requireAdmin(user.email)

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')
    const search = searchParams.get('search') || ''
    const difficulty = searchParams.get('difficulty') as Difficulty | null
    const tagId = searchParams.get('tagId') || ''

    const skip = (page - 1) * pageSize

    // Build where clause
    const where: Record<string, any> = {}
    
    if (search) {
      const searchNumber = parseInt(search)
      if (!isNaN(searchNumber)) {
        where.number = searchNumber
      }
    }

    if (difficulty) {
      where.difficulty = difficulty
    }

    if (tagId) {
      where.tags = {
        some: {
          tagId: tagId
        }
      }
    }

    const [questions, total] = await Promise.all([
      prisma.question.findMany({
        where,
        include: {
          tags: {
            include: {
              tag: true
            }
          },
          _count: {
            select: {
              questionAttempts: true
            }
          }
        },
        orderBy: {
          number: 'desc'
        },
        skip,
        take: pageSize
      }),
      prisma.question.count({ where })
    ])

    const questionsWithTags = questions.map(question => ({
      ...question,
      tags: question.tags.map(qt => qt.tag),
      attemptCount: question._count.questionAttempts
    }))

    return NextResponse.json({
      data: questionsWithTags,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
        hasNext: page * pageSize < total,
        hasPrev: page > 1
      }
    })
  } catch (error) {
    console.error('Error fetching questions:', error)
    if (error instanceof Error && error.message === 'Admin access required') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }
    return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 })
  }
}

// POST /api/admin/questions - Create new question
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    requireAdmin(user.email)

    const body: CreateQuestionData = await request.json()
    
    // Validate required fields
    if (!body.text || body.text.trim() === '') {
      return NextResponse.json({ error: 'Question text is required' }, { status: 400 })
    }

    if (!body.optionA || !body.optionB || !body.optionC || !body.optionD) {
      return NextResponse.json({ error: 'All answer options are required' }, { status: 400 })
    }

    if (!['A', 'B', 'C', 'D'].includes(body.correctAnswer)) {
      return NextResponse.json({ error: 'Correct answer must be A, B, C, or D' }, { status: 400 })
    }

    if (!['EASY', 'MEDIUM', 'HARD'].includes(body.difficulty)) {
      return NextResponse.json({ error: 'Difficulty must be EASY, MEDIUM, or HARD' }, { status: 400 })
    }



    // Verify tags exist if provided
    if (body.tagIds && body.tagIds.length > 0) {
      const tags = await prisma.tag.findMany({
        where: { id: { in: body.tagIds } }
      })
      if (tags.length !== body.tagIds.length) {
        return NextResponse.json({ error: 'Some tags not found' }, { status: 404 })
      }
    }

    // Create question
    const question = await prisma.question.create({
      data: {
        text: body.text.trim(),
        optionA: body.optionA.trim(),
        optionB: body.optionB.trim(),
        optionC: body.optionC.trim(),
        optionD: body.optionD.trim(),
        correctAnswer: body.correctAnswer,
        explanation: body.explanation?.trim() || null,
        difficulty: body.difficulty
      }
    })

    // Add tags if provided
    if (body.tagIds && body.tagIds.length > 0) {
      await prisma.questionTag.createMany({
        data: body.tagIds.map(tagId => ({
          questionId: question.id,
          tagId
        }))
      })
    }

    // Fetch the created question with tags
    const questionWithTags = await prisma.question.findUnique({
      where: { id: question.id },
      include: {
        tags: {
          include: {
            tag: true
          }
        }
      }
    })

    const result = {
      ...questionWithTags,
      tags: questionWithTags?.tags.map(qt => qt.tag) || []
    }

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Error creating question:', error)
    if (error instanceof Error && error.message === 'Admin access required') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }
    return NextResponse.json({ error: 'Failed to create question' }, { status: 500 })
  }
}