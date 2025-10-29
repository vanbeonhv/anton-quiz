import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/db'
import { Prisma } from '@prisma/client'
import { OptionKey, Difficulty } from '@/types'
import dayjs from '@/lib/dayjs'
import { getDailyQuestion, hasAttemptedDailyQuestion, getDailyPoints } from '@/lib/utils/dailyQuestion'
import { LevelCalculatorService } from '@/lib/utils/levels'

export const dynamic = 'force-dynamic'

/**
 * Calculate XP based on question difficulty
 * Only awards XP for correct answers on first attempt
 */
function calculateXpEarned(difficulty: Difficulty, isCorrect: boolean, isFirstCorrectAttempt: boolean): number {
  if (!isCorrect || !isFirstCorrectAttempt) {
    return 0
  }

  switch (difficulty) {
    case 'EASY':
      return 10
    case 'MEDIUM':
      return 25
    case 'HARD':
      return 50
    default:
      return 0
  }
}

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
    const { selectedAnswer, isDailyQuestion } = body as {
      selectedAnswer: OptionKey
      isDailyQuestion?: boolean
    }

    // Validate selected answer
    if (!selectedAnswer || !['A', 'B', 'C', 'D'].includes(selectedAnswer)) {
      return NextResponse.json(
        { error: 'Invalid answer. Must be A, B, C, or D' },
        { status: 400 }
      )
    }

    // If this is a daily question attempt, validate it
    if (isDailyQuestion) {
      // Get today's daily question
      const dailyQuestionResult = await getDailyQuestion()

      // Verify the question ID matches today's daily question
      if (dailyQuestionResult.questionId !== questionId) {
        return NextResponse.json(
          { error: 'This is not today\'s daily question' },
          { status: 400 }
        )
      }

      // Check if user has already attempted today's daily question
      const hasAttempted = await hasAttemptedDailyQuestion(user.id, questionId)
      if (hasAttempted) {
        return NextResponse.json(
          { error: 'You have already attempted today\'s daily question' },
          { status: 400 }
        )
      }
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

    // Soft pre-check for optimization (optional - helps avoid unnecessary transactions)
    const priorCorrect = await prisma.questionAttempt.findFirst({
      where: {
        questionId,
        userId: user.id,
        isCorrect: true
      },
      select: { id: true }
    })

    // For non-daily questions, prevent multiple correct attempts (soft check)
    if (!isDailyQuestion && priorCorrect) {
      return NextResponse.json(
        { error: 'You have already answered this question correctly' },
        { status: 400 }
      )
    }

    // Calculate if answer is correct
    const isCorrect = selectedAnswer === question.correctAnswer

    // Use transaction with Serializable isolation to prevent race conditions
    const result = await prisma.$transaction(async (tx) => {
      // Authoritative re-check within Serializable isolation
      const existingCorrect = await tx.questionAttempt.findFirst({
        where: {
          questionId,
          userId: user.id,
          isCorrect: true
        },
        select: { id: true }
      })

      // For non-daily questions, prevent multiple correct attempts (authoritative check)
      if (!isDailyQuestion && existingCorrect) {
        throw new Error('You have already answered this question correctly')
      }

      const isFirstCorrectAttempt = !existingCorrect

      // Calculate XP earned for this attempt (inside transaction)
      const xpEarned = calculateXpEarned(question.difficulty, isCorrect, isFirstCorrectAttempt)
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

      // Calculate points for correct answers based on difficulty
      const pointsEarned = isCorrect ? getDailyPoints(question.difficulty) : 0

      // Update or create user stats
      const existingStats = await tx.userStats.findUnique({
        where: { userId: user.id }
      })

      let leveledUp = false

      if (existingStats) {
        // Calculate new total XP and level information
        const newTotalXp = existingStats.totalXp + xpEarned
        const newLevelInfo = LevelCalculatorService.calculateLevel(newTotalXp)
        leveledUp = LevelCalculatorService.checkLevelUp(existingStats.totalXp, newTotalXp)

        // Update existing stats
        await tx.userStats.update({
          where: { userId: user.id },
          data: {
            totalQuestionsAnswered: { increment: 1 },
            ...(isCorrect && {
              totalCorrectAnswers: { increment: 1 },
              totalDailyPoints: { increment: pointsEarned }
            }),
            // Update XP and level fields
            totalXp: newTotalXp,
            currentLevel: newLevelInfo.level,
            currentTitle: newLevelInfo.title,
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
        // Calculate level information for new user
        const newLevelInfo = LevelCalculatorService.calculateLevel(xpEarned)

        // Create new stats
        await tx.userStats.create({
          data: {
            userId: user.id,
            userEmail: user.email!,
            totalQuestionsAnswered: 1,
            totalCorrectAnswers: isCorrect ? 1 : 0,
            totalDailyPoints: pointsEarned,
            // XP and level fields
            totalXp: xpEarned,
            currentLevel: newLevelInfo.level,
            currentTitle: newLevelInfo.title,
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

      // Get the updated user stats for response
      const updatedStats = await tx.userStats.findUnique({
        where: { userId: user.id }
      })

      return {
        questionAttempt,
        updatedStats,
        xpEarned,
        leveledUp
      }
    }, {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable
    })

    // Calculate daily points for response
    const dailyPointsAwarded = isDailyQuestion && result.questionAttempt.isCorrect ? getDailyPoints(question.difficulty) : undefined

    // Calculate XP to next level for response
    const xpToNextLevel = result.updatedStats ?
      LevelCalculatorService.calculateXpToNextLevel(result.updatedStats.currentLevel, result.updatedStats.totalXp) : 0

    // Return the result with question details and XP information for immediate feedback
    const response = {
      status: "success" as const,
      id: result.questionAttempt.id,
      questionId: result.questionAttempt.questionId,
      selectedAnswer: result.questionAttempt.selectedAnswer,
      isCorrect: result.questionAttempt.isCorrect,
      answeredAt: result.questionAttempt.answeredAt,
      xpEarned: result.xpEarned,
      userProgress: {
        currentLevel: result.updatedStats?.currentLevel || 1,
        currentTitle: result.updatedStats?.currentTitle || "Newbie",
        totalXp: result.updatedStats?.totalXp || 0,
        xpToNextLevel,
        leveledUp: result.leveledUp,
        ...(result.leveledUp && result.updatedStats && {
          newTitle: result.updatedStats.currentTitle
        })
      },
      ...(isDailyQuestion && {
        isDailyQuestion: true,
        dailyPoints: dailyPointsAwarded
      }),
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

    // Handle specific error from transaction
    if (error instanceof Error && error.message === 'You have already answered this question correctly') {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to submit answer' },
      { status: 500 }
    )
  }
}