// Re-export enhanced error handling utilities for backward compatibility
export {
  ApiError,
  NetworkError,
  ValidationError,
  ErrorType,
  ErrorSeverity,
  handleApiResponse,
  handleMutationError,
  shouldRetryWithConfig,
  fetchWithNetworkHandling,
  getErrorMessage,
  logError,
  createErrorContext
} from '@/lib/utils/errorHandling'

// Keep the old shouldRetry function name for backward compatibility
export { shouldRetryWithConfig as shouldRetry } from '@/lib/utils/errorHandling'

// Legacy compatibility - keep the old shouldRetry function for existing code
export const shouldRetryLegacy = (error: unknown, attemptCount: number): boolean => {
  // Don't retry more than 3 times
  if (attemptCount >= 3) return false
  
  // Retry on network errors or 5xx server errors
  if (error instanceof Error && 'status' in error) {
    const status = (error as any).status
    return status ? status >= 500 : true
  }
  
  // Retry on network errors (no status code)
  return true
}