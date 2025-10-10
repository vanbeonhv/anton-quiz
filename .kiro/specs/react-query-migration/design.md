# Design Document

## Overview

This design outlines the migration strategy from direct fetch API calls to React Query throughout the application. The migration will enhance data management with automatic caching, background updates, optimistic updates, and improved error handling. The project already has React Query set up with a QueryProvider and some read operations implemented, so we'll focus on completing the migration for all remaining fetch calls.

## Architecture

### Current State Analysis

The application currently has:
- React Query (@tanstack/react-query) installed and configured
- QueryProvider set up in `components/providers/QueryProvider.tsx`
- Some read operations already migrated in `lib/queries.ts`
- Direct fetch calls remaining in:
  - Admin components for mutations (POST, PUT, DELETE)
  - Individual question page for data fetching
  - Question attempt submission
  - Bulk operations

### Target Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     React Components                        │
├─────────────────────────────────────────────────────────────┤
│  Custom Hooks (useQuery, useMutation, useQueryClient)      │
├─────────────────────────────────────────────────────────────┤
│              API Service Functions                          │
├─────────────────────────────────────────────────────────────┤
│                 React Query Cache                           │
├─────────────────────────────────────────────────────────────┤
│                   HTTP Layer (fetch)                       │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. API Service Layer

Create centralized API service functions with proper TypeScript types:

```typescript
// lib/api/questions.ts
export const questionApi = {
  getQuestion: (id: string): Promise<QuestionWithTags> => { ... },
  createQuestion: (data: CreateQuestionData): Promise<QuestionWithTags> => { ... },
  updateQuestion: (id: string, data: UpdateQuestionData): Promise<QuestionWithTags> => { ... },
  deleteQuestion: (id: string): Promise<void> => { ... },
  submitAttempt: (questionId: string, answer: OptionKey): Promise<AttemptResult> => { ... }
}

// lib/api/tags.ts
export const tagApi = {
  createTag: (data: CreateTagData): Promise<Tag> => { ... },
  updateTag: (id: string, data: UpdateTagData): Promise<Tag> => { ... },
  deleteTag: (id: string): Promise<void> => { ... },
  bulkAssignTags: (data: BulkTagAssignmentData): Promise<BulkOperationResult> => { ... }
}
```

### 2. Custom Hooks Layer

Extend existing `lib/queries.ts` with mutation hooks:

```typescript
// Query hooks (already exist, may need updates)
export const useQuestions = (filters: QuestionFilters) => { ... }
export const useTags = () => { ... }
export const useQuestion = (id: string) => { ... }

// New mutation hooks
export const useCreateQuestion = () => useMutation({ ... })
export const useUpdateQuestion = () => useMutation({ ... })
export const useDeleteQuestion = () => useMutation({ ... })
export const useSubmitQuestionAttempt = () => useMutation({ ... })
export const useCreateTag = () => useMutation({ ... })
export const useUpdateTag = () => useMutation({ ... })
export const useDeleteTag = () => useMutation({ ... })
export const useBulkTagAssignment = () => useMutation({ ... })
```

### 3. Component Integration

Update components to use React Query hooks instead of direct fetch calls:

- Replace `useState` + `useEffect` + `fetch` patterns with `useQuery`
- Replace direct fetch mutations with `useMutation` hooks
- Implement proper loading states and error handling
- Add optimistic updates where appropriate

## Data Models

### Request/Response Types

```typescript
// Mutation request types
interface CreateQuestionData {
  text: string
  optionA: string
  optionB: string
  optionC: string
  optionD: string
  correctAnswer: OptionKey
  explanation?: string
  difficulty: Difficulty
  tagIds: string[]
}

interface UpdateQuestionData extends Partial<CreateQuestionData> {}

interface CreateTagData {
  name: string
  description?: string
}

interface UpdateTagData extends Partial<CreateTagData> {}

interface QuestionAttemptData {
  selectedAnswer: OptionKey
}

interface BulkTagAssignmentData {
  questionIds: string[]
  tagIds: string[]
  action: 'add' | 'remove' | 'replace'
}

// Response types
interface AttemptResult {
  selectedAnswer: OptionKey
  isCorrect: boolean
  question: {
    correctAnswer: OptionKey
    explanation?: string
  }
}

interface BulkOperationResult {
  message: string
  affectedQuestions: number
}
```

## Error Handling

### Global Error Handling Strategy

1. **Network Errors**: Automatic retry with exponential backoff
2. **Validation Errors**: Display field-specific error messages
3. **Authorization Errors**: Redirect to login or show appropriate message
4. **Server Errors**: Show user-friendly error messages with retry options

### Error Handling Implementation

```typescript
// Custom error handling hook
export const useErrorHandler = () => {
  return (error: Error) => {
    if (error.message.includes('401')) {
      // Handle authentication errors
      router.push('/login')
    } else if (error.message.includes('validation')) {
      // Handle validation errors
      toast.error('Please check your input and try again')
    } else {
      // Handle generic errors
      toast.error('Something went wrong. Please try again.')
    }
  }
}

// Mutation with error handling
export const useCreateQuestion = () => {
  const queryClient = useQueryClient()
  const handleError = useErrorHandler()
  
  return useMutation({
    mutationFn: questionApi.createQuestion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-questions'] })
      toast.success('Question created successfully')
    },
    onError: handleError
  })
}
```

## Testing Strategy

### Unit Testing

1. **API Service Functions**: Test all CRUD operations with mock responses
2. **Custom Hooks**: Test query and mutation hooks with React Query Testing Library
3. **Error Handling**: Test error scenarios and recovery mechanisms

### Integration Testing

1. **Component Integration**: Test components with React Query hooks
2. **Cache Invalidation**: Verify proper cache updates after mutations
3. **Optimistic Updates**: Test optimistic update behavior and rollback scenarios

### Testing Tools

- **React Query Testing Library**: For testing hooks and cache behavior
- **MSW (Mock Service Worker)**: For mocking API responses
- **Jest**: For unit tests
- **React Testing Library**: For component integration tests

## Migration Strategy

### Phase 1: API Service Layer
- Create centralized API service functions
- Add proper TypeScript types
- Implement error handling utilities

### Phase 2: Mutation Hooks
- Create mutation hooks for all CRUD operations
- Implement cache invalidation strategies
- Add optimistic updates where appropriate

### Phase 3: Component Migration
- Replace direct fetch calls in admin components
- Update individual question page
- Migrate question attempt submission

### Phase 4: Optimization
- Add optimistic updates for quick actions
- Implement background refetching strategies
- Fine-tune cache invalidation patterns

## Cache Management Strategy

### Query Keys Structure

```typescript
// Hierarchical query key structure
const queryKeys = {
  questions: ['questions'] as const,
  questionsList: (filters: QuestionFilters) => [...queryKeys.questions, 'list', filters] as const,
  questionsDetail: (id: string) => [...queryKeys.questions, 'detail', id] as const,
  
  tags: ['tags'] as const,
  tagsList: () => [...queryKeys.tags, 'list'] as const,
  tagsWithStats: () => [...queryKeys.tags, 'with-stats'] as const,
  
  admin: ['admin'] as const,
  adminQuestions: (filters: AdminQuestionFilters) => [...queryKeys.admin, 'questions', filters] as const
}
```

### Invalidation Patterns

```typescript
// After creating a question
queryClient.invalidateQueries({ queryKey: queryKeys.questions })
queryClient.invalidateQueries({ queryKey: queryKeys.adminQuestions })

// After updating a question
queryClient.invalidateQueries({ queryKey: queryKeys.questionsDetail(questionId) })
queryClient.invalidateQueries({ queryKey: queryKeys.adminQuestions })

// After deleting a question
queryClient.removeQueries({ queryKey: queryKeys.questionsDetail(questionId) })
queryClient.invalidateQueries({ queryKey: queryKeys.questions })
```

## Performance Considerations

### Optimizations

1. **Stale Time Configuration**: Set appropriate stale times for different data types
2. **Background Refetching**: Enable background updates for frequently changing data
3. **Query Deduplication**: Prevent duplicate requests for the same data
4. **Infinite Queries**: Consider implementing for paginated data if needed

### Memory Management

1. **Cache Size Limits**: Configure appropriate cache size limits
2. **Garbage Collection**: Set up automatic cleanup of unused queries
3. **Selective Invalidation**: Use precise query key matching for invalidation