import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find daily quiz
    const dailyQuiz = await prisma.quiz.findFirst({
      where: { type: 'DAILY' }
    })

    if (!dailyQuiz) {
      return NextResponse.json({
        canTake: false,
        message: 'No daily quiz available'
      })
    }

    // Calculate today 8 AM Vietnam time
    const now = new Date()
    const vietnamTime = new Date(now.toLocaleString('en-US', { 
      timeZone: 'Asia/Ho_Chi_Minh' 
    }))
    
    const todayReset = new Date(vietnamTime)
    todayReset.setHours(8, 0, 0, 0)
    
    // If before 8 AM, use yesterday's 8 AM
    const resetTime = vietnamTime.getHours() < 8 
      ? new Date(todayReset.getTime() - 24 * 60 * 60 * 1000)
      : todayReset

    // Check for attempts after reset time
    const recentAttempt = await prisma.quizAttempt.findFirst({
      where: {
        userId: user.id,
        quizId: dailyQuiz.id,
        completedAt: { gte: resetTime }
      }
    })

    // Calculate next reset time
    const nextReset = new Date(resetTime.getTime() + 24 * 60 * 60 * 1000)

    return NextResponse.json({
      canTake: !recentAttempt,
      quizId: dailyQuiz.id,
      nextResetTime: nextReset.toISOString(),
      message: recentAttempt ? 'Already completed today' : 'Available now'
    })
  } catch (error) {
    console.error('Failed to check daily quiz:', error)
    return NextResponse.json(
      { error: 'Failed to check daily quiz' },
      { status: 500 }
    )
  }
}