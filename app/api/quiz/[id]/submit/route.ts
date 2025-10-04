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

        // Check daily quiz eligibility
        if (quiz.type === 'DAILY') {
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
        const attempt = await prisma.quizAttempt.create({
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

        return NextResponse.json(attempt)
    } catch (error) {
        console.error('Failed to submit quiz:', error)
        return NextResponse.json(
            { error: 'Failed to submit quiz' },
            { status: 500 }
        )
    }
}