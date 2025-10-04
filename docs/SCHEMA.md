# Quiz App - Database Schema

## Overview

This document describes the complete database schema for the Quiz App using Prisma + PostgreSQL via Supabase.

## Entity Relationship Diagram

```
User (Supabase Auth)
  ↓
  └─→ QuizAttempt
        ├─→ Quiz
        └─→ Answer
              └─→ Question
                    └─→ Quiz
```

## Schema Definition

### Complete Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================
// QUIZ MODELS
// ============================================

model Quiz {
  id          String      @id @default(cuid())
  title       String
  description String?
  type        QuizType    @default(NORMAL)
  
  // Timestamps
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  
  // Relations
  questions   Question[]
  attempts    QuizAttempt[]
  
  @@index([type])
  @@index([createdAt])
}

enum QuizType {
  NORMAL  // Can be taken multiple times anytime
  DAILY   // Can only be taken once per day (resets 8 AM Vietnam time)
}

// ============================================
// QUESTION MODELS
// ============================================

model Question {
  id        String   @id @default(cuid())
  quizId    String
  quiz      Quiz     @relation(fields: [quizId], references: [id], onDelete: Cascade)
  
  // Question content
  text      String   @db.Text
  
  // Options stored as separate fields (A, B, C, D)
  optionA   String
  optionB   String
  optionC   String
  optionD   String
  
  // Correct answer stored as 'A', 'B', 'C', or 'D'
  correctAnswer String  // Type: 'A' | 'B' | 'C' | 'D'
  
  // Optional explanation shown after submission
  explanation   String? @db.Text
  
  // Question order in the quiz
  order     Int
  
  // Timestamps
  createdAt DateTime @default(now())
  
  // Relations
  answers   Answer[]
  
  @@index([quizId])
  @@index([quizId, order])
}

// ============================================
// ATTEMPT & ANSWER MODELS
// ============================================

model QuizAttempt {
  id          String   @id @default(cuid())
  
  // Quiz reference
  quizId      String
  quiz        Quiz     @relation(fields: [quizId], references: [id], onDelete: Cascade)
  
  // User info (from Supabase Auth)
  userId      String   // Supabase auth.users.id (UUID)
  userEmail   String   // Cached for display purposes
  
  // Attempt results
  score       Int      // Number of correct answers
  totalQuestions Int   // Total questions in quiz at time of attempt
  
  // Timestamps
  completedAt DateTime @default(now())
  
  // Relations
  answers     Answer[]
  
  @@index([userId])
  @@index([quizId])
  @@index([completedAt])
  @@index([userId, quizId, completedAt]) // For daily quiz check
  @@index([score]) // For leaderboard sorting
}

model Answer {
  id         String      @id @default(cuid())
  
  // References
  attemptId  String
  attempt    QuizAttempt @relation(fields: [attemptId], references: [id], onDelete: Cascade)
  
  questionId String
  question   Question    @relation(fields: [questionId], references: [id], onDelete: Cascade)
  
  // User's selected answer ('A', 'B', 'C', or 'D')
  selectedAnswer String    // Type: 'A' | 'B' | 'C' | 'D'
  
  // Result
  isCorrect  Boolean
  
  // Timestamp
  answeredAt DateTime    @default(now())
  
  @@index([attemptId])
  @@index([questionId])
}
```

## TypeScript Types

```typescript
// types/index.ts

// ============================================
// ENUMS
// ============================================

export type QuizType = 'NORMAL' | 'DAILY'
export type OptionKey = 'A' | 'B' | 'C' | 'D'

// ============================================
// DATABASE MODELS
// ============================================

export interface Quiz {
  id: string
  title: string
  description: string | null
  type: QuizType
  createdAt: Date
  updatedAt: Date
}

export interface Question {
  id: string
  quizId: string
  text: string
  optionA: string
  optionB: string
  optionC: string
  optionD: string
  correctAnswer: OptionKey
  explanation: string | null
  order: number
  createdAt: Date
}

export interface QuizAttempt {
  id: string
  quizId: string
  userId: string
  userEmail: string
  score: number
  totalQuestions: number
  completedAt: Date
}

export interface Answer {
  id: string
  attemptId: string
  questionId: string
  selectedAnswer: OptionKey
  isCorrect: boolean
  answeredAt: Date
}

// ============================================
// EXTENDED TYPES (with relations)
// ============================================

export interface QuizWithQuestions extends Quiz {
  questions: Question[]
}

export interface QuizWithStats extends Quiz {
  _count: {
    questions: number
    attempts: number
  }
}

export interface QuizAttemptWithDetails extends QuizAttempt {
  quiz: Quiz
  answers: AnswerWithQuestion[]
}

export interface AnswerWithQuestion extends Answer {
  question: Question
}

// ============================================
// FORM DATA TYPES
// ============================================

export interface CreateQuizData {
  title: string
  description?: string
  type: QuizType
}

export interface CreateQuestionData {
  quizId: string
  text: string
  optionA: string
  optionB: string
  optionC: string
  optionD: string
  correctAnswer: OptionKey
  explanation?: string
  order: number
}

export interface SubmitQuizData {
  quizId: string
  answers: {
    questionId: string
    selectedAnswer: OptionKey
  }[]
}

// ============================================
// LEADERBOARD TYPES
// ============================================

export interface LeaderboardEntry {
  attemptId: string
  userId: string
  userEmail: string
  quizTitle: string
  score: number
  totalQuestions: number
  percentage: number
  completedAt: Date
}

export type LeaderboardFilter = 'all-time' | 'this-week'
```

## Key Constraints & Rules

### Quiz Rules
1. **Quiz Types**:
   - `NORMAL`: Can be taken unlimited times
   - `DAILY`: Can only be taken once per day (resets at 8:00 AM Vietnam time)

2. **Deletion Cascade**:
   - Deleting a Quiz deletes all Questions and QuizAttempts
   - Deleting a QuizAttempt deletes all Answers

### Question Rules
1. **Options Storage**:
   - Always stored as 4 separate fields: optionA, optionB, optionC, optionD
   - Never use arrays to avoid indexing confusion

2. **Correct Answer**:
   - Stored as single character: 'A', 'B', 'C', or 'D'
   - Makes comparison simple: `selectedAnswer === correctAnswer`

3. **Order**:
   - Questions are displayed in ascending order
   - Order is set when question is created
   - Can be updated by admin

### Attempt Rules
1. **Daily Quiz Limit**:
   - Check last attempt for DAILY quiz type
   - Reset time: 8:00 AM Vietnam Time (GMT+7)
   - Query: Find attempts where `completedAt >= todayReset`

2. **Scoring**:
   - Score = count of correct answers
   - Calculate: `answers.filter(a => a.isCorrect).length`
   - Store both score and totalQuestions for percentage calculation

3. **User Data**:
   - userId comes from Supabase Auth (UUID format)
   - userEmail cached for performance (avoid joining auth.users)

### Answer Rules
1. **Selected Answer Storage**:
   - Always 'A', 'B', 'C', or 'D' (never full text)
   - Matches Question.correctAnswer format exactly

2. **Correctness Calculation**:
   - Set during submission: `isCorrect = selectedAnswer === question.correctAnswer`

## Indexes Explanation

### Performance Indexes
```prisma
// Quiz
@@index([type])              // Filter by NORMAL/DAILY
@@index([createdAt])         // Sort by newest/oldest

// Question
@@index([quizId])            // Get all questions for a quiz
@@index([quizId, order])     // Get ordered questions for quiz

// QuizAttempt
@@index([userId])                        // Get user's attempts
@@index([quizId])                        // Get all attempts for a quiz
@@index([completedAt])                   // Sort by date
@@index([userId, quizId, completedAt])   // Daily quiz check (compound)
@@index([score])                         // Leaderboard sorting

// Answer
@@index([attemptId])         // Get all answers for an attempt
@@index([questionId])        // Get all answers for a question (analytics)
```

## Common Queries

### Get Quiz with Questions
```typescript
const quiz = await prisma.quiz.findUnique({
  where: { id: quizId },
  include: {
    questions: {
      orderBy: { order: 'asc' }
    }
  }
})
```

### Check Daily Quiz Eligibility
```typescript
async function canTakeDailyQuiz(userId: string, quizId: string): Promise<boolean> {
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
      userId,
      quizId,
      quiz: { type: 'DAILY' },
      completedAt: { gte: resetTime }
    }
  })
  
  return !recentAttempt
}
```

### Submit Quiz Attempt
```typescript
async function submitQuizAttempt(
  userId: string,
  userEmail: string,
  quizId: string,
  answers: { questionId: string; selectedAnswer: OptionKey }[]
) {
  // Get questions with correct answers
  const questions = await prisma.question.findMany({
    where: { quizId },
    select: { id: true, correctAnswer: true }
  })
  
  // Calculate score
  const questionMap = new Map(
    questions.map(q => [q.id, q.correctAnswer])
  )
  
  let score = 0
  const answerData = answers.map(a => {
    const isCorrect = a.selectedAnswer === questionMap.get(a.questionId)
    if (isCorrect) score++
    
    return {
      questionId: a.questionId,
      selectedAnswer: a.selectedAnswer,
      isCorrect
    }
  })
  
  // Create attempt with answers in transaction
  const attempt = await prisma.quizAttempt.create({
    data: {
      userId,
      userEmail,
      quizId,
      score,
      totalQuestions: questions.length,
      answers: {
        create: answerData
      }
    },
    include: {
      answers: {
        include: {
          question: true
        }
      }
    }
  })
  
  return attempt
}
```

### Get Leaderboard
```typescript
// All time leaderboard
async function getAllTimeLeaderboard(limit: number = 100) {
  return await prisma.quizAttempt.findMany({
    take: limit,
    orderBy: [
      { score: 'desc' },
      { completedAt: 'asc' } // Earlier completion time wins ties
    ],
    include: {
      quiz: {
        select: { title: true }
      }
    }
  })
}

// This week leaderboard
async function getWeeklyLeaderboard(limit: number = 100) {
  const now = new Date()
  const vietnamTime = new Date(now.toLocaleString('en-US', { 
    timeZone: 'Asia/Ho_Chi_Minh' 
  }))
  
  // Get Monday of current week at 00:00
  const weekStart = new Date(vietnamTime)
  weekStart.setDate(vietnamTime.getDate() - vietnamTime.getDay() + 1)
  weekStart.setHours(0, 0, 0, 0)
  
  return await prisma.quizAttempt.findMany({
    where: {
      completedAt: { gte: weekStart }
    },
    take: limit,
    orderBy: [
      { score: 'desc' },
      { completedAt: 'asc' }
    ],
    include: {
      quiz: {
        select: { title: true }
      }
    }
  })
}
```

### Get User's Quiz History
```typescript
async function getUserQuizHistory(userId: string) {
  return await prisma.quizAttempt.findMany({
    where: { userId },
    orderBy: { completedAt: 'desc' },
    include: {
      quiz: {
        select: { title: true, type: true }
      }
    }
  })
}
```

### Admin: Create Quiz with Questions
```typescript
async function createQuizWithQuestions(
  quizData: CreateQuizData,
  questionsData: Omit<CreateQuestionData, 'quizId' | 'order'>[]
) {
  return await prisma.quiz.create({
    data: {
      ...quizData,
      questions: {
        create: questionsData.map((q, index) => ({
          ...q,
          order: index + 1
        }))
      }
    },
    include: {
      questions: {
        orderBy: { order: 'asc' }
      }
    }
  })
}
```

### Admin: Update Question
```typescript
async function updateQuestion(
  questionId: string,
  data: Partial<CreateQuestionData>
) {
  return await prisma.question.update({
    where: { id: questionId },
    data
  })
}
```

### Admin: Delete Quiz
```typescript
async function deleteQuiz(quizId: string) {
  // Cascade delete handles questions and attempts
  return await prisma.quiz.delete({
    where: { id: quizId }
  })
}
```

## Seed Data Example

```typescript
// prisma/seed.ts
import { PrismaClient, QuizType } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')
  
  // Create Normal Quiz
  const reactQuiz = await prisma.quiz.create({
    data: {
      title: 'React Basics',
      description: 'Test your knowledge of React fundamentals',
      type: 'NORMAL',
      questions: {
        create: [
          {
            text: 'What is React?',
            optionA: 'A JavaScript library for building user interfaces',
            optionB: 'A database management system',
            optionC: 'A CSS framework',
            optionD: 'A server-side language',
            correctAnswer: 'A',
            explanation: 'React is a JavaScript library developed by Facebook for building user interfaces, particularly single-page applications.',
            order: 1
          },
          {
            text: 'Which hook is used for state management in functional components?',
            optionA: 'useEffect',
            optionB: 'useState',
            optionC: 'useContext',
            optionD: 'useReducer',
            correctAnswer: 'B',
            explanation: 'useState is the most common hook for managing state in functional components.',
            order: 2
          },
          {
            text: 'What does JSX stand for?',
            optionA: 'JavaScript XML',
            optionB: 'Java Syntax Extension',
            optionC: 'JavaScript Extension',
            optionD: 'Java Server Extension',
            correctAnswer: 'A',
            explanation: 'JSX stands for JavaScript XML. It allows us to write HTML in React.',
            order: 3
          },
          {
            text: 'Which method is used to update state in class components?',
            optionA: 'this.updateState()',
            optionB: 'this.setState()',
            optionC: 'this.changeState()',
            optionD: 'this.modifyState()',
            correctAnswer: 'B',
            explanation: 'In class components, setState() is used to update the component state.',
            order: 4
          },
          {
            text: 'What is the Virtual DOM?',
            optionA: 'A copy of the real DOM kept in memory',
            optionB: 'A new HTML specification',
            optionC: 'A CSS framework',
            optionD: 'A JavaScript engine',
            correctAnswer: 'A',
            explanation: 'The Virtual DOM is a lightweight copy of the actual DOM kept in memory, which React uses to optimize rendering.',
            order: 5
          }
        ]
      }
    }
  })
  
  // Create Daily Quiz
  const dailyQuiz = await prisma.quiz.create({
    data: {
      title: 'Daily Challenge',
      description: 'Complete your daily quiz challenge!',
      type: 'DAILY',
      questions: {
        create: [
          {
            text: 'What is TypeScript?',
            optionA: 'A superset of JavaScript with static typing',
            optionB: 'A replacement for JavaScript',
            optionC: 'A CSS preprocessor',
            optionD: 'A database query language',
            correctAnswer: 'A',
            explanation: 'TypeScript is a superset of JavaScript that adds optional static typing.',
            order: 1
          },
          {
            text: 'Which keyword is used to define a variable that cannot be reassigned?',
            optionA: 'var',
            optionB: 'let',
            optionC: 'const',
            optionD: 'static',
            correctAnswer: 'C',
            explanation: 'The const keyword creates a read-only reference to a value.',
            order: 2
          },
          {
            text: 'What does API stand for?',
            optionA: 'Application Programming Interface',
            optionB: 'Advanced Programming Integration',
            optionC: 'Automated Program Interaction',
            optionD: 'Application Process Integration',
            correctAnswer: 'A',
            explanation: 'API stands for Application Programming Interface.',
            order: 3
          }
        ]
      }
    }
  })
  
  console.log('✅ Seeding completed!')
  console.log(`Created quizzes:`)
  console.log(`- ${reactQuiz.title} (${reactQuiz.type})`)
  console.log(`- ${dailyQuiz.title} (${dailyQuiz.type})`)
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

## Migration Commands

```bash
# Create initial migration
npx prisma migrate dev --name init

# Generate Prisma Client
npx prisma generate

# Run seed
npx prisma db seed

# Open Prisma Studio (GUI)
npx prisma studio

# Reset database (careful!)
npx prisma migrate reset

# Deploy migrations to production
npx prisma migrate deploy
```

## Environment Variables

```bash
# .env.local
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"

# For Supabase
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres"
```

---

**Notes:**
- Always use transactions for multi-step operations
- Use proper indexes for query performance
- Cascade deletes are configured for data integrity
- All timestamps use UTC, convert to Vietnam time in application layer