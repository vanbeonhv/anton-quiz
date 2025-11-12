# Implementation Plan

- [x] 1. Update middleware for public route access





  - Modify `middleware.ts` to define public and protected routes
  - Implement route matching logic to distinguish between public and protected paths
  - Update authentication check to allow unauthenticated access to public routes
  - Maintain redirect logic for protected routes (dashboard, profile, admin)
  - Test middleware with both authenticated and unauthenticated requests
  - _Requirements: 1.1, 1.3, 2.1, 2.2, 5.1, 5.2, 5.3, 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 2. Create AuthPromptModal component







  - [ ] 2.1 Build modal component structure
    - Create `components/shared/AuthPromptModal.tsx` file
    - Implement modal with overlay, card, and close button
    - Add heading, description, and benefits list
    - Create login and signup action buttons
    - Implement close handlers (X button, backdrop click, escape key)

    - _Requirements: 3.2, 3.3, 8.1, 8.2, 8.3, 8.4, 8.5_
  
  - [ ] 2.2 Add styling and responsive design
    - Apply design system colors (bg-peach, primary-green, primary-orange)
    - Implement responsive layout for mobile and desktop
    - Add animations for modal entry and exit

    - Ensure proper spacing and typography
    - _Requirements: 8.5_
  
  - [ ] 2.3 Implement accessibility features
    - Add ARIA attributes (role, aria-modal, aria-labelledby, aria-describedby)
    - Implement keyboard navigation and focus trap


    - Add focus indicators for interactive elements
    - Ensure sufficient color contrast
    - _Requirements: 8.1, 8.2, 8.3, 8.4_
  
  - [ ] 2.4 Export component from shared index
    - Add AuthPromptModal to `components/shared/index.ts` exports
    - Verify component can be imported from shared components
    - _Requirements: 3.2_

- [x] 3. Update IndividualQuestionPage for auth checking





  - [x] 3.1 Add authentication state management


    - Import and use `useAuth` hook to get user state
    - Add state for `showAuthModal` and `pendingAnswer`
    - Update submit handler to check authentication before submission
    - _Requirements: 3.1, 3.4, 7.1, 7.2_
  

  - [x] 3.2 Implement auth modal integration

    - Show AuthPromptModal when unauthenticated user clicks submit
    - Store selected answer in `pendingAnswer` state when modal opens
    - Implement modal close handler to clear pending state
    - _Requirements: 3.1, 3.2, 3.3, 3.4_
  

  - [x] 3.3 Add login redirect with context preservation

    - Implement `handleLogin` function to store pending answer in session storage
    - Create session storage entry with questionId, answer, and isDailyQuestion flag
    - Redirect to login page with returnUrl query parameter
    - _Requirements: 4.1, 4.2_
  

  - [x] 3.4 Maintain existing authenticated user flow

    - Ensure authenticated users can submit without seeing modal
    - Verify no regression in existing submission logic
    - _Requirements: 7.1, 7.2, 7.3_

- [x] 4. Update login page for return URL handling






  - [x] 4.1 Add return URL and auto-submit logic



    - Check for `returnUrl` query parameter on mount
    - Check session storage for `pendingAnswer` data
    - Implement redirect logic after successful authentication
    - _Requirements: 4.1, 4.2, 4.3_
  
  - [x] 4.2 Implement auto-submit after login


    - Parse pending answer from session storage
    - Clear session storage after reading
    - Redirect to question page with auto-submit parameters
    - Handle case where no pending answer exists
    - _Requirements: 4.3, 4.4_

- [ ] 5. Add auto-submit handling to question page
  - Check for `autoSubmit` query parameter on mount
  - Extract answer and question type from URL parameters
  - Automatically trigger answer submission if parameters present
  - Clear URL parameters after submission
  - Show loading state during auto-submission
  - _Requirements: 4.4_

- [ ] 6. Create landing page for unauthenticated users
  - [ ] 6.1 Build landing page structure
    - Create or update `app/page.tsx` for landing page
    - Implement hero section with logo, tagline, and CTAs
    - Create features section with three feature cards
    - Add quick stats section with public statistics
    - Add final call-to-action section
    - _Requirements: 1.1, 1.3_
  
  - [ ] 6.2 Add authentication-based routing
    - Check authentication state on page mount
    - Redirect authenticated users to `/dashboard`
    - Display landing page for unauthenticated users
    - _Requirements: 5.4_
  
  - [ ] 6.3 Implement responsive design
    - Apply mobile-first responsive layout
    - Use design system colors and typography
    - Ensure proper spacing and alignment
    - Test on mobile, tablet, and desktop viewports
    - _Requirements: 1.1_

- [ ] 7. Update API endpoints for public access
  - [ ] 7.1 Verify questions API allows unauthenticated access
    - Review `app/api/questions/route.ts` to ensure no auth requirement
    - Test GET requests without authentication
    - Ensure correct answers are not exposed in response
    - _Requirements: 6.6, 9.1, 9.5_
  
  - [ ] 7.2 Verify individual question API allows unauthenticated access
    - Review `app/api/questions/[id]/route.ts` to ensure no auth requirement
    - Test GET requests without authentication
    - Ensure correct answers and explanations are not exposed
    - _Requirements: 6.6, 9.1, 9.5_
  
  - [ ] 7.3 Verify scoreboard API allows unauthenticated access
    - Review `app/api/scoreboard/route.ts` to ensure no auth requirement
    - Test GET requests without authentication
    - Ensure only public leaderboard data is returned
    - _Requirements: 6.6, 9.3, 9.5_
  
  - [ ] 7.4 Verify attempt API requires authentication
    - Review `app/api/questions/[id]/attempt/route.ts` for auth check
    - Ensure 401 response for unauthenticated POST requests
    - Verify error message is clear and actionable
    - _Requirements: 9.2, 9.4_
  
  - [ ] 7.5 Verify tags API allows unauthenticated access
    - Review `app/api/tags/route.ts` to ensure no auth requirement
    - Test GET requests without authentication
    - _Requirements: 6.6_

- [ ] 8. Update header navigation for unauthenticated users
  - Modify header component to show different navigation for unauthenticated users
  - Add "Log In" and "Sign Up" buttons for unauthenticated users
  - Show existing user menu for authenticated users
  - Ensure navigation links work for both auth states
  - _Requirements: 1.1, 1.2, 2.1, 2.2_

- [ ] 9. Add session storage utilities
  - Create utility functions for pending answer storage
  - Implement expiration logic (30 minutes)
  - Add validation for pending answer data
  - Handle session storage unavailability gracefully
  - _Requirements: 3.3, 4.1, 4.2_

- [ ]* 10. Integration testing
  - [ ]* 10.1 Test public access flow
    - Verify unauthenticated users can browse questions
    - Verify unauthenticated users can view question details
    - Verify unauthenticated users can view scoreboard
    - Verify auth modal appears on answer submission
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 3.1_
  
  - [ ]* 10.2 Test login and submit flow
    - Test complete flow from answer selection to login to auto-submit
    - Verify pending answer is preserved across redirect
    - Verify answer is submitted automatically after login
    - Verify result is displayed correctly
    - _Requirements: 3.4, 3.5, 4.1, 4.2, 4.3, 4.4_
  
  - [ ]* 10.3 Test authenticated user flow
    - Verify authenticated users can submit without modal
    - Verify no regression in existing functionality
    - Verify dashboard access works correctly
    - _Requirements: 7.1, 7.2, 7.3_
  
  - [ ]* 10.4 Test protected route access
    - Verify dashboard requires authentication
    - Verify profile requires authentication
    - Verify admin requires authentication
    - Verify proper redirects to login page
    - _Requirements: 5.1, 5.2, 5.3, 5.4_
  
  - [ ]* 10.5 Test API endpoint security
    - Test public endpoints work without auth
    - Test protected endpoints return 401 without auth
    - Verify correct answers are not exposed publicly
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_
