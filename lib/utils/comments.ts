/**
 * Comment validation utilities
 * Provides validation logic for comment content with character limits
 */

export interface CommentValidationResult {
  isValid: boolean
  error?: string
}

/**
 * Validation error messages
 */
export const COMMENT_VALIDATION_ERRORS = {
  EMPTY: 'Comment cannot be empty',
  TOO_LONG: 'Comment must not exceed 500 characters',
  WHITESPACE_ONLY: 'Comment cannot contain only whitespace'
} as const

/**
 * Comment content constraints
 */
export const COMMENT_CONSTRAINTS = {
  MIN_LENGTH: 1,
  MAX_LENGTH: 500
} as const

/**
 * Validates comment content against character limits and content rules
 * 
 * @param content - The comment content to validate
 * @returns CommentValidationResult with isValid flag and optional error message
 * 
 * @example
 * ```typescript
 * const result = validateCommentContent('Hello world')
 * if (!result.isValid) {
 *   console.error(result.error)
 * }
 * ```
 */
export function validateCommentContent(content: string): CommentValidationResult {
  // Runtime guard: check for null/undefined/non-string inputs
  if (content == null || typeof content !== 'string') {
    return {
      isValid: false,
      error: COMMENT_VALIDATION_ERRORS.EMPTY
    }
  }
  
  // Trim whitespace from content
  const trimmed = content.trim()
  const length = trimmed.length
  
  // Check if content is empty after trimming
  if (length === 0) {
    return {
      isValid: false,
      error: COMMENT_VALIDATION_ERRORS.EMPTY
    }
  }
  
  // Check if content exceeds maximum length
  if (length > COMMENT_CONSTRAINTS.MAX_LENGTH) {
    return {
      isValid: false,
      error: `${COMMENT_VALIDATION_ERRORS.TOO_LONG} (currently ${length})`
    }
  }
  
  // Content is valid
  return {
    isValid: true
  }
}

/**
 * Gets the character count of trimmed content
 * Useful for displaying character counters in UI
 * 
 * @param content - The comment content to count
 * @returns The number of characters after trimming whitespace
 */
export function getCommentCharacterCount(content: string): number {
  return content.trim().length
}

/**
 * Checks if content is within valid length range
 * 
 * @param content - The comment content to check
 * @returns true if content length is between MIN_LENGTH and MAX_LENGTH
 */
export function isCommentLengthValid(content: string): boolean {
  const length = getCommentCharacterCount(content)
  return length >= COMMENT_CONSTRAINTS.MIN_LENGTH && length <= COMMENT_CONSTRAINTS.MAX_LENGTH
}
