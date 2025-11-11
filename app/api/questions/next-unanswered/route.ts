import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/db'
import { withMetrics } from '@/lib/withMetrics'

export const dynamic = 'force-dynamic'

export const GET = withMetrics(async (request: NextRequest) => {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all question IDs that the user has already attempted
    const userAttempts = await prisma.questionAttempt.findMany({
      where: {
        userId: user.id
      },
      select: { questionId: true },
      distinct: ['questionId']
    })

    const attemptedQuestionIds = userAttempts.map(attempt => attempt.questionId)

    // First, count unanswered questions for efficiency
    const unansweredCount = await prisma.question.count({
      where: {
        isActive: true,
        id: { notIn: attemptedQuestionIds }
      }
    })

    // If no unanswered questions, return null
    if (unansweredCount === 0) {
      return NextResponse.json({ 
        questionId: null, 
        remainingQuestions: 0 
      })
    }

    // For better performance with large datasets, use skip with random offset
    const randomSkip = Math.floor(Math.random() * unansweredCount)
    
    const selectedQuestion = await prisma.question.findFirst({
      where: {
        isActive: true,
        id: { notIn: attemptedQuestionIds }
      },
      select: { id: true },
      skip: randomSkip
    })

    if (!selectedQuestion) {
      // Fallback: if somehow no question is found, return null
      return NextResponse.json({ 
        questionId: null, 
        remainingQuestions: 0 
      })
    }

    return NextResponse.json({ 
      questionId: selectedQuestion.id,
      remainingQuestions: unansweredCount 
    })
  } catch (error) {
    console.error('Failed to get next unanswered question:', error)
    return NextResponse.json(
      { error: 'Failed to get next unanswered question' },
      { status: 500 }
    )
  }
})