/**
 * Session Storage Utilities for Pending Answer Management
 * Handles storage, retrieval, and validation of pending answers with expiration
 */

const PENDING_ANSWER_KEY = 'pendingAnswer'
const EXPIRATION_TIME_MS = 30 * 60 * 1000 // 30 minutes

export interface PendingAnswer {
  questionId: string
  answer: string
  isDailyQuestion: boolean
  timestamp: number
}

/**
 * Check if session storage is available in the current environment
 */
function isSessionStorageAvailable(): boolean {
  try {
    const test = '__session_storage_test__'
    sessionStorage.setItem(test, test)
    sessionStorage.removeItem(test)
    return true
  } catch {
    return false
  }
}

/**
 * Check if a pending answer has expired based on timestamp
 */
function isExpired(timestamp: number): boolean {
  const now = Date.now()
  return now - timestamp > EXPIRATION_TIME_MS
}

/**
 * Validate pending answer data structure
 */
function isValidPendingAnswer(data: unknown): data is PendingAnswer {
  if (!data || typeof data !== 'object') {
    return false
  }

  const answer = data as Record<string, unknown>

  return (
    typeof answer.questionId === 'string' &&
    answer.questionId.length > 0 &&
    typeof answer.answer === 'string' &&
    answer.answer.length > 0 &&
    typeof answer.isDailyQuestion === 'boolean' &&
    typeof answer.timestamp === 'number' &&
    answer.timestamp > 0
  )
}

/**
 * Store a pending answer in session storage
 * @param questionId - The ID of the question
 * @param answer - The selected answer (e.g., 'A', 'B', 'C', 'D')
 * @param isDailyQuestion - Whether this is a daily question
 * @returns true if stored successfully, false otherwise
 */
export function storePendingAnswer(
  questionId: string,
  answer: string,
  isDailyQuestion: boolean
): boolean {
  if (!isSessionStorageAvailable()) {
    console.warn('Session storage is not available')
    return false
  }

  try {
    const pendingAnswer: PendingAnswer = {
      questionId,
      answer,
      isDailyQuestion,
      timestamp: Date.now(),
    }

    sessionStorage.setItem(PENDING_ANSWER_KEY, JSON.stringify(pendingAnswer))
    return true
  } catch (error) {
    console.error('Failed to store pending answer:', error)
    return false
  }
}

/**
 * Retrieve a pending answer from session storage
 * @returns The pending answer if valid and not expired, null otherwise
 */
export function getPendingAnswer(): PendingAnswer | null {
  if (!isSessionStorageAvailable()) {
    console.warn('Session storage is not available')
    return null
  }

  try {
    const stored = sessionStorage.getItem(PENDING_ANSWER_KEY)
    
    if (!stored) {
      return null
    }

    const parsed = JSON.parse(stored)

    if (!isValidPendingAnswer(parsed)) {
      console.warn('Invalid pending answer data, clearing storage')
      clearPendingAnswer()
      return null
    }

    if (isExpired(parsed.timestamp)) {
      console.info('Pending answer has expired, clearing storage')
      clearPendingAnswer()
      return null
    }

    return parsed
  } catch (error) {
    console.error('Failed to retrieve pending answer:', error)
    clearPendingAnswer()
    return null
  }
}

/**
 * Clear the pending answer from session storage
 * @returns true if cleared successfully, false otherwise
 */
export function clearPendingAnswer(): boolean {
  if (!isSessionStorageAvailable()) {
    return false
  }

  try {
    sessionStorage.removeItem(PENDING_ANSWER_KEY)
    return true
  } catch (error) {
    console.error('Failed to clear pending answer:', error)
    return false
  }
}

/**
 * Check if a pending answer exists and is valid
 * @returns true if a valid, non-expired pending answer exists
 */
export function hasPendingAnswer(): boolean {
  return getPendingAnswer() !== null
}
