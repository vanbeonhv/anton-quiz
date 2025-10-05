import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

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

        const { id: quizId } = params
        const body = await request.json()
        const { answers } = body

        // Check for bypass parameter in development
        const { searchParams } = new URL(request.url)
        const bypassCheck = searchParams.get('bypass') === 'true' && process.env.NODE_ENV === 'development'

        if (!answers || !Array.isArray(answers)) {
            return NextResponse.json(
                { error: 'Invalid answers format' },
                { status: 400 }
            )
        }

        // Get quiz with questions
        const quiz = await prisma.quiz.findUnique({
            where: { id: quizId },
            include: {
                questions: {
                    orderBy: { order: 'asc' }
                }
            }
        })

        if (!quiz) {
            return NextResponse.json({ error: 'Quiz not found' }, { status: 404 })
        }

        // Check daily quiz eligibility (skip in development with bypass)
        if (quiz.type === 'DAILY' && !bypassCheck) {
            const now = new Date()
            const vietnamTime = new Date(now.toLocaleString('en-US', {
                timeZone: 'Asia/Ho_Chi_Minh'
            }))

            const todayReset = new Date(vietnamTime)
            todayReset.setHours(8, 0, 0, 0)

            const resetTime = vietnamTime.getHours() < 8
                ? new Date(todayReset.getTime() - 24 * 60 * 60 * 1000)
                : todayReset

            const recentAttempt = await prisma.quizAttempt.findFirst({
                where: {
                    userId: user.id,
                    quizId: quizId,
                    completedAt: { gte: resetTime }
                }
            })

            if (recentAttempt) {
                return NextResponse.json(
                    { error: 'Daily quiz already completed today' },
                    { status: 400 }
                )
            }
        }

        // Validate answers
        const questionMap = new Map(
            quiz.questions.map((q) => [q.id, q.correctAnswer])
        )

        let score = 0
        const answerData = answers.map((answer) => {
            const isCorrect = answer.selectedAnswer === questionMap.get(answer.questionId)
            if (isCorrect) score++

            return {
                questionId: answer.questionId,
                selectedAnswer: answer.selectedAnswer,
                isCorrect
            }
        })

        // Create attempt with answers in transaction
        const attempt = await prisma.$transaction(async (tx) => {
            // Create the quiz attempt
            const quizAttempt = await tx.quizAttempt.create({
                data: {
                    userId: user.id,
                    userEmail: user.email || '',
                    quizId: quizId,
                    score,
                    totalQuestions: quiz.questions.length,
                    answers: {
                        create: answerData
                    }
                },
                include: {
                    answers: {
                        include: {
                            question: true
                        }
                    },
                    quiz: {
                        select: {
                            title: true,
                            type: true
                        }
                    }
                }
            })

            // Create individual question attempts for each answer
            await Promise.all(
                answerData.map(async (answer) => {
                    return tx.questionAttempt.create({
                        data: {
                            questionId: answer.questionId,
                            userId: user.id,
                            userEmail: user.email || '',
                            selectedAnswer: answer.selectedAnswer,
                            isCorrect: answer.isCorrect,
                            source: quiz.type === 'DAILY' ? 'DAILY_QUIZ' : 'NORMAL_QUIZ',
                            answeredAt: new Date()
                        }
                    })
                })
            )

            // Update or create UserStats
            const existingStats = await tx.userStats.findUnique({
                where: { userId: user.id }
            })

            const correctAnswers = answerData.filter(a => a.isCorrect).length
            const totalQuestions = answerData.length

            // Calculate difficulty-based stats
            const difficultyStats = {
                easy: { answered: 0, correct: 0 },
                medium: { answered: 0, correct: 0 },
                hard: { answered: 0, correct: 0 }
            }

            answerData.forEach(answer => {
                const question = quiz.questions.find(q => q.id === answer.questionId)
                if (question) {
                    const difficulty = question.difficulty.toLowerCase() as 'easy' | 'medium' | 'hard'
                    difficultyStats[difficulty].answered++
                    if (answer.isCorrect) {
                        difficultyStats[difficulty].correct++
                    }
                }
            })

            // Calculate streak for daily quiz
            let newStreak = existingStats?.currentStreak || 0
            let newLongestStreak = existingStats?.longestStreak || 0
            
            if (quiz.type === 'DAILY') {
                const today = new Date()
                const lastAnswered = existingStats?.lastAnsweredDate
                
                if (lastAnswered) {
                    const daysDiff = Math.floor((today.getTime() - lastAnswered.getTime()) / (1000 * 60 * 60 * 24))
                    if (daysDiff === 1) {
                        // Consecutive day
                        newStreak = newStreak + 1
                    } else if (daysDiff === 0) {
                        // Same day - don't change streak
                        newStreak = newStreak
                    } else {
                        // Streak broken
                        newStreak = 1
                    }
                } else {
                    // First time
                    newStreak = 1
                }
                
                newLongestStreak = Math.max(newLongestStreak, newStreak)
            }

            if (existingStats) {
                await tx.userStats.update({
                    where: { userId: user.id },
                    data: {
                        totalQuestionsAnswered: existingStats.totalQuestionsAnswered + totalQuestions,
                        totalCorrectAnswers: existingStats.totalCorrectAnswers + correctAnswers,
                        easyQuestionsAnswered: existingStats.easyQuestionsAnswered + difficultyStats.easy.answered,
                        easyCorrectAnswers: existingStats.easyCorrectAnswers + difficultyStats.easy.correct,
                        mediumQuestionsAnswered: existingStats.mediumQuestionsAnswered + difficultyStats.medium.answered,
                        mediumCorrectAnswers: existingStats.mediumCorrectAnswers + difficultyStats.medium.correct,
                        hardQuestionsAnswered: existingStats.hardQuestionsAnswered + difficultyStats.hard.answered,
                        hardCorrectAnswers: existingStats.hardCorrectAnswers + difficultyStats.hard.correct,
                        totalQuizzesTaken: existingStats.totalQuizzesTaken + 1,
                        dailyQuizzesTaken: quiz.type === 'DAILY' 
                            ? existingStats.dailyQuizzesTaken + 1 
                            : existingStats.dailyQuizzesTaken,
                        currentStreak: newStreak,
                        longestStreak: newLongestStreak,
                        lastAnsweredDate: new Date(),
                        updatedAt: new Date()
                    }
                })
            } else {
                await tx.userStats.create({
                    data: {
                        userId: user.id,
                        userEmail: user.email || '',
                        totalQuestionsAnswered: totalQuestions,
                        totalCorrectAnswers: correctAnswers,
                        easyQuestionsAnswered: difficultyStats.easy.answered,
                        easyCorrectAnswers: difficultyStats.easy.correct,
                        mediumQuestionsAnswered: difficultyStats.medium.answered,
                        mediumCorrectAnswers: difficultyStats.medium.correct,
                        hardQuestionsAnswered: difficultyStats.hard.answered,
                        hardCorrectAnswers: difficultyStats.hard.correct,
                        totalQuizzesTaken: 1,
                        dailyQuizzesTaken: quiz.type === 'DAILY' ? 1 : 0,
                        currentStreak: newStreak,
                        longestStreak: newLongestStreak,
                        lastAnsweredDate: new Date()
                    }
                })
            }

            return quizAttempt
        })

        return NextResponse.json(attempt)
    } catch (error) {
        console.error('Failed to submit quiz:', error)
        return NextResponse.json(
            { error: 'Failed to submit quiz' },
            { status: 500 }
        )
    }
}