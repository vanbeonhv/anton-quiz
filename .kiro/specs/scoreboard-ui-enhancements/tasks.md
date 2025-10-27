# Implementation Plan

## Overview
This implementation plan transforms the scoreboard UI by replacing rank icons with medal emojis for top 3 users and adding user avatars throughout all leaderboard displays. The changes ensure visual consistency with the existing topbar design.

## Tasks

- [x] 1. Create reusable avatar component
  - Create `components/shared/UserAvatar.tsx` component with size variants (sm=24px, md=32px, lg=40px)
  - Implement avatar image loading with GitHub avatar URL support
  - Add fallback avatar with first letter of email and colored background
  - Use consistent color generation based on email hash for fallback avatars
  - Apply rounded-full styling and optional border support
  - Handle loading states with skeleton placeholder
  - _Requirements: 3.3, 3.4, 4.2, 5.1, 5.2, 5.3, 5.4_

- [x] 2. Create rank display component with medal emojis
  - Create `components/shared/RankDisplay.tsx` component
  - Display medal emojis (🥇🥈🥉) for ranks 1-3
  - Display numeric rank (#4, #5, etc.) for ranks 4 and below
  - Apply consistent styling with 20px emoji size and center alignment
  - Support custom className for layout flexibility
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 2.4_

- [x] 3. Create user with avatar display component
  - Create `components/shared/UserWithAvatar.tsx` component
  - Display UserAvatar on left with username on right
  - Implement 8px gap between avatar and name
  - Handle long names with text truncation
  - Auto-determine avatar size: 'lg' (40px) for ranks 1-3, 'md' (32px) for others
  - Support explicit avatarSize prop override
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 4.1, 4.2, 4.3, 5.1, 5.2_

- [x] 4. Enhance API to include user avatar data
  - Modify `/api/scoreboard/questions-solved/route.ts` to fetch user avatar URLs from Supabase Auth
  - Query auth.users table to get user_metadata.avatar_url for each leaderboard entry
  - Update response type to include avatarUrl field
  - Handle cases where avatar_url is null or undefined
  - _Requirements: 3.2, 3.3, 4.3_

- [x] 5. Update QuestionsSolvedLeaderboard component
  - Replace existing getRankIcon function with RankDisplay component
  - Remove getRankEmoji function (now handled by RankDisplay)
  - Replace user email display with UserWithAvatar component
  - Pass rank prop to UserWithAvatar for automatic size determination
  - Pass avatarUrl from API response to UserWithAvatar
  - Remove existing avatar-related code if any
  - Maintain existing highlighting for current user and top 3 users
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 3.1, 3.2, 3.3, 3.4, 5.1, 5.2, 5.3_

- [x] 6. Update LeaderboardTable component
  - Replace existing getRankIcon function with RankDisplay component
  - Remove getRankBadge function (medals replace badges)
  - Replace user email display with UserWithAvatar component
  - Pass rank prop to UserWithAvatar for automatic size determination
  - Pass avatarUrl from API response to UserWithAvatar
  - Maintain existing row highlighting for top 3 users
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 4.1, 4.2, 4.3, 4.4, 5.1, 5.2, 5.3_

- [x] 7. Update TypeScript types for avatar support
  - Add avatarUrl field to QuestionsSolvedLeaderboardEntry type in `types/index.ts`
  - Ensure type consistency across API responses and component props
  - _Requirements: 3.2, 4.3_

- [ ] 8. Implement responsive design adjustments
  - Adjust avatar sizes for mobile: 32px for top 3, 24px for others on screens <768px
  - Ensure medal emojis remain visible on small screens
  - Test username truncation on narrow screens
  - Verify spacing adjustments work across breakpoints
  - _Requirements: 3.4, 4.2, 5.2_

- [ ]* 9. Add accessibility improvements
  - Add aria-labels for medal rankings ("Gold medal - Rank 1", etc.)
  - Ensure avatar images have appropriate alt attributes with user identification
  - Verify keyboard navigation works with new components
  - Test color contrast for fallback avatars
  - _Requirements: 5.4_

- [ ]* 10. Verify visual consistency across all views
  - Test medal display and avatar rendering in QuestionsSolvedLeaderboard
  - Test medal display and avatar rendering in LeaderboardTable (Recent Scores)
  - Verify avatar styling matches topbar (Header component)
  - Check that top 3 users have larger avatars (40px) in both views
  - Validate responsive behavior on different screen sizes
  - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 3.1, 3.4, 4.1, 4.2, 5.1, 5.2, 5.3_
