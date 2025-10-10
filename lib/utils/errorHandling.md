# Error Handling Utilities

This document describes the comprehensive error handling utilities implemented for the React Query migration.

## Overview

The error handling system provides:
- Centralized error categorization and handling
- Custom error types for different scenarios
- Enhanced retry mechanisms with exponential backoff
- User-friendly error messages
- Error logging and monitoring
- Custom React hook for component-level error handling

## Error Types

### ApiError
Standard API errors with status codes and error codes.

### NetworkError
Connection and network-related errors.

### ValidationError
Form validation and input errors with field-specific information.

## Error Categories

- `NETWORK`: Connection issues, timeouts
- `VALIDATION`: Input validation errors
- `AUTHENTICATION`: 401 errors, login required
- `AUTHORIZATION`: 403 errors, permission denied
- `NOT_FOUND`: 404 errors, resource not found
- `SERVER`: 5xx server errors
- `UNKNOWN`: Unclassified errors

## Usage Examples

### Using the Error Handling Hook

```typescript
import { useErrorHandler } from '@/lib/utils/errorHandling'

function MyComponent() {
  const { handleError } = useErrorHandler()
  
  const handleSubmit = async () => {
    try {
      await someApiCall()
    } catch (error) {
      handleError(error, {
        component: 'MyComponent',
        action: 'submit'
      })
    }
  }
}
```

### Custom Error Handling Options

```typescript
const { handleError } = useErrorHandler()

// Handle error with custom options
handleError(error, context, {
  showToast: true,
  redirect: '/login',
  onError: (error) => {
    // Custom error handling logic
  }
})
```

### Enhanced Retry Configuration

```typescript
import { shouldRetryWithConfig, defaultRetryConfig } from '@/lib/utils/errorHandling'

const customRetryConfig = {
  ...defaultRetryConfig,
  maxAttempts: 5,
  baseDelay: 2000
}

// In React Query mutation
useMutation({
  mutationFn: apiCall,
  retry: (failureCount, error) => shouldRetryWithConfig(error, failureCount, customRetryConfig),
  retryDelay: (attemptIndex) => getRetryDelay(attemptIndex, customRetryConfig)
})
```

### API Functions with Error Context

```typescript
import { createErrorContext } from '@/lib/utils/errorHandling'

const context = createErrorContext('UserService', 'updateProfile', {
  userId: '123',
  fields: ['name', 'email']
})

// Context is automatically passed to error handlers
```

## Error Severity Levels

- `LOW`: Validation errors, not found errors
- `MEDIUM`: Authentication, authorization errors
- `HIGH`: Network errors, server errors
- `CRITICAL`: System-level failures

## Automatic Features

### Toast Notifications
- Automatic toast notifications based on error severity
- Different durations for different severity levels
- Retry actions for network errors

### Retry Mechanisms
- Exponential backoff with configurable parameters
- Automatic retry for network and server errors
- Maximum retry limits to prevent infinite loops

### Error Logging
- Automatic error logging with context
- Development console logging
- Production-ready for external error tracking services

## Integration with React Query

The error handling utilities are fully integrated with React Query:

- Enhanced retry logic with exponential backoff
- Automatic error categorization
- Context-aware error messages
- Optimistic update rollback on errors

## Configuration

### Default Retry Configuration
```typescript
{
  maxAttempts: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffFactor: 2,
  retryableErrors: [ErrorType.NETWORK, ErrorType.SERVER]
}
```

### Customizing Error Messages
Error messages are automatically generated based on error type and status code, but can be customized by extending the `getErrorMessage` function.

## Best Practices

1. **Use Error Context**: Always provide context when handling errors to improve debugging
2. **Appropriate Retry Logic**: Only retry network and server errors, not validation or authentication errors
3. **User-Friendly Messages**: The system automatically provides user-friendly messages, but you can customize them
4. **Error Logging**: All errors are automatically logged with context for debugging
5. **Toast Notifications**: Use the built-in toast system for consistent user feedback

## Migration Notes

The new error handling system is backward compatible with existing code. Existing `handleMutationError` and `shouldRetry` functions continue to work, but now use the enhanced error handling under the hood.