import { prisma } from '@/lib/db'
import dayjs from '@/lib/dayjs'
import { Difficulty } from '@prisma/client'

// Configuration constants
export const DAILY_QUESTION_CONFIG = {
  salt: 'anton-daily-question-2024',
  timezone: 'Asia/Bangkok', // GMT+7
  resetHour: 8,
  resetMinute: 0,
} as const

export const DAILY_POINTS = {
  EASY: 10,
  MEDIUM: 25,
  HARD: 50,
} as const

export interface DailyQuestionResult {
  questionNumber: number
  questionId: string | null
  question: any | null
  resetTime: Date
  timeUntilReset: string
}

/**
 * Calculate a deterministic question number based on the current date and salt
 * @param date - The date to calculate for (defaults to now in GMT+7)
 * @param salt - Salt value for randomization
 * @returns A question number
 */
export function calculateDailyQuestionNumber(
  date: Date = new Date(),
  salt: string = DAILY_QUESTION_CONFIG.salt
): number {
  // Convert to GMT+7 timezone and get date string (YYYY-MM-DD)
  const dateInTimezone = dayjs(date).tz(DAILY_QUESTION_CONFIG.timezone)
  const dateString = dateInTimezone.format('YYYY-MM-DD')
  
  // Combine date with salt
  const combined = `${dateString}-${salt}`
  
  // Generate a hash using simple char code sum
  let hash = 0
  for (let i = 0; i < combined.length; i++) {
    hash = ((hash << 5) - hash) + combined.charCodeAt(i)
    hash = hash & hash // Convert to 32-bit integer
  }
  
  // Return absolute value to ensure positive number
  return Math.abs(hash)
}

/**
 * Get the next reset time (8 AM GMT+7)
 * @param now - Current time (defaults to now)
 * @returns Date object representing next reset time
 */
export function getNextResetTime(now: Date = new Date()): Date {
  const currentTime = dayjs(now).tz(DAILY_QUESTION_CONFIG.timezone)
  
  // Create reset time for today
  let resetTime = currentTime
    .hour(DAILY_QUESTION_CONFIG.resetHour)
    .minute(DAILY_QUESTION_CONFIG.resetMinute)
    .second(0)
    .millisecond(0)
  
  // If current time is past today's reset time, move to tomorrow
  if (currentTime.isAfter(resetTime)) {
    resetTime = resetTime.add(1, 'day')
  }
  
  return resetTime.toDate()
}

/**
 * Format time until reset in human-readable format (e.g., "5h 23m")
 * @param resetTime - The reset time to calculate from
 * @returns Formatted string like "5h 23m" or "23m"
 */
export function formatTimeUntilReset(resetTime: Date): string {
  const now = dayjs().tz(DAILY_QUESTION_CONFIG.timezone)
  const reset = dayjs(resetTime).tz(DAILY_QUESTION_CONFIG.timezone)
  
  const diffMinutes = reset.diff(now, 'minute')
  
  if (diffMinutes < 0) {
    return '0m'
  }
  
  const hours = Math.floor(diffMinutes / 60)
  const minutes = diffMinutes % 60
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  
  return `${minutes}m`
}

/**
 * Get today's daily question with fallback logic
 * @param date - The date to get the daily question for (defaults to now)
 * @returns Daily question result with question data and reset info
 */
export async function getDailyQuestion(
  date: Date = new Date()
): Promise<DailyQuestionResult> {
  const resetTime = getNextResetTime(date)
  const timeUntilReset = formatTimeUntilReset(resetTime)
  
  // Calculate the question number for today
  const questionNumber = calculateDailyQuestionNumber(date)
  
  // Get total count of active questions
  const totalActiveQuestions = await prisma.question.count({
    where: { isActive: true }
  })
  
  if (totalActiveQuestions === 0) {
    return {
      questionNumber,
      questionId: null,
      question: null,
      resetTime,
      timeUntilReset,
    }
  }
  
  // Use modulo to map to available question range
  const targetNumber = (questionNumber % totalActiveQuestions) + 1
  
  // Try to find question with exact number
  let question = await prisma.question.findFirst({
    where: {
      number: targetNumber,
      isActive: true,
    },
    include: {
      tags: {
        include: {
          tag: true,
        },
      },
    },
  })
  
  // Fallback: try adjacent numbers if exact match not found
  if (!question) {
    question = await prisma.question.findFirst({
      where: {
        number: { gte: targetNumber },
        isActive: true,
      },
      orderBy: { number: 'asc' },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    })
  }
  
  // Last resort: get any active question
  if (!question) {
    question = await prisma.question.findFirst({
      where: { isActive: true },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    })
  }
  
  return {
    questionNumber: question?.number || targetNumber,
    questionId: question?.id || null,
    question,
    resetTime,
    timeUntilReset,
  }
}

/**
 * Check if a user has already attempted today's daily question
 * @param userId - The user's ID
 * @param questionId - The question ID to check
 * @returns True if user has attempted today's daily question
 */
export async function hasAttemptedDailyQuestion(
  userId: string,
  questionId: string
): Promise<boolean> {
  // Get start of today in GMT+7
  const todayStart = dayjs()
    .tz(DAILY_QUESTION_CONFIG.timezone)
    .startOf('day')
    .toDate()
  
  // Get end of today in GMT+7
  const todayEnd = dayjs()
    .tz(DAILY_QUESTION_CONFIG.timezone)
    .endOf('day')
    .toDate()
  
  // Check if there's an attempt for this user + question + today
  const attempt = await prisma.questionAttempt.findFirst({
    where: {
      userId,
      questionId,
      answeredAt: {
        gte: todayStart,
        lte: todayEnd,
      },
    },
  })
  
  return attempt !== null
}

/**
 * Get daily points based on difficulty level
 * @param difficulty - Question difficulty
 * @returns Points to award
 */
export function getDailyPoints(difficulty: Difficulty): number {
  switch (difficulty) {
    case 'EASY':
      return DAILY_POINTS.EASY
    case 'MEDIUM':
      return DAILY_POINTS.MEDIUM
    case 'HARD':
      return DAILY_POINTS.HARD
    default:
      return DAILY_POINTS.MEDIUM
  }
}
