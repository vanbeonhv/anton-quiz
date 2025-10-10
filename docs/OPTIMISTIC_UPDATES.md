# Optimistic Updates Implementation

This document describes the optimistic updates implementation for React Query mutations in the application.

## Overview

Optimistic updates provide immediate UI feedback by updating the cache before the server responds. This creates a more responsive user experience, especially for quick actions like submitting answers or creating tags.

## Implemented Optimistic Updates

### 1. Question Attempt Submission (`useSubmitQuestionAttempt`)

**What it does:**
- Immediately shows the selected answer as submitted
- Updates user stats (questions answered, correct answers, streaks)
- Marks the question as attempted/solved

**Rollback scenarios:**
- Network errors
- Server validation errors
- Authentication failures

**Example usage:**
```typescript
const submitMutation = useSubmitQuestionAttempt()

submitMutation.mutate({ questionId: 'q1', data: { selectedAnswer: 'A' } })
// UI immediately shows answer as submitted, stats updated
```

### 2. Bulk Tag Assignment (`useBulkTagAssignment`)

**What it does:**
- Immediately updates question tags in the admin interface
- Updates tag statistics (question counts)
- Supports add, remove, and replace operations

**Rollback scenarios:**
- Bulk operation failures
- Permission errors
- Invalid tag/question combinations

### 3. Tag Creation (`useCreateTag`)

**What it does:**
- Immediately adds the new tag to the tags list
- Shows the tag as available for selection
- Updates tags with stats list

**Rollback scenarios:**
- Duplicate tag names
- Validation errors
- Server errors

### 4. Question Creation (`useCreateQuestion`)

**What it does:**
- Immediately adds the new question to the admin questions list
- Shows the question with optimistic data
- Updates pagination counts

**Rollback scenarios:**
- Validation errors
- Duplicate question numbers
- Tag assignment failures

## Implementation Details

### Utility Functions

The optimistic updates use utility functions in `lib/utils/optimisticUpdates.ts`:

- `createOptimisticAttempt()` - Creates temporary attempt data
- `updateUserStatsOptimistically()` - Updates user statistics
- `updateQuestionTagsOptimistically()` - Handles tag operations on questions
- `updateTagStatsOptimistically()` - Updates tag statistics

### Mutation Pattern

Each optimistic mutation follows this pattern:

```typescript
export function useOptimisticMutation() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: apiFunction,
    onMutate: async (variables) => {
      // 1. Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: ['relevant-data'] })
      
      // 2. Snapshot current data
      const previousData = queryClient.getQueryData(['relevant-data'])
      
      // 3. Optimistically update cache
      queryClient.setQueryData(['relevant-data'], optimisticData)
      
      // 4. Return context for rollback
      return { previousData }
    },
    onError: (err, variables, context) => {
      // 5. Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(['relevant-data'], context.previousData)
      }
    },
    onSuccess: () => {
      // 6. Invalidate to sync with server
      queryClient.invalidateQueries({ queryKey: ['relevant-data'] })
    }
  })
}
```

## Best Practices

### When to Use Optimistic Updates

✅ **Good candidates:**
- Quick user actions (submitting answers, creating simple entities)
- Operations with predictable outcomes
- Actions where immediate feedback improves UX

❌ **Avoid for:**
- Complex operations with unpredictable side effects
- Operations that depend on server-side calculations
- Actions with high failure rates

### Error Handling

- Always implement rollback in `onError`
- Provide clear error messages to users
- Consider retry mechanisms for network errors
- Log errors for debugging

### Cache Management

- Cancel ongoing queries before optimistic updates
- Use `onSettled` to ensure cache consistency
- Invalidate related queries after successful mutations
- Be careful with cache key hierarchies

## Testing

Optimistic updates are tested in `lib/utils/__tests__/optimisticUpdates.test.ts`:

```bash
npm test optimisticUpdates.test.ts
```

Tests cover:
- Utility function behavior
- Correct data transformations
- Edge cases and error scenarios
- Rollback mechanisms

## Monitoring

To monitor optimistic update performance:

1. Check React Query DevTools for cache state
2. Monitor error rates for optimistic mutations
3. Track user experience metrics (perceived performance)
4. Log rollback frequency

## User Experience Impact

### Before Optimistic Updates
1. User clicks "Submit Answer"
2. Button shows loading state
3. Wait for server response (200-500ms)
4. UI updates with result
5. Stats update after another request

### After Optimistic Updates
1. User clicks "Submit Answer"
2. **Immediate UI feedback:**
   - Answer marked as selected
   - User stats updated instantly
   - Question marked as attempted
3. Server confirms in background
4. Rollback only if error occurs

This reduces perceived latency from 500ms+ to near-instant feedback.

## Future Enhancements

Potential improvements:
- Conflict resolution for concurrent updates
- Partial rollbacks for complex operations
- Optimistic updates for more mutation types
- Better error recovery strategies
- Offline support with optimistic updates
- Batch optimistic updates for multiple operations