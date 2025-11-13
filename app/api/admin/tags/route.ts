import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/utils/admin'
import { CreateTagData } from '@/types'
import { withMetrics } from '@/lib/withMetrics'

// GET /api/admin/tags - Get all tags with stats
export const GET = withMetrics(async (request: NextRequest) => {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    requireAdmin(user.email)

    const tags = await prisma.tag.findMany({
      include: {
        _count: {
          select: {
            questions: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    const tagsWithStats = tags.map(tag => ({
      ...tag,
      questionCount: tag._count.questions
    }))

    return NextResponse.json(tagsWithStats)
  } catch (error) {
    console.error('Error fetching tags:', error)
    if (error instanceof Error && error.message === 'Admin access required') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }
    return NextResponse.json({ error: 'Failed to fetch tags' }, { status: 500 })
  }
})

// POST /api/admin/tags - Create new tag
export const POST = withMetrics(async (request: NextRequest) => {
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

    // Check if tag already exists
    const existingTag = await prisma.tag.findUnique({
      where: { name: body.name.trim() }
    })

    if (existingTag) {
      return NextResponse.json({ error: 'Tag already exists' }, { status: 409 })
    }

    const tag = await prisma.tag.create({
      data: {
        name: body.name.trim(),
        description: body.description?.trim() || null
      }
    })

    return NextResponse.json(tag, { status: 201 })
  } catch (error) {
    console.error('Error creating tag:', error)
    if (error instanceof Error && error.message === 'Admin access required') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }
    return NextResponse.json({ error: 'Failed to create tag' }, { status: 500 })
  }
})