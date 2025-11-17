import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/db'
import { QuestionCommentWithAuthor, COMMENT_EDIT_THRESHOLD_SECONDS } from '@/types'
import { validateCommentContent } from '@/lib/utils/comments'

export const dynamic = 'force-dynamic'

// GET /api/questions/[id]/comments - Get all comments for a question
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const questionId = params.id

    // Validate question exists
    const question = await prisma.question.findUnique({
      where: { id: questionId }
    })

    if (!question) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      )
    }

    // Query comments from database by questionId
    const comments = await prisma.questionComment.findMany({
      where: { questionId },
      orderBy: { createdAt: 'asc' } // Sort by createdAt ascending (oldest first)
    })

    // If no comments, return empty array
    if (comments.length === 0) {
      return NextResponse.json([])
    }

    // Fetch user metadata from Supabase Auth using direct SQL query
    const userMetadataMap = new Map<string, { displayName: string | null; avatarUrl: string | null }>()
    const uniqueUserIds = Array.from(new Set(comments.map(c => c.userId)))
    
    if (uniqueUserIds.length > 0) {
      try {
        // Query auth.users table directly via Prisma raw SQL
        const authUsers = await prisma.$queryRaw<Array<{ id: string; raw_user_meta_data: any }>>`
          SELECT id, raw_user_meta_data 
          FROM auth.users 
          WHERE id = ANY(${uniqueUserIds}::uuid[])
        `

        authUsers.forEach((user) => {
          const avatarUrl = user.raw_user_meta_data?.avatar_url || null
          // Priority: full_name > preferred_username > user_name
          const displayName = user.raw_user_meta_data?.full_name || 
                            user.raw_user_meta_data?.preferred_username || 
                            user.raw_user_meta_data?.user_name || 
                            null
          userMetadataMap.set(user.id, { displayName, avatarUrl })
        })
      } catch (error) {
        // If we can't fetch user metadata, just continue with null values
        console.warn('Failed to fetch user metadata for comments:', error)
      }
    }

    // Transform comments with author info and isEdited flag
    const commentsWithAuthor: QuestionCommentWithAuthor[] = comments.map(comment => {
      const author = userMetadataMap.get(comment.userId) || { displayName: null, avatarUrl: null }
      
      // Calculate isEdited flag (updatedAt > createdAt + COMMENT_EDIT_THRESHOLD_SECONDS)
      const createdTime = new Date(comment.createdAt).getTime()
      const updatedTime = new Date(comment.updatedAt).getTime()
      const isEdited = updatedTime > createdTime + (COMMENT_EDIT_THRESHOLD_SECONDS * 1000) // Convert to milliseconds
      
      return {
        id: comment.id,
        questionId: comment.questionId,
        userId: comment.userId,
        userEmail: comment.userEmail,
        content: comment.content,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
        author,
        isEdited
      }
    })

    return NextResponse.json(commentsWithAuthor)
  } catch (error) {
    console.error('Failed to fetch comments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    )
  }
}

// POST /api/questions/[id]/comments - Create a new comment
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const questionId = params.id

    // Validate user authentication using Supabase server client
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required to post comments' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { content } = body

    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: 'Comment content is required' },
        { status: 400 }
      )
    }

    // Validate content length (1-500 chars) server-side
    const validation = validateCommentContent(content)
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    // Validate question exists in database
    const question = await prisma.question.findUnique({
      where: { id: questionId }
    })

    if (!question) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      )
    }

    // Create comment record with userId, userEmail, questionId, content
    const comment = await prisma.questionComment.create({
      data: {
        questionId,
        userId: user.id,
        userEmail: user.email || '',
        content: content.trim()
      }
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
      console.warn('Failed to fetch user metadata for new comment:', error)
    }

    // Calculate isEdited flag (should be false for new comments)
    const createdTime = new Date(comment.createdAt).getTime()
    const updatedTime = new Date(comment.updatedAt).getTime()
    const isEdited = updatedTime > createdTime + 60000

    const commentWithAuthor: QuestionCommentWithAuthor = {
      id: comment.id,
      questionId: comment.questionId,
      userId: comment.userId,
      userEmail: comment.userEmail,
      content: comment.content,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      author: {
        displayName,
        avatarUrl
      },
      isEdited
    }

    return NextResponse.json(commentWithAuthor, { status: 201 })
  } catch (error) {
    console.error('Failed to create comment:', error)
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    )
  }
}
