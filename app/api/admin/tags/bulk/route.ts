import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/utils/admin'
import { withMetrics } from '@/lib/withMetrics'

interface BulkTagAssignmentData {
  questionIds: string[]
  tagIds: string[]
  action: 'add' | 'remove' | 'replace'
}

// POST /api/admin/tags/bulk - Bulk tag operations
export const POST = withMetrics(async (request: NextRequest) => {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    requireAdmin(user.email)

    const body: BulkTagAssignmentData = await request.json()
    
    // Validate required fields
    if (!body.questionIds || !Array.isArray(body.questionIds) || body.questionIds.length === 0) {
      return NextResponse.json({ error: 'Question IDs are required' }, { status: 400 })
    }

    if (!body.tagIds || !Array.isArray(body.tagIds) || body.tagIds.length === 0) {
      return NextResponse.json({ error: 'Tag IDs are required' }, { status: 400 })
    }

    if (!['add', 'remove', 'replace'].includes(body.action)) {
      return NextResponse.json({ error: 'Invalid action. Must be add, remove, or replace' }, { status: 400 })
    }

    // Verify all questions exist
    const questions = await prisma.question.findMany({
      where: { id: { in: body.questionIds } }
    })

    if (questions.length !== body.questionIds.length) {
      return NextResponse.json({ error: 'Some questions not found' }, { status: 404 })
    }

    // Verify all tags exist
    const tags = await prisma.tag.findMany({
      where: { id: { in: body.tagIds } }
    })

    if (tags.length !== body.tagIds.length) {
      return NextResponse.json({ error: 'Some tags not found' }, { status: 404 })
    }

    let result: Record<string, any> = {}

    if (body.action === 'replace') {
      // Remove all existing tags for these questions, then add new ones
      await prisma.questionTag.deleteMany({
        where: { questionId: { in: body.questionIds } }
      })

      const questionTagData = body.questionIds.flatMap(questionId =>
        body.tagIds.map(tagId => ({ questionId, tagId }))
      )

      const created = await prisma.questionTag.createMany({
        data: questionTagData,
        skipDuplicates: true
      })

      result = { action: 'replace', created: created.count }
    } else if (body.action === 'add') {
      // Add tags to questions (skip duplicates)
      const questionTagData = body.questionIds.flatMap(questionId =>
        body.tagIds.map(tagId => ({ questionId, tagId }))
      )

      const created = await prisma.questionTag.createMany({
        data: questionTagData,
        skipDuplicates: true
      })

      result = { action: 'add', created: created.count }
    } else if (body.action === 'remove') {
      // Remove specific tags from questions
      const deleted = await prisma.questionTag.deleteMany({
        where: {
          questionId: { in: body.questionIds },
          tagId: { in: body.tagIds }
        }
      })

      result = { action: 'remove', deleted: deleted.count }
    }

    return NextResponse.json({
      message: 'Bulk tag operation completed successfully',
      ...result
    })
  } catch (error) {
    console.error('Error in bulk tag operation:', error)
    if (error instanceof Error && error.message === 'Admin access required') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }
    return NextResponse.json({ error: 'Failed to perform bulk tag operation' }, { status: 500 })
  }
})