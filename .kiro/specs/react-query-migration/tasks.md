# Implementation Plan

- [x] 1. Create API service layer with centralized functions





  - Create `lib/api/questions.ts` with all question-related API functions
  - Create `lib/api/tags.ts` with all tag-related API functions
  - Add proper TypeScript interfaces for all request/response types
  - Implement consistent error handling across all API functions
  - _Requirements: 1.1, 3.1, 3.2, 3.3_


- [x] 2. Extend mutation hooks in queries file




  - Add `useCreateQuestion` mutation hook with cache invalidation
  - Add `useUpdateQuestion` mutation hook with cache invalidation
  - Add `useDeleteQuestion` mutation hook with cache invalidation
  - Add `useCreateTag` mutation hook with cache invalidation
  - Add `useUpdateTag` mutation hook with cache invalidation
  - Add `useDeleteTag` mutation hook with cache invalidation
  - Add `useBulkTagAssignment` mutation hook with cache invalidation
  - Add `useSubmitQuestionAttempt` mutation hook
  - _Requirements: 1.2, 2.1, 2.2, 2.3, 4.4_

- [x] 3. Create individual question data fetching hook





  - Add `useQuestion` hook for fetching single question data
  - Replace direct fetch call in `app/questions/[id]/page.tsx`
  - Implement proper loading and error states
  - _Requirements: 1.1, 4.1, 4.2_

- [x] 4. Migrate admin question management component





  - Replace direct fetch calls in `components/admin/QuestionManagement.tsx`
  - Use `useCreateQuestion`, `useUpdateQuestion`, and `useDeleteQuestion` hooks
  - Remove manual state management for loading and error states
  - Implement proper success/error feedback
  - _Requirements: 1.2, 2.1, 2.2, 2.3, 4.3, 4.4_
    
- [x] 5. Migrate admin tag management component





  - Replace direct fetch calls in `components/admin/TagManagement.tsx`
  - Use `useCreateTag`, `useUpdateTag`, and `useDeleteTag` hooks
  - Remove manual state management for loading and error states
  - Implement proper success/error feedback
  - _Requirements: 1.2, 2.1, 2.2, 2.3, 4.3, 4.4_
-

- [x] 6. Migrate bulk tag assignment component




  - Replace direct fetch call in `components/admin/BulkTagAssignment.tsx`
  - Use `useBulkTagAssignment` mutation hook
  - Remove manual loading state management
  - Implement proper success/error feedback
  - _Requirements: 1.2, 2.1, 2.2, 2.3, 4.3, 4.4_
-

- [x] 7. Migrate question attempt submission




  - Replace direct fetch call in `components/questions/IndividualQuestionPage.tsx`
  - Use `useSubmitQuestionAttempt` mutation hook
  - Remove manual loading and error state management
  - Implement proper success/error feedback
  - _Requirements: 1.2, 2.4, 4.3, 4.4_
-

- [x] 8. Implement optimistic updates for quick actions




  - Add optimistic updates for question attempt submission
  - Add optimistic updates for tag assignments where appropriate
  - Implement proper rollback mechanisms for failed optimistic updates
  - _Requirements: 5.1, 5.2, 5.3, 5.4_


- [x] 9. Add comprehensive error handling utilities





  - Create `lib/utils/errorHandling.ts` with centralized error handling
  - Implement custom error handling hook
  - Add retry mechanisms for network errors
  - _Requirements: 4.2, 4.3_

- [ ]* 10. Optimize query key structure and cache management
  - Refactor query keys to use hierarchical structure
  - Implement precise cache invalidation patterns
  - Add query key factory functions
  - Configure appropriate stale times for different data types
  - _Requirements: 2.1, 2.2, 2.3_

- [ ]* 11. Add unit tests for API service functions
  - Write tests for all question API functions
  - Write tests for all tag API functions
  - Test error handling scenarios
  - Mock API responses for consistent testing
  - _Requirements: 3.1, 3.2, 4.2_

- [ ]* 12. Add integration tests for mutation hooks
  - Test all mutation hooks with React Query Testing Library
  - Test cache invalidation behavior
  - Test optimistic update scenarios
  - Test error handling and rollback mechanisms
  - _Requirements: 1.2, 2.1, 2.2, 2.3, 5.2_