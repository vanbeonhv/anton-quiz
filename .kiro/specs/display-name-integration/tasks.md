# Implementation Plan

- [x] 1. Update TypeScript types to include displayName field
  - Add `displayName?: string | null` to `QuestionsSolvedLeaderboardEntry` interface in `types/index.ts`
  - Ensure type consistency across all leaderboard-related interfaces
  - _Requirements: 2.2, 3.2, 4.1_

- [x] 2. Update scoreboard API to fetch and return display names
  - [x] 2.1 Enhance `/api/scoreboard/route.ts` to fetch display names
    - Modify the existing SQL query to extract `full_name`, `preferred_username`, and `user_name` from `raw_user_meta_data`
    - Update the `avatarMap` to store both `avatarUrl` and `displayName`
    - Add `displayName` field to the leaderboard response with priority: full_name > preferred_username > user_name
    - _Requirements: 2.1, 2.2_

  - [x] 2.2 Enhance `/api/scoreboard/questions-solved/route.ts` to fetch display names
    - Add SQL query to fetch user metadata from `auth.users` table (similar to main scoreboard route)
    - Extract display name with correct priority order from `raw_user_meta_data`
    - Include `displayName` field in the API response
    - Add error handling for failed auth queries
    - _Requirements: 3.1, 3.2_

- [x] 3. Update Header component to use correct display name priority
  - [x] 3.1 Modify `getDisplayName` function in `components/layout/Header.tsx`
    - Reorder the priority checks: full_name > preferred_username > user_name > name > email
    - Ensure the function handles null/undefined values gracefully
    - _Requirements: 1.1, 1.2, 1.4_

- [x] 4. Update leaderboard components to display fetched display names
  - [x] 4.1 Update `components/dashboard/LeaderboardTable.tsx`
    - Pass `displayName` from API response to `UserWithAvatar` component
    - Update fallback logic to use `displayName || userEmail.split('@')[0]`
    - _Requirements: 2.3, 2.4, 4.2, 4.3_

  - [x] 4.2 Update `components/scoreboard/QuestionsSolvedLeaderboard.tsx`
    - Pass `displayName` from API response to `UserWithAvatar` component
    - Update fallback logic to use `displayName || userEmail.split('@')[0]`
    - Ensure the component handles missing display names gracefully
    - _Requirements: 3.3, 4.2, 4.3_

- [x] 5. Verify UserWithAvatar component compatibility
  - Review `components/shared/UserWithAvatar.tsx` to confirm it properly handles the `displayName` prop
  - Ensure fallback logic works correctly when `displayName` is null or undefined
  - _Requirements: 4.1, 4.2, 4.3, 4.4_
