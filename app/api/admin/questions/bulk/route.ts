import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/utils/admin'
import { Difficulty, OptionKey } from '@/types'
import { withMetrics } from '@/lib/withMetrics'

interface BulkQuestionData {
  text: string
  optionA: string
  optionB: string
  optionC: string
  optionD: string
  correctAnswer: OptionKey
  explanation?: string
  difficulty: Difficulty
  tagIds?: string[]
}

interface BulkInsertRequest {
  questions: BulkQuestionData[]
}

interface QuestionError {
  index: number
  error: string
}

interface BulkInsertResponse {
  success: boolean
  created: number
  questions: any[]
  errors?: QuestionError[]
}

// Validate a single question
function validateQuestion(question: any, index: number): string | null {
  if (!question.text || typeof question.text !== 'string' || question.text.trim() === '') {
    return `Question ${index + 1}: Question text is required`
  }

  if (!question.optionA || typeof question.optionA !== 'string' || question.optionA.trim() === '') {
    return `Question ${index + 1}: Option A is required`
  }

  if (!question.optionB || typeof question.optionB !== 'string' || question.optionB.trim() === '') {
    return `Question ${index + 1}: Option B is required`
  }

  if (!question.optionC || typeof question.optionC !== 'string' || question.optionC.trim() === '') {
    return `Question ${index + 1}: Option C is required`
  }

  if (!question.optionD || typeof question.optionD !== 'string' || question.optionD.trim() === '') {
    return `Question ${index + 1}: Option D is required`
  }

  if (!['A', 'B', 'C', 'D'].includes(question.correctAnswer)) {
    return `Question ${index + 1}: Correct answer must be A, B, C, or D`
  }

  if (!['EASY', 'MEDIUM', 'HARD'].includes(question.difficulty)) {
    return `Question ${index + 1}: Difficulty must be EASY, MEDIUM, or HARD`
  }

  if (question.explanation !== undefined && question.explanation !== null && typeof question.explanation !== 'string') {
    return `Question ${index + 1}: Explanation must be a string`
  }

  if (question.tagIds !== undefined && question.tagIds !== null && !Array.isArray(question.tagIds)) {
    return `Question ${index + 1}: tagIds must be an array`
  }

  return null
}

// POST /api/admin/questions/bulk - Create multiple questions
export const POST = withMetrics(async (request: NextRequest) => {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    requireAdmin(user.email)

    const body: BulkInsertRequest = await request.json()

    // Validate request structure
    if (!body.questions || !Array.isArray(body.questions)) {
      return NextResponse.json({ 
        error: 'Request must contain a questions array' 
      }, { status: 400 })
    }

    if (body.questions.length === 0) {
      return NextResponse.json({ 
        error: 'Questions array cannot be empty' 
      }, { status: 400 })
    }

    // Limit batch size
    if (body.questions.length > 100) {
      return NextResponse.json({ 
        error: 'Maximum 100 questions per batch' 
      }, { status: 400 })
    }

    // Validate all questions first
    const validationErrors: QuestionError[] = []
    for (let i = 0; i < body.questions.length; i++) {
      const error = validateQuestion(body.questions[i], i)
      if (error) {
        validationErrors.push({ index: i, error })
      }
    }

    if (validationErrors.length > 0) {
      return NextResponse.json({
        success: false,
        created: 0,
        questions: [],
        errors: validationErrors
      }, { status: 400 })
    }

    // Collect all unique tag IDs
    const allTagIds = new Set<string>()
    body.questions.forEach(q => {
      if (q.tagIds && q.tagIds.length > 0) {
        q.tagIds.forEach(tagId => allTagIds.add(tagId))
      }
    })

    // Verify all tags exist if any are provided
    if (allTagIds.size > 0) {
      const tags = await prisma.tag.findMany({
        where: { id: { in: Array.from(allTagIds) } }
      })
      
      if (tags.length !== allTagIds.size) {
        const foundTagIds = new Set(tags.map(t => t.id))
        const missingTagIds = Array.from(allTagIds).filter(id => !foundTagIds.has(id))
        return NextResponse.json({
          success: false,
          created: 0,
          questions: [],
          errors: [{
            index: -1,
            error: `Tags not found: ${missingTagIds.join(', ')}`
          }]
        }, { status: 404 })
      }
    }

    // Use transaction to create all questions
    const result = await prisma.$transaction(async (tx) => {
      const createdQuestions = []
      const errors: QuestionError[] = []

      for (let i = 0; i < body.questions.length; i++) {
        try {
          const questionData = body.questions[i]
          
          // Create question
          const question = await tx.question.create({
            data: {
              text: questionData.text.trim(),
              optionA: questionData.optionA.trim(),
              optionB: questionData.optionB.trim(),
              optionC: questionData.optionC.trim(),
              optionD: questionData.optionD.trim(),
              correctAnswer: questionData.correctAnswer,
              explanation: questionData.explanation?.trim() || null,
              difficulty: questionData.difficulty
            }
          })

          // Add tags if provided
          if (questionData.tagIds && questionData.tagIds.length > 0) {
            await tx.questionTag.createMany({
              data: questionData.tagIds.map(tagId => ({
                questionId: question.id,
                tagId
              }))
            })
          }

          createdQuestions.push(question.id)
        } catch (error) {
          console.error(`Error creating question ${i + 1}:`, error)
          errors.push({
            index: i,
            error: `Failed to create question ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`
          })
        }
      }

      return { createdQuestions, errors }
    })

    // Fetch all created questions with tags
    const questionsWithTags = await prisma.question.findMany({
      where: {
        id: { in: result.createdQuestions }
      },
      include: {
        tags: {
          include: {
            tag: true
          }
        }
      },
      orderBy: {
        number: 'desc'
      }
    })

    const formattedQuestions = questionsWithTags.map(question => ({
      ...question,
      tags: question.tags.map(qt => qt.tag)
    }))

    const response: BulkInsertResponse = {
      success: result.errors.length === 0,
      created: result.createdQuestions.length,
      questions: formattedQuestions,
      errors: result.errors.length > 0 ? result.errors : undefined
    }

    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    console.error('Error in bulk question creation:', error)
    if (error instanceof Error && error.message === 'Admin access required') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }
    return NextResponse.json({ 
      error: 'Failed to create questions',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
})
