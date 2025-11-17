import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { createClient } from '@/lib/supabase/server'
import { validateCommentContent } from '@/lib/utils/comments'
import { COMMENT_EDIT_THRESHOLD_SECONDS } from '@/types'

/**
 * PATCH /api/comments/[id]
 * Update an existing comment
 * Requires authentication and comment ownership
 */
export async function PATCH(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    // Validate authentication
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required to edit comments' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { content } = body

    // Validate content
    const validation = validateCommentContent(content)
    if (!validation.isValid) {
      return NextResponse.json(
        { 
          error: validation.error,
          details: { length: content?.trim().length || 0, min: 1, max: 500 }
        },
        { status: 400 }
      )
    }

    // Check if comment exists
    const comment = await prisma.questionComment.findUnique({
      where: { id: params.id },
    })

    if (!comment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      )
    }

    // Verify user is the comment author
    if (comment.userId !== user.id) {
      return NextResponse.json(
        { error: 'You can only edit your own comments' },
        { status: 403 }
      )
    }

    // Update comment
    const updatedComment = await prisma.questionComment.update({
      where: { id: params.id },
      data: {
        content: content.trim(),
        updatedAt: new Date(),
      },
    })

    // Fetch user metadata from auth.users table
    let displayName: string | null = null
    let avatarUrl: string | null = null
    
    try {
      const authUsers = await prisma.$queryRaw<Array<{ id: string; raw_user_meta_data: any }>>`
        SELECT id, raw_user_meta_data 
        FROM auth.users 
        WHERE id = ${user.id}::uuid
      `
      
      if (authUsers.length > 0) {
        const userData = authUsers[0]
        avatarUrl = userData.raw_user_meta_data?.avatar_url || null
        displayName = userData.raw_user_meta_data?.full_name || 
                     userData.raw_user_meta_data?.preferred_username || 
                     userData.raw_user_meta_data?.user_name || 
                     null
      }
    } catch (error) {
      console.warn('Failed to fetch user metadata for updated comment:', error)
    }

    // Calculate isEdited flag (updatedAt > createdAt + COMMENT_EDIT_THRESHOLD_SECONDS)
    const isEdited =
      updatedComment.updatedAt.getTime() >
      updatedComment.createdAt.getTime() + (COMMENT_EDIT_THRESHOLD_SECONDS * 1000)

    // Return updated comment with author info
    return NextResponse.json({
      ...updatedComment,
      author: {
        displayName,
        avatarUrl,
      },
      isEdited,
    })
  } catch (error) {
    console.error('Error updating comment:', error)
    return NextResponse.json(
      { 
        error: 'Failed to update comment',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/comments/[id]
 * Delete an existing comment
 * Requires authentication and comment ownership
 */
export async function DELETE(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    // Validate authentication
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required to delete comments' },
        { status: 401 }
      )
    }

    // Check if comment exists
    const comment = await prisma.questionComment.findUnique({
      where: { id: params.id },
    })

    if (!comment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      )
    }

    // Verify user is the comment author
    if (comment.userId !== user.id) {
      return NextResponse.json(
        { error: 'You can only delete your own comments' },
        { status: 403 }
      )
    }

    // Delete comment from database
    await prisma.questionComment.delete({
      where: { id: params.id },
    })

    // Return success response
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting comment:', error)
    return NextResponse.json(
      { 
        error: 'Failed to delete comment',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
