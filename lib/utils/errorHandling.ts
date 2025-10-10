import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useCallback } from 'react'

/**
 * Enhanced API Error class with additional context
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string,
    public context?: Record<string, any>
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

/**
 * Network Error class for connection issues
 */
export class NetworkError extends Error {
  constructor(message: string = 'Network connection failed') {
    super(message)
    this.name = 'NetworkError'
  }
}

/**
 * Validation Error class for form validation issues
 */
export class ValidationError extends Error {
  constructor(
    message: string,
    public field?: string,
    public errors?: Record<string, string[]>
  ) {
    super(message)
    this.name = 'ValidationError'
  }
}

/**
 * Error types for categorization
 */
export enum ErrorType {
  NETWORK = 'NETWORK',
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  NOT_FOUND = 'NOT_FOUND',
  SERVER = 'SERVER',
  UNKNOWN = 'UNKNOWN'
}

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

/**
 * Error context interface
 */
export interface ErrorContext {
  component?: string
  action?: string
  userId?: string
  timestamp?: Date
  metadata?: Record<string, any>
}

/**
 * Categorize error based on type and status
 */
export const categorizeError = (error: unknown): ErrorType => {
  if (error instanceof NetworkError) {
    return ErrorType.NETWORK
  }
  
  if (error instanceof ValidationError) {
    return ErrorType.VALIDATION
  }
  
  if (error instanceof ApiError) {
    switch (error.status) {
      case 401:
        return ErrorType.AUTHENTICATION
      case 403:
        return ErrorType.AUTHORIZATION
      case 404:
        return ErrorType.NOT_FOUND
      case 422:
        return ErrorType.VALIDATION
      case 500:
      case 502:
      case 503:
      case 504:
        return ErrorType.SERVER
      default:
        return ErrorType.UNKNOWN
    }
  }
  
  return ErrorType.UNKNOWN
}

/**
 * Determine error severity
 */
export const getErrorSeverity = (error: unknown): ErrorSeverity => {
  const type = categorizeError(error)
  
  switch (type) {
    case ErrorType.NETWORK:
    case ErrorType.SERVER:
      return ErrorSeverity.HIGH
    case ErrorType.AUTHENTICATION:
    case ErrorType.AUTHORIZATION:
      return ErrorSeverity.MEDIUM
    case ErrorType.VALIDATION:
    case ErrorType.NOT_FOUND:
      return ErrorSeverity.LOW
    default:
      return ErrorSeverity.MEDIUM
  }
}

/**
 * Enhanced retry logic with exponential backoff
 */
export interface RetryConfig {
  maxAttempts: number
  baseDelay: number
  maxDelay: number
  backoffFactor: number
  retryableErrors: ErrorType[]
}

export const defaultRetryConfig: RetryConfig = {
  maxAttempts: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffFactor: 2,
  retryableErrors: [ErrorType.NETWORK, ErrorType.SERVER]
}

/**
 * Enhanced retry logic for React Query
 */
export const shouldRetryWithConfig = (
  error: unknown,
  attemptCount: number,
  config: Partial<RetryConfig> = {}
): boolean => {
  const finalConfig = { ...defaultRetryConfig, ...config }
  
  // Don't retry if we've exceeded max attempts
  if (attemptCount >= finalConfig.maxAttempts) {
    return false
  }
  
  const errorType = categorizeError(error)
  
  // Only retry specific error types
  return finalConfig.retryableErrors.includes(errorType)
}

/**
 * Calculate retry delay with exponential backoff
 */
export const getRetryDelay = (
  attemptCount: number,
  config: Partial<RetryConfig> = {}
): number => {
  const finalConfig = { ...defaultRetryConfig, ...config }
  
  const delay = finalConfig.baseDelay * Math.pow(finalConfig.backoffFactor, attemptCount - 1)
  return Math.min(delay, finalConfig.maxDelay)
}

/**
 * Enhanced API response handler with better error categorization
 */
export const handleApiResponse = async <T>(
  response: Response,
  context?: ErrorContext
): Promise<T> => {
  if (!response.ok) {
    let errorMessage = 'An error occurred'
    let errorCode: string | undefined
    let errorData: any = {}
    
    try {
      errorData = await response.json()
      errorMessage = errorData.error || errorData.message || errorMessage
      errorCode = errorData.code
    } catch {
      // If response is not JSON, use status text
      errorMessage = `HTTP ${response.status}: ${response.statusText}`
    }
    
    // Create appropriate error type based on status
    if (response.status === 422 && errorData.errors) {
      throw new ValidationError(errorMessage, undefined, errorData.errors)
    }
    
    throw new ApiError(errorMessage, response.status, errorCode, {
      ...context,
      responseData: errorData
    })
  }
  
  return response.json()
}

/**
 * Network-aware fetch wrapper
 */
export const fetchWithNetworkHandling = async (
  url: string,
  options?: RequestInit,
  context?: ErrorContext
): Promise<Response> => {
  try {
    const response = await fetch(url, options)
    return response
  } catch (error) {
    // Check if it's a network error
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new NetworkError('Unable to connect to the server. Please check your internet connection.')
    }
    
    throw error
  }
}

/**
 * User-friendly error messages mapping
 */
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof ValidationError) {
    return error.message || 'Please check your input and try again'
  }
  
  if (error instanceof NetworkError) {
    return 'Connection failed. Please check your internet connection and try again.'
  }
  
  if (error instanceof ApiError) {
    switch (error.status) {
      case 401:
        return 'Please log in to continue'
      case 403:
        return 'You do not have permission to perform this action'
      case 404:
        return 'The requested resource was not found'
      case 409:
        return 'This action conflicts with existing data'
      case 422:
        return 'Please check your input and try again'
      case 429:
        return 'Too many requests. Please wait a moment and try again.'
      case 500:
        return 'Server error. Please try again later.'
      case 502:
      case 503:
      case 504:
        return 'Service temporarily unavailable. Please try again later.'
      default:
        return error.message || 'Something went wrong. Please try again.'
    }
  }
  
  if (error instanceof Error) {
    return error.message
  }
  
  return 'An unexpected error occurred'
}

/**
 * Log error for debugging and monitoring
 */
export const logError = (
  error: unknown,
  context?: ErrorContext
): void => {
  const errorType = categorizeError(error)
  const severity = getErrorSeverity(error)
  
  const logData = {
    error: {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      type: errorType,
      severity
    },
    context: {
      ...context,
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined
    }
  }
  
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error logged:', logData)
  }
  
  // In production, you might want to send to an error tracking service
  // Example: Sentry, LogRocket, etc.
  // if (process.env.NODE_ENV === 'production') {
  //   sendToErrorTracking(logData)
  // }
}

/**
 * Custom error handling hook
 */
export const useErrorHandler = () => {
  const router = useRouter()
  
  const handleError = useCallback((
    error: unknown,
    context?: ErrorContext,
    options?: {
      showToast?: boolean
      redirect?: string
      onError?: (error: unknown) => void
    }
  ) => {
    const { showToast = true, redirect, onError } = options || {}
    
    // Log the error
    logError(error, context)
    
    const errorType = categorizeError(error)
    const userMessage = getErrorMessage(error)
    
    // Show toast notification if enabled
    if (showToast) {
      const severity = getErrorSeverity(error)
      
      switch (severity) {
        case ErrorSeverity.CRITICAL:
        case ErrorSeverity.HIGH:
          toast.error(userMessage, {
            duration: 6000,
            action: errorType === ErrorType.NETWORK ? {
              label: 'Retry',
              onClick: () => window.location.reload()
            } : undefined
          })
          break
        case ErrorSeverity.MEDIUM:
          toast.error(userMessage, { duration: 4000 })
          break
        case ErrorSeverity.LOW:
          toast.error(userMessage, { duration: 3000 })
          break
      }
    }
    
    // Handle authentication errors
    if (errorType === ErrorType.AUTHENTICATION) {
      router.push('/login')
      return
    }
    
    // Handle custom redirects
    if (redirect) {
      router.push(redirect)
      return
    }
    
    // Call custom error handler if provided
    if (onError) {
      onError(error)
    }
  }, [router])
  
  return { handleError }
}

/**
 * Mutation error handler for React Query
 */
export const handleMutationError = (
  error: unknown,
  context?: ErrorContext
): string => {
  logError(error, context)
  return getErrorMessage(error)
}

/**
 * Query error handler for React Query
 */
export const handleQueryError = (
  error: unknown,
  context?: ErrorContext
): void => {
  logError(error, context)
  
  const errorType = categorizeError(error)
  
  // Only show toast for certain error types in queries
  if ([ErrorType.AUTHENTICATION, ErrorType.AUTHORIZATION].includes(errorType)) {
    const message = getErrorMessage(error)
    toast.error(message)
  }
}

/**
 * Utility to create error context
 */
export const createErrorContext = (
  component: string,
  action: string,
  metadata?: Record<string, any>
): ErrorContext => ({
  component,
  action,
  timestamp: new Date(),
  metadata
})