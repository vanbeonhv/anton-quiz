import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/db'
import dayjs from '@/lib/dayjs'
import { LevelCalculatorService } from '@/lib/utils/levels'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get or create user stats from the UserStats table
        let userStats = await prisma.userStats.findUnique({
            where: { userId: user.id }
        })

        // If no stats exist, create them by calculating from question attempts
        if (!userStats) {
            const questionAttempts = await prisma.questionAttempt.findMany({
                where: { userId: user.id },
                include: {
                    question: {
                        select: { difficulty: true }
                    }
                }
            })

            const totalQuestionsAnswered = questionAttempts.length
            const totalCorrectAnswers = questionAttempts.filter(attempt => attempt.isCorrect).length

            // Calculate difficulty-based stats
            const easyAttempts = questionAttempts.filter(attempt => attempt.question.difficulty === 'EASY')
            const mediumAttempts = questionAttempts.filter(attempt => attempt.question.difficulty === 'MEDIUM')
            const hardAttempts = questionAttempts.filter(attempt => attempt.question.difficulty === 'HARD')

            const easyQuestionsAnswered = easyAttempts.length
            const easyCorrectAnswers = easyAttempts.filter(attempt => attempt.isCorrect).length
            const mediumQuestionsAnswered = mediumAttempts.length
            const mediumCorrectAnswers = mediumAttempts.filter(attempt => attempt.isCorrect).length
            const hardQuestionsAnswered = hardAttempts.length
            const hardCorrectAnswers = hardAttempts.filter(attempt => attempt.isCorrect).length

            // Calculate initial XP and level based on existing correct answers
            const correctAttempts = questionAttempts.filter(attempt => attempt.isCorrect)
            const initialXp = correctAttempts.reduce((totalXp, attempt) => {
                const xpForDifficulty = {
                    'EASY': 10,
                    'MEDIUM': 25,
                    'HARD': 50
                }
                return totalXp + (xpForDifficulty[attempt.question.difficulty] || 0)
            }, 0)

            const levelInfo = LevelCalculatorService.calculateLevel(initialXp)

            // Create the user stats record
            userStats = await prisma.userStats.create({
                data: {
                    userId: user.id,
                    userEmail: user.email || '',
                    totalQuestionsAnswered,
                    totalCorrectAnswers,
                    easyQuestionsAnswered,
                    easyCorrectAnswers,
                    mediumQuestionsAnswered,
                    mediumCorrectAnswers,
                    hardQuestionsAnswered,
                    hardCorrectAnswers,
                    currentStreak: 0, // TODO: Calculate streak
                    longestStreak: 0, // TODO: Calculate streak
                    lastAnsweredDate: questionAttempts.length > 0 ?
                        questionAttempts.reduce((latest, attempt) => 
                            dayjs(attempt.answeredAt).isAfter(dayjs(latest.answeredAt)) ? attempt : latest
                        ).answeredAt : null,
                    totalXp: initialXp,
                    currentLevel: levelInfo.level,
                    currentTitle: levelInfo.title
                }
            })
        }

        // Calculate XP to next level
        const xpToNextLevel = LevelCalculatorService.calculateXpToNextLevel(userStats.currentLevel, userStats.totalXp)

        return NextResponse.json({
            ...userStats,
            xpToNextLevel
        })
    } catch (error) {
        console.error('Failed to fetch user stats:', error)
        return NextResponse.json(
            { error: 'Failed to fetch user stats' },
            { status: 500 }
        )
    }
}