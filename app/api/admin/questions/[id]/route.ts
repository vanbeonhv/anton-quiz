import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/utils/admin'
import { Difficulty, OptionKey } from '@/types'

interface UpdateQuestionData {
  text?: string
  optionA?: string
  optionB?: string
  optionC?: string
  optionD?: string
  correctAnswer?: OptionKey
  explanation?: string
  difficulty?: Difficulty
  quizId?: string | null
  tagIds?: string[]
  isActive?: boolean
}

// GET /api/admin/questions/[id] - Get single question with tags
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    requireAdmin(user.email)

    const question = await prisma.question.findUnique({
      where: { id: params.id },
      include: {
        tags: {
          include: {
            tag: true
          }
        },
        quiz: {
          select: {
            id: true,
            title: true
          }
        },
        _count: {
          select: {
            questionAttempts: true
          }
        }
      }
    })

    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 })
    }

    const result = {
      ...question,
      tags: question.tags.map(qt => qt.tag),
      attemptCount: question._count.questionAttempts
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching question:', error)
    if (error instanceof Error && error.message === 'Admin access required') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }
    return NextResponse.json({ error: 'Failed to fetch question' }, { status: 500 })
  }
}

// PUT /api/admin/questions/[id] - Update question
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    requireAdmin(user.email)

    const body: UpdateQuestionData = await request.json()

    // Check if question exists
    const existingQuestion = await prisma.question.findUnique({
      where: { id: params.id }
    })

    if (!existingQuestion) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 })
    }

    // Validate fields if provided
    if (body.correctAnswer && !['A', 'B', 'C', 'D'].includes(body.correctAnswer)) {
      return NextResponse.json({ error: 'Correct answer must be A, B, C, or D' }, { status: 400 })
    }

    if (body.difficulty && !['EASY', 'MEDIUM', 'HARD'].includes(body.difficulty)) {
      return NextResponse.json({ error: 'Difficulty must be EASY, MEDIUM, or HARD' }, { status: 400 })
    }

    // Verify quiz exists if provided
    if (body.quizId) {
      const quiz = await prisma.quiz.findUnique({
        where: { id: body.quizId }
      })
      if (!quiz) {
        return NextResponse.json({ error: 'Quiz not found' }, { status: 404 })
      }
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

    // Prepare update data
    const updateData: Record<string, any> = {}
    if (body.text !== undefined) updateData.text = body.text.trim()
    if (body.optionA !== undefined) updateData.optionA = body.optionA.trim()
    if (body.optionB !== undefined) updateData.optionB = body.optionB.trim()
    if (body.optionC !== undefined) updateData.optionC = body.optionC.trim()
    if (body.optionD !== undefined) updateData.optionD = body.optionD.trim()
    if (body.correctAnswer !== undefined) updateData.correctAnswer = body.correctAnswer
    if (body.explanation !== undefined) updateData.explanation = body.explanation?.trim() || null
    if (body.difficulty !== undefined) updateData.difficulty = body.difficulty
    if (body.quizId !== undefined) updateData.quizId = body.quizId
    if (body.isActive !== undefined) updateData.isActive = body.isActive

    // Update question
    const updatedQuestion = await prisma.question.update({
      where: { id: params.id },
      data: updateData
    })

    // Update tags if provided
    if (body.tagIds !== undefined) {
      // Remove existing tags
      await prisma.questionTag.deleteMany({
        where: { questionId: params.id }
      })

      // Add new tags
      if (body.tagIds.length > 0) {
        await prisma.questionTag.createMany({
          data: body.tagIds.map(tagId => ({
            questionId: params.id,
            tagId
          }))
        })
      }
    }

    // Fetch updated question with tags
    const questionWithTags = await prisma.question.findUnique({
      where: { id: params.id },
      include: {
        tags: {
          include: {
            tag: true
          }
        },
        quiz: {
          select: {
            id: true,
            title: true
          }
        }
      }
    })

    const result = {
      ...questionWithTags,
      tags: questionWithTags?.tags.map(qt => qt.tag) || []
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error updating question:', error)
    if (error instanceof Error && error.message === 'Admin access required') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }
    return NextResponse.json({ error: 'Failed to update question' }, { status: 500 })
  }
}

// DELETE /api/admin/questions/[id] - Delete question
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    requireAdmin(user.email)

    // Check if question exists
    const existingQuestion = await prisma.question.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            questionAttempts: true,
            answers: true
          }
        }
      }
    })

    if (!existingQuestion) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 })
    }

    // Check if question has attempts (might want to prevent deletion)
    const hasAttempts = existingQuestion._count.questionAttempts > 0 || existingQuestion._count.answers > 0
    
    if (hasAttempts) {
      // Instead of deleting, mark as inactive
      await prisma.question.update({
        where: { id: params.id },
        data: { isActive: false }
      })

      return NextResponse.json({ 
        message: 'Question has been deactivated instead of deleted due to existing attempts' 
      })
    }

    // Safe to delete - no attempts exist
    await prisma.question.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Question deleted successfully' })
  } catch (error) {
    console.error('Error deleting question:', error)
    if (error instanceof Error && error.message === 'Admin access required') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }
    return NextResponse.json({ error: 'Failed to delete question' }, { status: 500 })
  }
}