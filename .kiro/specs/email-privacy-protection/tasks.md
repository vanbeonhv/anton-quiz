# Implementation Plan

- [x] 1. Create privacy filter utility function

  - Create `lib/utils/privacy.ts` with email filtering logic
  - Implement `filterEmailPrivacy` function that conditionally removes email data for non-current users
  - Add TypeScript interfaces for privacy filter options and user data structures
  - Handle edge cases like null/undefined emails and missing user context
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 4.4_

-

- [x] 2. Implement server-side privacy filtering in scoreboard APIs


  - [x] 2.1 Update main scoreboard API endpoint

    - Modify `app/api/scoreboard/route.ts` to apply privacy filter before response
    - Import and use privacy filter utility with current user context
    - Ensure email data is only included for current user's entry
    - _Requirements: 1.1, 1.2, 2.2_

  - [x] 2.2 Update daily points scoreboard API

    - Modify `app/api/scoreboard/daily-points/route.ts` to apply privacy filter
    - Apply same privacy filtering pattern as main scoreboard
    - _Requirements: 1.1, 1.2, 2.2_

  - [x] 2.3 Update questions solved scoreboard API

    - Modify `app/api/scoreboard/questions-solved/route.ts` to apply privacy filter
    - Apply same privacy filtering pattern as other scoreboards
    - _Requirements: 1.1, 1.2, 2.2_

- [-] 3. Update UI components to handle filtered email data



  - [x] 3.1 Update UserWithAvatar component



    - Modify `components/shared/UserWithAvatar.tsx` to handle null/undefined userEmail
    - Implement fallback display logic when email is not available
    - Ensure component gracefully handles missing email data
    - _Requirements: 3.1, 3.4, 4.2_

  - [ ] 3.2 Update UserAvatar component




    - Modify `components/shared/UserAvatar.tsx` to handle missing email for color/initial generation
    - Implement fallback logic using displayName or userId when email is null
    - Update avatar alt text to handle missing email gracefully
    - _Requirements: 3.1, 3.4, 4.2_

  - [ ] 3.3 Update scoreboard leaderboard components

    - Modify `components/scoreboard/QuestionsSolvedLeaderboard.tsx` to handle filtered email data
    - Update current user identification logic to work with filtered data
    - Ensure leaderboard displays correctly when other users' emails are hidden
    - _Requirements: 3.1, 3.2, 3.3_

  - [ ] 3.4 Update dashboard leaderboard component
    - Modify `components/dashboard/LeaderboardTable.tsx` to handle filtered email data
    - Update display name fallback logic for entries without email
    - _Requirements: 3.1, 3.4_
-


- [ ] 4. Add authentication context to API endpoints

  - [ ] 4.1 Add user authentication to scoreboard endpoints
    - Update scoreboard API endpoints to get current user from Supabase auth
    - Pass current user ID to privacy filter function
    - Handle unauthenticated requests by filtering all emails
    - _Requirements: 1.4, 2.2_

- [ ]\* 5. Add comprehensive testing

  - [ ]\* 5.1 Create unit tests for privacy filter utility

    - Write tests for email filtering logic with different user contexts
    - Test edge cases like null emails, missing user ID, empty arrays
    - Test preservation of non-email data fields
    - _Requirements: 2.1, 2.3, 2.4, 4.4_

  - [ ]\* 5.2 Create integration tests for API endpoints

    - Test scoreboard endpoints return correct filtered data for authenticated users
    - Test unauthenticated requests receive no email data
    - Test current user receives their own email in responses
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [ ]\* 5.3 Create component tests for UI updates
    - Test UserWithAvatar and UserAvatar components with null email data
    - Test leaderboard components render correctly with filtered data
    - Test fallback display logic works as expected
    - _Requirements: 3.1, 3.2, 3.3, 3.4_
