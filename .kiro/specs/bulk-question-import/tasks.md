# Implementation Plan

- [x] 1. Create bulk insert API endpoint
  - Create POST endpoint at `/api/admin/questions/bulk`
  - Implement request validation for array of questions
  - Implement bulk question creation using Prisma transaction
  - Handle tag associations for each question
  - Return success response with created question count
  - Handle partial failures and return detailed error information
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_

- [x] 2. Create BulkQuestionImport component structure
  - Create new file `components/admin/BulkQuestionImport.tsx`
  - Define component props interface (tags, onComplete)
  - Set up component state for modals and parsed questions
  - Create trigger button with appropriate icon
  - _Requirements: 1.1_

- [x] 3. Implement JSON input modal
  - Create modal dialog with textarea for JSON input
  - Display template JSON with copy-to-clipboard button
  - Add helper text explaining the expected format
  - Implement parse button handler
  - Add cancel button to close modal
  - _Requirements: 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 2.4_

- [x] 4. Implement JSON parsing and validation logic
  - Create function to parse JSON string
  - Validate JSON is an array
  - Validate each question has required fields
  - Validate field types and values (correctAnswer, difficulty)
  - Set parse error state for invalid input
  - Initialize tagIds as empty array for each parsed question
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 5. Implement question review modal
  - Create modal dialog with question counter
  - Display current question index and total count
  - Add previous/next navigation buttons
  - Create question list sidebar showing all questions
  - _Requirements: 4.1, 4.2, 4.4, 4.5_

- [x] 6. Implement question editing form in review modal
  - Create editable form fields for question text
  - Create editable fields for all four options
  - Add radio group for correct answer selection
  - Add select dropdown for difficulty
  - Add textarea for explanation
  - Add checkbox list for tag selection
  - Implement field update handlers
  - Preserve changes when navigating between questions
  - _Requirements: 4.3, 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 7. Implement form validation in review modal
  - Validate required fields are not empty
  - Add visual indicators for validation errors
  - Display validation error messages
  - Update question validation status in state
  - Show validation status in question list sidebar
  - _Requirements: 5.3_

- [x] 8. Implement bulk submit functionality
  - Create React Query mutation hook for bulk insert
  - Add submit button in review modal
  - Implement submit handler to call API endpoint
  - Show loading state during submission
  - Handle successful submission with toast notification
  - Close modal and refresh question list on success
  - Handle API errors with appropriate error messages
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_

- [x] 9. Integrate BulkQuestionImport into QuestionManagement
  - Import BulkQuestionImport component
  - Add component next to "Create Question" button
  - Pass tags prop from QuestionManagement
  - Pass onComplete callback to refresh questions
  - _Requirements: 1.1_

- [ ]* 10. Add error handling and edge cases
  - Handle empty JSON array
  - Handle very large question batches (50+)
  - Add confirmation dialog for large batches
  - Handle network errors gracefully
  - Add retry mechanism for failed submissions
  - _Requirements: 3.2, 6.6_

- [ ]* 11. Improve accessibility and UX
  - Add ARIA labels to all form fields
  - Implement keyboard navigation for modals
  - Add focus management when opening/closing modals
  - Ensure proper tab order in forms
  - Add screen reader announcements for validation errors
  - Test with keyboard-only navigation
  - _Requirements: 1.4, 2.4, 4.4, 5.5, 6.7_
