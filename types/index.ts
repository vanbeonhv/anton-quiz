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