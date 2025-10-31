import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getDailyQuestion } from '@/lib/utils/dailyQuestion'

export const dynamic = 'force-dynamic'

/**
 * API endpoint that redirects to the current daily question
 * Useful for external sharing or programmatic access
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      // Redirect to login if not authenticated
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', '/daily')
      return NextResponse.redirect(loginUrl)
    }

    // Get today's daily question
    const dailyQuestionResult = await getDailyQuestion()

    // Check if daily question could not be determined
    if (!dailyQuestionResult.questionId) {
      return NextResponse.json(
        { error: 'Today\'s daily question is not available' },
        { status: 404 }
      )
    }

    // Redirect to the question page
    const questionUrl = new URL(`/questions/${dailyQuestionResult.questionId}`, request.url)
    questionUrl.searchParams.set('type', 'daily')
    
    return NextResponse.redirect(questionUrl)
  } catch (error) {
    console.error('Failed to redirect to daily question:', error)
    return NextResponse.json(
      { error: 'Failed to redirect to daily question' },
      { status: 500 }
    )
  }
}