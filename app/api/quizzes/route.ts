import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const quizzes = await prisma.quiz.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            questions: true,
            attempts: true
          }
        }
      }
    })

    // Transform the data to match our interface
    const transformedQuizzes = quizzes.map(quiz => ({
      id: quiz.id,
      title: quiz.title,
      description: quiz.description,
      type: quiz.type,
      createdAt: quiz.createdAt,
      updatedAt: quiz.updatedAt,
      questionCount: quiz._count.questions,
      attemptCount: quiz._count.attempts
    }))

    return NextResponse.json(transformedQuizzes)
  } catch (error) {
    console.error('Failed to fetch quizzes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch quizzes' },
      { status: 500 }
    )
  }
}