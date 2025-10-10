// ============================================
// ENUMS
// ============================================

export type QuizType = 'NORMAL' | 'DAILY'
export type OptionKey = 'A' | 'B' | 'C' | 'D'

// NEW ENUMS for Enhanced Scoreboard System
export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD'
export type AttemptSource = 'INDIVIDUAL' | 'DAILY_QUIZ' | 'NORMAL_QUIZ'

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
  number: number    // For display as "#1", "#2", etc.
  quizId?: string   // Make optional - questions can exist without quiz
  text: string
  optionA: string
  optionB: string
  optionC: string
  optionD: string
  correctAnswer?: OptionKey
  explanation?: string
  difficulty: Difficulty
  isActive: boolean
  createdAt: Date
  updatedAt: Date
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

// NEW DATABASE MODELS for Enhanced Scoreboard System
export interface Tag {
  id: string
  name: string
  description?: string
  color?: string
  createdAt: Date
}

export interface QuestionTag {
  id: string
  questionId: string
  tagId: string
}

export interface QuestionAttempt {
  id: string
  questionId: string
  userId: string
  userEmail: string
  selectedAnswer: OptionKey
  isCorrect: boolean
  source: AttemptSource
  quizAttemptId?: string
  answeredAt: Date
}

export interface UserStats {
  id: string
  userId: string
  userEmail: string
  totalQuestionsAnswered: number
  totalCorrectAnswers: number
  easyQuestionsAnswered: number
  easyCorrectAnswers: number
  mediumQuestionsAnswered: number
  mediumCorrectAnswers: number
  hardQuestionsAnswered: number
  hardCorrectAnswers: number
  totalQuizzesTaken: number
  dailyQuizzesTaken: number
  currentStreak: number
  longestStreak: number
  lastAnsweredDate?: Date
  createdAt: Date
  updatedAt: Date
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

// For API responses with computed stats
export interface QuizWithComputedStats extends Quiz {
  questionCount: number
  attemptCount: number
}

export interface QuizAttemptWithDetails extends QuizAttempt {
  quiz: Quiz
  answers: AnswerWithQuestion[]
}

export interface AnswerWithQuestion extends Answer {
  question: Question
}

// NEW EXTENDED TYPES for Enhanced Scoreboard System
export interface QuestionWithTags extends Question { 
  tags: Tag[]
  userAttempt?: QuestionAttempt, // If user has attempted this question
  isSolved?: boolean,
  hasAttempted?: boolean
}

export interface TagWithStats extends Tag {
  questionCount: number // Computed field
}

export interface UserStatsWithComputed extends UserStats {
  accuracyPercentage: number // Computed field
  tagStats: TagStats[] // Computed field
  totalDailyPoints: number // Mapped from dailyQuizzesTaken
  dailyQuizStreak: number // Mapped from currentStreak
}

export interface TagStats {
  tagId: string
  tagName: string
  totalQuestions: number
  answeredQuestions: number
  correctAnswers: number
  accuracyPercentage: number
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

// NEW FORM DATA TYPES for Enhanced Scoreboard System
export interface CreateTagData {
  name: string
  description?: string
  color?: string
}

export interface SubmitQuestionAttemptData {
  questionId: string
  selectedAnswer: OptionKey
}

export interface QuestionFilters {
  tags: string[]
  difficulty: Difficulty[]
  status: 'all' | 'solved' | 'unsolved'
  search?: string
  sortBy?: 'newest' | 'difficulty' | 'most-attempted' | 'number'
  page?: number
  pageSize?: number
}

// ============================================
// LEADERBOARD TYPES
// ============================================

export interface LeaderboardEntry {
  rank: number
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

// NEW LEADERBOARD TYPES for Enhanced Scoreboard System
export interface DailyPointsLeaderboardEntry {
  rank: number
  userId: string
  userEmail: string
  totalDailyPoints: number // Mapped from dailyQuizzesTaken
  dailyQuizStreak: number // Mapped from currentStreak
  updatedAt: Date
}

export interface QuestionsSolvedLeaderboardEntry {
  rank: number
  userId: string
  userEmail: string
  totalCorrectAnswers: number
  totalQuestionsAnswered: number
  accuracyPercentage: number
  updatedAt: Date
}

export type ScoreboardType = 'daily-points' | 'questions-solved'

// ============================================
// API RESPONSE TYPES
// ============================================

export interface LegacyUserStats {
  expPoints: number
  ranking: number
  totalUsers: number
}

export interface DailyQuizCheck {
  canTake: boolean
  quizId?: string
  nextResetTime?: string
  message: string
}

// For quiz taking (without sensitive data like correct answers)
export interface QuizForTaking extends Quiz {
  questions: Omit<Question, 'correctAnswer' | 'explanation' | 'createdAt' | 'quizId'>[]
}

// Question without sensitive data for quiz taking
export type QuestionForTaking = Omit<Question, 'correctAnswer' | 'explanation' | 'createdAt' | 'quizId'>

// For quiz results with full question details
export interface QuizResultAnswer {
  questionId: string
  selectedAnswer: OptionKey
  isCorrect: boolean
  question: {
    correctAnswer: OptionKey
    explanation?: string
    text: string
    optionA: string
    optionB: string
    optionC: string
    optionD: string
  }
}

export interface QuizResults {
  score: number
  totalQuestions: number
  answers: QuizResultAnswer[]
}

// Pagination response type
export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}