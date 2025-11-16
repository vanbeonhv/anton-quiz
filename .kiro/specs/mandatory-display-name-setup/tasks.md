# Implementation Plan

- [x] 1. Create display name check hook




  - Implement `useDisplayNameCheck` hook in `hooks/useDisplayNameCheck.tsx`
  - Add `hasDisplayName` helper function to check all metadata fields (full_name, preferred_username, user_name)
  - Return `needsDisplayName`, `isLoading`, and `user` from the hook
  - Handle null, undefined, and empty string values properly
  - _Requirements: 1.1, 6.1, 6.2, 6.3, 6.4, 8.3_
- [x] 2. Create display name setup modal component




- [ ] 2. Create display name setup modal component

  - [x] 2.1 Implement modal component structure


    - Create `DisplayNameSetupModal` component in `components/dashboard/DisplayNameSetupModal.tsx`
    - Set up component props interface (isOpen, userId, defaultDisplayName, onSuccess)
    - Implement form with display name input field
    - Add submit button with proper labeling
    - _Requirements: 2.3, 4.1, 4.2, 5.1, 5.2, 5.3, 5.4, 5.5_

  - [x] 2.2 Implement non-dismissible modal behavior

    - Configure Dialog component to prevent Escape key closing
    - Prevent outside click dismissal
    - Hide or remove close button from modal
    - Ensure modal remains open until successful submission
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_


  - [ ] 2.3 Implement form submission and Supabase update
    - Add form validation for empty display names
    - Implement Supabase Auth metadata update for `full_name` field
    - Add session refresh after successful update
    - Handle success callback to close modal
    - _Requirements: 4.3, 4.4, 4.5, 7.5_

  - [x] 2.4 Add loading and error states

    - Implement loading state during submission
    - Disable submit button during update process
    - Display error messages for failed updates
    - Add console logging for debugging
    - _Requirements: 4.6, 7.1, 7.2, 7.3, 7.4_
-

- [x] 3. Integrate modal into dashboard page




  - [x] 3.1 Add display name check to dashboard


    - Import and use `useDisplayNameCheck` hook in dashboard page
    - Implement conditional modal rendering based on `needsDisplayName` flag
    - Generate default display name using "User-{uuid}" pattern (first 8 chars)
    - _Requirements: 1.3, 1.4, 2.1, 2.2, 2.4_

  - [x] 3.2 Implement modal lifecycle management

    - Add state management for modal visibility
    - Implement success handler to close modal and refresh page
    - Ensure modal appears after navigation to dashboard
    - Handle user object availability check
    - _Requirements: 1.5, 4.5, 8.1, 8.2_

- [x] 4. Test the complete flow




  - [x] 4.1 Test email login flow without display name


    - Verify modal appears on dashboard after email login
    - Confirm default "User-{uuid}" value is pre-filled
    - Test successful display name submission
    - Verify modal closes and display name appears in UI
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 4.5_

  - [x] 4.2 Test non-dismissible behavior

    - Verify Escape key does not close modal
    - Verify clicking outside does not close modal
    - Confirm no close button is visible
    - Test that dashboard content is not accessible while modal is open
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [ ]* 4.3 Test error scenarios
    - Test empty display name submission shows validation error
    - Test network error handling during update
    - Verify error messages are user-friendly
    - Confirm modal remains open on errors
    - _Requirements: 4.3, 4.6, 7.3_

  - [ ]* 4.4 Test OAuth user flow
    - Verify GitHub OAuth users do not see modal
    - Test that users with existing display names skip modal
    - Confirm modal only appears for email users without display names
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_
