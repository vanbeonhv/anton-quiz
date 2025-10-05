import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET /api/questions/[id] - Get single question for display
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
        questionAttempts: {
          where: { userId: user.id },
          orderBy: { answeredAt: 'desc' },
          take: 1
        }
      }
    })

    if (!question) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      )
    }

    // Transform the data
    const transformedQuestion = {
      id: question.id,
      number: question.number,
      text: question.text,
      optionA: question.optionA,
      optionB: question.optionB,
      optionC: question.optionC,
      optionD: question.optionD,
      difficulty: question.difficulty,
      explanation: question.explanation,
      createdAt: question.createdAt,
      updatedAt: question.updatedAt,
      tags: question.tags.map(qt => qt.tag),
      userAttempt: question.questionAttempts[0] || null,
      // Add computed fields for UI
      isSolved: question.questionAttempts.length > 0 && question.questionAttempts[0].isCorrect,
      hasAttempted: question.questionAttempts.length > 0
    }

    return NextResponse.json(transformedQuestion)
  } catch (error) {
    console.error('Failed to fetch question:', error)
    return NextResponse.json(
      { error: 'Failed to fetch question' },
      { status: 500 }
    )
  }
}