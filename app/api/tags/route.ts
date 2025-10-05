import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET /api/tags - Get all available tags with statistics
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const includeStats = searchParams.get('includeStats') === 'true'
    const includeUserProgress = searchParams.get('includeUserProgress') === 'true'

    // Get all tags with question count
    const tags = await prisma.tag.findMany({
      include: {
        _count: {
          select: {
            questions: {
              where: {
                question: {
                  isActive: true
                }
              }
            }
          }
        }
      },
      orderBy: { name: 'asc' }
    })

    // Transform basic tag data
    let transformedTags = tags.map(tag => ({
      id: tag.id,
      name: tag.name,
      description: tag.description,
      createdAt: tag.createdAt,
      updatedAt: tag.updatedAt,
      questionCount: tag._count.questions
    }))

    // Add user progress statistics if requested
    if (includeUserProgress) {
      const tagsWithProgress = await Promise.all(
        transformedTags.map(async (tag) => {
          // Get questions for this tag
          const tagQuestions = await prisma.question.findMany({
            where: {
              isActive: true,
              tags: {
                some: {
                  tagId: tag.id
                }
              }
            },
            select: { id: true }
          })

          const questionIds = tagQuestions.map(q => q.id)

          // Get user's correct attempts for questions in this tag
          const userCorrectAttempts = await prisma.questionAttempt.findMany({
            where: {
              userId: user.id,
              questionId: { in: questionIds },
              isCorrect: true
            },
            select: { questionId: true },
            distinct: ['questionId']
          })

          // Get user's total attempts for questions in this tag
          const userTotalAttempts = await prisma.questionAttempt.findMany({
            where: {
              userId: user.id,
              questionId: { in: questionIds }
            },
            select: { questionId: true },
            distinct: ['questionId']
          })

          const answeredQuestions = userCorrectAttempts.length
          const totalAttempted = userTotalAttempts.length
          const accuracyPercentage = totalAttempted > 0 
            ? Math.round((answeredQuestions / totalAttempted) * 100) 
            : 0

          return {
            ...tag,
            userProgress: {
              totalQuestions: questionIds.length,
              answeredQuestions,
              totalAttempted,
              accuracyPercentage,
              progressPercentage: questionIds.length > 0 
                ? Math.round((answeredQuestions / questionIds.length) * 100) 
                : 0
            }
          }
        })
      )

      transformedTags = tagsWithProgress
    }

    // Add general statistics if requested
    if (includeStats) {
      const tagsWithStats = await Promise.all(
        transformedTags.map(async (tag) => {
          // Get total attempts for questions in this tag
          const totalAttempts = await prisma.questionAttempt.count({
            where: {
              question: {
                tags: {
                  some: {
                    tagId: tag.id
                  }
                }
              }
            }
          })

          // Get correct attempts for questions in this tag
          const correctAttempts = await prisma.questionAttempt.count({
            where: {
              question: {
                tags: {
                  some: {
                    tagId: tag.id
                  }
                }
              },
              isCorrect: true
            }
          })

          const overallAccuracy = totalAttempts > 0 
            ? Math.round((correctAttempts / totalAttempts) * 100) 
            : 0

          return {
            ...tag,
            stats: {
              totalAttempts,
              correctAttempts,
              overallAccuracy
            }
          }
        })
      )

      transformedTags = tagsWithStats
    }

    return NextResponse.json(transformedTags)
  } catch (error) {
    console.error('Failed to fetch tags:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tags' },
      { status: 500 }
    )
  }
}