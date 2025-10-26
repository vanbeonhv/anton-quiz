# Implementation Plan

- [x] 1. Create the LoadingOverlay component




  - Create `components/shared/LoadingOverlay.tsx` with TypeScript interface
  - Implement component with Tailwind CSS classes for overlay styling
  - Add proper ARIA labels for accessibility
  - Use Loader2 icon from lucide-react with animate-spin class
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.4, 3.5_

- [x] 2. Integrate LoadingOverlay into IndividualQuestionPage





  - Import LoadingOverlay component in IndividualQuestionPage.tsx
  - Wrap the submit button and result display area with LoadingOverlay
  - Connect isLoading prop to submitAttemptMutation.isPending state
  - Remove the "Submitting..." text from button since overlay will show loading
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [ ]* 3. Add unit tests for LoadingOverlay component
  - Create test file for LoadingOverlay component
  - Test rendering with isLoading true/false states
  - Test children prop rendering
  - Test accessibility attributes
  - _Requirements: 2.1, 2.2, 2.3, 3.5_

- [ ]* 4. Add integration tests for IndividualQuestionPage
  - Test loading overlay appears when submitting answer
  - Test overlay hides when mutation completes
  - Test that "already attempted" message doesn't show during loading
  - Verify proper user interaction flow
  - _Requirements: 1.1, 1.2, 1.3, 1.4_