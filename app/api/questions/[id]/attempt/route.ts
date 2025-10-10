import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/db'
import { OptionKey } from '@/types'
import dayjs from '@/lib/dayjs'

export const dynamic = 'force-dynamic'

// POST /api/questions/[id]/attempt - Submit answer to individual question
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const questionId = params.id
    const body = await request.json()
    const { selectedAnswer } = body as { selectedAnswer: OptionKey }

    // Validate selected answer
    if (!selectedAnswer || !['A', 'B', 'C', 'D'].includes(selectedAnswer)) {
      return NextResponse.json(
        { error: 'Invalid answer. Must be A, B, C, or D' },
        { status: 400 }
      )
    }

    // Get the question with correct answer
    const question = await prisma.question.findUnique({
      where: { 
        id: questionId,
        isActive: true
      }
    })

    if (!question) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      )
    }

    // Check if user has already answered this question correctly
    const existingAttempt = await prisma.questionAttempt.findFirst({
      where: {
        questionId,
        userId: user.id,
        isCorrect: true
      }
    })

    if (existingAttempt) {
      return NextResponse.json(
        { error: 'You have already answered this question correctly' },
        { status: 400 }
      )
    }

    // Calculate if answer is correct
    const isCorrect = selectedAnswer === question.correctAnswer

    // Use transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Create question attempt
      const questionAttempt = await tx.questionAttempt.create({
        data: {
          questionId,
          userId: user.id,
          userEmail: user.email!,
          selectedAnswer,
          isCorrect
        }
      })

      // Update or create user stats
      const existingStats = await tx.userStats.findUnique({
        where: { userId: user.id }
      })

      if (existingStats) {
        // Update existing stats
        await tx.userStats.update({
          where: { userId: user.id },
          data: {
            totalQuestionsAnswered: { increment: 1 },
            totalCorrectAnswers: isCorrect ? { increment: 1 } : undefined,
            // Update difficulty-specific stats
            ...(question.difficulty === 'EASY' && {
              easyQuestionsAnswered: { increment: 1 },
              easyCorrectAnswers: isCorrect ? { increment: 1 } : undefined
            }),
            ...(question.difficulty === 'MEDIUM' && {
              mediumQuestionsAnswered: { increment: 1 },
              mediumCorrectAnswers: isCorrect ? { increment: 1 } : undefined
            }),
            ...(question.difficulty === 'HARD' && {
              hardQuestionsAnswered: { increment: 1 },
              hardCorrectAnswers: isCorrect ? { increment: 1 } : undefined
            }),
            // Update streak if correct
            ...(isCorrect && {
              currentStreak: { increment: 1 },
              lastAnsweredDate: dayjs().toDate()
            }),
            // Reset streak if incorrect
            ...(!isCorrect && {
              currentStreak: 0
            })
          }
        })

        // Update longest streak if current streak is higher
        if (isCorrect) {
          const updatedStats = await tx.userStats.findUnique({
            where: { userId: user.id }
          })
          if (updatedStats && updatedStats.currentStreak > updatedStats.longestStreak) {
            await tx.userStats.update({
              where: { userId: user.id },
              data: {
                longestStreak: updatedStats.currentStreak
              }
            })
          }
        }
      } else {
        // Create new stats
        await tx.userStats.create({
          data: {
            userId: user.id,
            userEmail: user.email!,
            totalQuestionsAnswered: 1,
            totalCorrectAnswers: isCorrect ? 1 : 0,
            // Difficulty-specific stats
            easyQuestionsAnswered: question.difficulty === 'EASY' ? 1 : 0,
            easyCorrectAnswers: question.difficulty === 'EASY' && isCorrect ? 1 : 0,
            mediumQuestionsAnswered: question.difficulty === 'MEDIUM' ? 1 : 0,
            mediumCorrectAnswers: question.difficulty === 'MEDIUM' && isCorrect ? 1 : 0,
            hardQuestionsAnswered: question.difficulty === 'HARD' ? 1 : 0,
            hardCorrectAnswers: question.difficulty === 'HARD' && isCorrect ? 1 : 0,
            // Streak
            currentStreak: isCorrect ? 1 : 0,
            longestStreak: isCorrect ? 1 : 0,
            lastAnsweredDate: dayjs().toDate()
          }
        })
      }

      return questionAttempt
    })

    // Return the result with question details for immediate feedback
    const response = {
      id: result.id,
      questionId: result.questionId,
      selectedAnswer: result.selectedAnswer,
      isCorrect: result.isCorrect,
      answeredAt: result.answeredAt,
      question: {
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
        text: question.text,
        optionA: question.optionA,
        optionB: question.optionB,
        optionC: question.optionC,
        optionD: question.optionD
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Failed to submit question attempt:', error)
    return NextResponse.json(
      { error: 'Failed to submit answer' },
      { status: 500 }
    )
  }
}