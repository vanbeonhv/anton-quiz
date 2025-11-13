import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/utils/admin'
import { CreateTagData } from '@/types'
import { withMetrics } from '@/lib/withMetrics'

// PUT /api/admin/tags/[id] - Update tag
export const PUT = withMetrics(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    requireAdmin(user.email)

    const body: CreateTagData = await request.json()
    
    // Validate required fields
    if (!body.name || body.name.trim() === '') {
      return NextResponse.json({ error: 'Tag name is required' }, { status: 400 })
    }

    // Check if tag exists
    const existingTag = await prisma.tag.findUnique({
      where: { id: params.id }
    })

    if (!existingTag) {
      return NextResponse.json({ error: 'Tag not found' }, { status: 404 })
    }

    // Check if another tag with the same name exists (excluding current tag)
    const duplicateTag = await prisma.tag.findFirst({
      where: { 
        name: body.name.trim(),
        id: { not: params.id }
      }
    })

    if (duplicateTag) {
      return NextResponse.json({ error: 'Tag name already exists' }, { status: 409 })
    }

    const updatedTag = await prisma.tag.update({
      where: { id: params.id },
      data: {
        name: body.name.trim(),
        description: body.description?.trim() || null
      }
    })

    return NextResponse.json(updatedTag)
  } catch (error) {
    console.error('Error updating tag:', error)
    if (error instanceof Error && error.message === 'Admin access required') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }
    return NextResponse.json({ error: 'Failed to update tag' }, { status: 500 })
  }
}, '/api/admin/tags/[id]')

// DELETE /api/admin/tags/[id] - Delete tag
export const DELETE = withMetrics(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    requireAdmin(user.email)

    // Check if tag exists
    const existingTag = await prisma.tag.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            questions: true
          }
        }
      }
    })

    if (!existingTag) {
      return NextResponse.json({ error: 'Tag not found' }, { status: 404 })
    }

    // Check if tag is being used by questions
    if (existingTag._count.questions > 0) {
      return NextResponse.json({ 
        error: `Cannot delete tag. It is currently assigned to ${existingTag._count.questions} question(s).` 
      }, { status: 409 })
    }

    await prisma.tag.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Tag deleted successfully' })
  } catch (error) {
    console.error('Error deleting tag:', error)
    if (error instanceof Error && error.message === 'Admin access required') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }
    return NextResponse.json({ error: 'Failed to delete tag' }, { status: 500 })
  }
}, '/api/admin/tags/[id]')