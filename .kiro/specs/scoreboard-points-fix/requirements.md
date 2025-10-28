# Requirements Document

## Introduction

This specification addresses critical bugs in the scoreboard and dashboard where points and question counts are being incorrectly displayed or mixed up. The system currently uses `totalQuestionsAnswered` as a placeholder for daily points, which is incorrect. Daily points should be calculated based on the difficulty of questions answered (Easy: 10 points, Medium: 25 points, Hard: 50 points).

## Glossary

- **System**: The Anton Questions App scoreboard and statistics system
- **Daily Points**: Points earned by answering questions, calculated based on difficulty (Easy: 10, Medium: 25, Hard: 50)
- **Questions Solved**: The total count of correctly answered questions
- **UserStats**: Database table storing user statistics including questions answered and correct answers
- **QuestionAttempt**: Database table storing individual question attempts with difficulty and correctness
- **Dashboard**: The main user dashboard displaying user statistics
- **Scoreboard**: The leaderboard page showing rankings of all users

## Requirements

### Requirement 1

**User Story:** As a user, I want to see my actual daily points (based on question difficulty) on the dashboard, so that I can track my real point accumulation

#### Acceptance Criteria

1. WHEN the Dashboard loads, THE System SHALL calculate daily points by summing points from all correct question attempts (Easy: 10, Medium: 25, Hard: 50)
2. WHEN displaying the daily points stat, THE System SHALL show the calculated point total instead of the question count
3. THE System SHALL maintain backward compatibility with existing UserStats data structure

### Requirement 2

**User Story:** As a user, I want the Questions Solved leaderboard to show the actual number of questions I solved correctly, so that I can see accurate rankings

#### Acceptance Criteria

1. WHEN the Questions Solved leaderboard loads, THE System SHALL display `totalCorrectAnswers` as the primary ranking metric
2. THE System SHALL display `totalQuestionsAnswered` as the total attempted count
3. THE System SHALL calculate and display accuracy percentage as (totalCorrectAnswers / totalQuestionsAnswered) * 100

### Requirement 3

**User Story:** As a user, I want the Daily Points leaderboard to show actual points earned (not question counts), so that rankings reflect the difficulty of questions answered

#### Acceptance Criteria

1. WHEN the Daily Points leaderboard loads, THE System SHALL calculate total points by querying QuestionAttempt records and summing points based on difficulty
2. THE System SHALL rank users by their calculated total points in descending order
3. IF a user has no question attempts, THEN THE System SHALL display 0 points for that user
4. THE System SHALL apply time filters (all-time, this-week, this-month) to the QuestionAttempt query before calculating points

### Requirement 4

**User Story:** As a developer, I want to add a `totalDailyPoints` field to UserStats, so that point calculations are efficient and don't require querying all attempts

#### Acceptance Criteria

1. THE System SHALL add a `totalDailyPoints` integer field to the UserStats model with a default value of 0
2. WHEN a user answers a question correctly, THE System SHALL increment `totalDailyPoints` by the appropriate difficulty value (Easy: 10, Medium: 25, Hard: 50)
3. THE System SHALL create a database migration to add the new field to existing records
4. THE System SHALL backfill existing user records by calculating points from their QuestionAttempt history

### Requirement 5

**User Story:** As a user, I want all point displays throughout the app to be consistent, so that I'm not confused by conflicting numbers

#### Acceptance Criteria

1. THE System SHALL audit all components that display points or question counts
2. THE System SHALL ensure "Daily Points" labels always show calculated points (not question counts)
3. THE System SHALL ensure "Questions Solved" labels always show correct answer counts
4. THE System SHALL ensure "Questions Attempted" labels always show total attempt counts
