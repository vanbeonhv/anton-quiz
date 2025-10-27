# Requirements Document

## Introduction

This feature enhances the user display system to use the display name from Supabase Authentication instead of deriving names from email addresses. Currently, the application extracts usernames from email addresses (e.g., "john.doe@example.com" becomes "john.doe"), but Supabase Auth provides a dedicated `display_name` field in the user metadata that should be used for a more personalized experience.

## Glossary

- **Display Name**: The user-identifying name from Supabase Auth's `auth.users` table under `raw_user_meta_data`. For GitHub users, this is the `user_name` field. For email users, this may be the `full_name` field if set.
- **Leaderboard System**: The scoreboard components that display user rankings and statistics
- **Header Component**: The top navigation bar that shows the current user's information
- **UserStats Table**: The Prisma database table that stores user statistics and references users by `userId` and `userEmail`
- **Supabase Auth**: The authentication service that manages user accounts and metadata
- **User Metadata**: The JSONB data stored in `raw_user_meta_data` containing fields like `user_name`, `preferred_username`, `full_name`, and `avatar_url`

## Requirements

### Requirement 1

**User Story:** As a user, I want to see my chosen display name in the application header, so that I am identified by my preferred name rather than my email address

#### Acceptance Criteria

1. WHEN THE Header Component renders the current user's information, THE Header Component SHALL display the user name from Supabase Auth metadata with priority order: full_name, preferred_username, user_name
2. IF none of the user name fields are available in Supabase Auth metadata, THEN THE Header Component SHALL fall back to email-based name derivation
3. THE Header Component SHALL maintain the current avatar display logic without modification
4. THE Header Component SHALL update the `getDisplayName` function to check preferred_username and user_name fields in the correct priority order

### Requirement 2

**User Story:** As a user viewing the leaderboard, I want to see other users' display names, so that I can recognize participants by their chosen names

#### Acceptance Criteria

1. WHEN THE Scoreboard API fetches leaderboard data, THE Scoreboard API SHALL retrieve display names from the `auth.users` table
2. THE Scoreboard API SHALL include the display name field in the leaderboard response data
3. WHEN THE LeaderboardTable Component renders user entries, THE LeaderboardTable Component SHALL display the display name if available
4. IF the display name is not available for a user, THEN THE LeaderboardTable Component SHALL fall back to email-based name derivation

### Requirement 3

**User Story:** As a user viewing the questions solved leaderboard, I want to see display names for all participants, so that the leaderboard shows personalized user identities

#### Acceptance Criteria

1. WHEN THE QuestionsSolvedLeaderboard API fetches data, THE QuestionsSolvedLeaderboard API SHALL retrieve display names from the `auth.users` table
2. THE QuestionsSolvedLeaderboard API SHALL include the display name in the API response
3. WHEN THE QuestionsSolvedLeaderboard Component renders entries, THE QuestionsSolvedLeaderboard Component SHALL display the display name for each user
4. THE QuestionsSolvedLeaderboard Component SHALL maintain the existing avatar display functionality

### Requirement 4

**User Story:** As a developer, I want a consistent user display component, so that display name logic is centralized and maintainable

#### Acceptance Criteria

1. THE UserWithAvatar Component SHALL accept a display name prop
2. WHEN the display name prop is provided, THE UserWithAvatar Component SHALL display the display name
3. WHEN the display name prop is not provided, THE UserWithAvatar Component SHALL fall back to the userEmail prop
4. THE UserWithAvatar Component SHALL maintain backward compatibility with existing usage

### Requirement 5

**User Story:** As a system, I want to handle missing display names gracefully, so that the application continues to function when display name data is unavailable

#### Acceptance Criteria

1. WHEN a database query for display names fails, THE System SHALL log the error and continue with null display name values
2. WHEN a display name is null or empty, THE System SHALL use the email-based name derivation as fallback
3. THE System SHALL not throw errors or crash when display name data is unavailable
4. THE System SHALL maintain existing functionality for users without display names set
