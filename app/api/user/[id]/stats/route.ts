import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import type { UserStatsWithComputed, TagStats } from '@/types'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id

    // Get user stats
    const userStats = await prisma.userStats.findUnique({
      where: { userId }
    })

    if (!userStats) {
      return NextResponse.json(
        { error: 'User statistics not found' },
        { status: 404 }
      )
    }

    // Calculate accuracy percentage
    const accuracyPercentage = userStats.totalQuestionsAnswered > 0
      ? Math.round((userStats.totalCorrectAnswers / userStats.totalQuestionsAnswered) * 100)
      : 0

    // Get tag statistics
    const tagStats = await getTagStatsByUser(userId)

    // Get recent activity (last 20 activities)
    const recentActivity = await getRecentActivity(userId, 20)

    const response = {
      ...userStats,
      accuracyPercentage,
      tagStats,
      // Map actual fields to expected interface fields
      totalDailyPoints: userStats.dailyQuizzesTaken,
      dailyQuizStreak: userStats.currentStreak
    }

    return NextResponse.json({
      ...response,
      recentActivity
    })
  } catch (error) {
    console.error('Failed to fetch user statistics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user statistics' },
      { status: 500 }
    )
  }
}

async function getTagStatsByUser(userId: string): Promise<TagStats[]> {
  // Get all tags with question counts
  const tags = await prisma.tag.findMany({
    include: {
      questions: {
        include: {
          question: {
            select: {
              id: true,
              questionAttempts: {
                where: { userId },
                select: {
                  isCorrect: true
                }
              }
            }
          }
        }
      }
    }
  })

  return tags.map(tag => {
    const totalQuestions = tag.questions.length
    const answeredQuestions = tag.questions.filter(
      qt => qt.question.questionAttempts.length > 0
    ).length
    const correctAnswers = tag.questions.filter(
      qt => qt.question.questionAttempts.some(attempt => attempt.isCorrect)
    ).length

    const accuracyPercentage = answeredQuestions > 0
      ? Math.round((correctAnswers / answeredQuestions) * 100)
      : 0

    return {
      tagId: tag.id,
      tagName: tag.name,
      totalQuestions,
      answeredQuestions,
      correctAnswers,
      accuracyPercentage
    }
  }).filter(stat => stat.totalQuestions > 0) // Only include tags that have questions
}

async function getRecentActivity(userId: string, limit: number) {
  // Get recent question attempts
  const questionAttempts = await prisma.questionAttempt.findMany({
    where: { userId },
    take: limit,
    orderBy: { answeredAt: 'desc' },
    include: {
      question: {
        select: {
          id: true,
          number: true,
          text: true
        }
      }
    }
  })

  // Get recent quiz attempts
  const quizAttempts = await prisma.quizAttempt.findMany({
    where: { userId },
    take: limit,
    orderBy: { completedAt: 'desc' },
    include: {
      quiz: {
        select: {
          id: true,
          title: true,
          type: true
        }
      }
    }
  })

  // Combine and sort activities
  const activities = [
    ...questionAttempts.map(attempt => ({
      type: 'question' as const,
      id: attempt.id,
      date: attempt.answeredAt,
      isCorrect: attempt.isCorrect,
      source: attempt.source,
      question: {
        id: attempt.question.id,
        number: attempt.question.number,
        text: attempt.question.text.substring(0, 100) + '...'
      }
    })),
    ...quizAttempts.map(attempt => ({
      type: 'quiz' as const,
      id: attempt.id,
      date: attempt.completedAt,
      score: attempt.score,
      totalQuestions: attempt.totalQuestions,
      quiz: {
        id: attempt.quiz.id,
        title: attempt.quiz.title,
        type: attempt.quiz.type
      }
    }))
  ]

  // Sort by date descending and take the most recent activities
  return activities
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, limit)
}