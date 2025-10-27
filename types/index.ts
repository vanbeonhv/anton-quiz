// ============================================
// ENUMS
// ============================================

export type OptionKey = 'A' | 'B' | 'C' | 'D'

// NEW ENUMS for Enhanced Scoreboard System
export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD'

// ============================================
// DATABASE MODELS
// ============================================

export interface Question {
  id: string
  number: number    // For display as "#1", "#2", etc.
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
  currentStreak: number
  longestStreak: number
  lastAnsweredDate?: Date
  createdAt: Date
  updatedAt: Date
}

// ============================================
// EXTENDED TYPES (with relations)
// ============================================

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
  totalDailyPoints: number // Mapped from totalQuestionsAnswered
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

export interface CreateQuestionData {
  text: string
  optionA: string
  optionB: string
  optionC: string
  optionD: string
  correctAnswer: OptionKey
  explanation?: string
  difficulty: Difficulty
  tags?: string[]
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
  avatarUrl?: string | null
  displayName?: string | null
  totalDailyPoints: number
  dailyQuizStreak: number
  updatedAt: Date
}

export interface QuestionsSolvedLeaderboardEntry {
  rank: number
  userId: string
  userEmail: string
  avatarUrl?: string | null
  displayName?: string | null
  totalCorrectAnswers: number
  totalQuestionsAnswered: number
  accuracyPercentage: number
  updatedAt: Date
}

export type ScoreboardType = 'questions-solved' | 'daily-points'

// ============================================
// API RESPONSE TYPES
// ============================================

export interface LegacyUserStats {
  expPoints: number
  ranking: number
  totalUsers: number
}

// Question without sensitive data for practice
export type QuestionForPractice = Omit<Question, 'correctAnswer' | 'explanation'>

// For question results with full details
export interface QuestionResultAnswer {
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