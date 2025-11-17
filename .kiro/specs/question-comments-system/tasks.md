# Implementation Plan

- [x] 1. Set up database schema and types
  - Create Prisma migration for QuestionComment model with fields: id, questionId, userId, userEmail, content, createdAt, updatedAt
  - Add comments relation to Question model
  - Add database indexes for questionId, userId, and createdAt
  - Generate Prisma client
  - _Requirements: 1.1, 1.4_

- [x] 2. Define TypeScript types and interfaces
  - Add QuestionComment interface to types/index.ts
  - Add QuestionCommentWithAuthor interface with author metadata and isEdited flag
  - Add CreateCommentData and UpdateCommentData interfaces
  - Add CommentValidationResult interface
  - _Requirements: 1.1, 1.4, 6.1_

- [x] 3. Create comment validation utilities
  - Implement validateCommentContent function in lib/utils/comments.ts
  - Add character count validation (1-500 chars)
  - Add empty content and whitespace trimming logic
  - Export validation error messages
  - _Requirements: 1.2, 1.3, 3.3, 6.2, 6.3, 6.4_

- [x] 4. Implement GET comments API endpoint
  - Create /api/questions/[id]/comments/route.ts with GET handler
  - Query comments from database by questionId
  - Fetch user metadata (displayName, avatarUrl) from Supabase Auth
  - Calculate isEdited flag (updatedAt > createdAt + 60 seconds)
  - Sort comments by createdAt ascending
  - Return comments array with author info
  - _Requirements: 2.1, 2.2, 5.1, 5.2, 5.3, 5.4_

- [x] 5. Implement POST comment API endpoint
  - Add POST handler to /api/questions/[id]/comments/route.ts
  - Validate user authentication using Supabase server client
  - Validate content length (1-500 chars) server-side
  - Validate question exists in database
  - Create comment record with userId, userEmail, questionId, content
  - Fetch user metadata and return created comment
  - Handle errors with appropriate status codes (400, 401, 404, 500)
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 6. Implement PATCH and DELETE comment API endpoints
- [x] 6.1 Create /api/comments/[id]/route.ts with PATCH handler
  - Validate user authentication
  - Validate comment exists and user is the author
  - Validate content length (1-500 chars)
  - Update comment content and updatedAt timestamp
  - Return updated comment with author info
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 6.2 Add DELETE handler to /api/comments/[id]/route.ts
  - Validate user authentication
  - Validate comment exists and user is the author
  - Delete comment from database
  - Return success response
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 7. Create React Query hooks for comment operations
  - Implement useComments hook in lib/queries.ts for fetching comments
  - Implement useCreateComment mutation hook with optimistic updates
  - Implement useUpdateComment mutation hook with optimistic updates
  - Implement useDeleteComment mutation hook with optimistic updates
  - Configure cache invalidation on successful mutations
  - _Requirements: 1.5, 3.4, 4.3_

- [x] 8. Build CommentForm component
  - Create components/questions/CommentForm.tsx
  - Add textarea input with placeholder text
  - Implement real-time character counter (current / 500)
  - Add validation states (empty, valid, over limit)
  - Disable submit button when content is invalid
  - Display inline error messages
  - Handle create and edit modes
  - Add cancel button for edit mode
  - Clear form after successful submission
  - _Requirements: 1.1, 1.2, 1.3, 3.2, 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 9. Build CommentItem component
  - Create components/questions/CommentItem.tsx
  - Display author avatar using UserAvatar component
  - Display author display name (or email fallback)
  - Display relative timestamp using dayjs
  - Display "edited" indicator when applicable (updatedAt > createdAt + 60s)
  - Render comment content with proper formatting
  - Show edit and delete buttons only for comment author
  - Implement edit mode toggle
  - Add delete confirmation dialog
  - _Requirements: 2.2, 3.1, 3.2, 3.5, 4.1, 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 10. Build CommentList component
  - Create components/questions/CommentList.tsx
  - Render list of CommentItem components
  - Display empty state when no comments exist
  - Handle loading state with skeleton loaders
  - Handle error state with error message
  - Sort comments chronologically (oldest first)
  - Pass edit and delete handlers to CommentItem
  - _Requirements: 2.1, 2.2, 2.3_

- [x] 11. Build QuestionComments container component
  - Create components/questions/QuestionComments.tsx
  - Fetch comments using useComments hook
  - Conditionally render CommentForm for authenticated users only
  - Render CommentList with fetched comments
  - Handle comment creation with useCreateComment mutation
  - Handle comment editing with useUpdateComment mutation
  - Handle comment deletion with useDeleteComment mutation
  - Show toast notifications for success and error states
  - Implement optimistic UI updates
  - _Requirements: 1.1, 1.5, 2.1, 2.3, 3.4, 4.3_

- [x] 12. Integrate QuestionComments into IndividualQuestionPage
  - Import QuestionComments component
  - Add QuestionComments below the question result display area
  - Pass questionId prop from question data
  - Pass authentication state from useAuth hook
  - Pass currentUserId for author identification
  - Ensure proper spacing and layout
  - _Requirements: 1.1, 2.1, 2.3_

- [x] 13. Add responsive design and accessibility
  - Apply responsive styles for mobile, tablet, and desktop
  - Ensure proper keyboard navigation (tab through comments and actions)
  - Add ARIA labels for edit and delete buttons
  - Add ARIA live region for character counter
  - Ensure WCAG AA color contrast compliance
  - Add focus management for edit mode
  - Test with screen readers
  - _Requirements: 5.5_

- [x] 14. Implement animations and loading states
  - Add fade-in animation for new comments
  - Add fade-out animation for deleted comments
  - Add smooth transition for edit mode toggle
  - Add LoadingOverlay for comment submission
  - Add skeleton loaders for comment list loading state
  - Implement optimistic update animations
  - _Requirements: 1.5, 3.4, 4.3_
