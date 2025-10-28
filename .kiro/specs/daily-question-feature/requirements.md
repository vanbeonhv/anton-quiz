# Requirements Document

## Introduction

This document specifies the requirements for a Daily Question feature that provides all users with the same question each day, similar to LeetCode's daily challenge. The feature will reset at 8 AM GMT+7, award points based on difficulty, and integrate seamlessly into the existing question practice system without requiring additional database tables.

## Glossary

- **Daily Question System**: The system component responsible for selecting and presenting a single question to all users each day
- **Question Selection Algorithm**: A deterministic algorithm using date and salt to select a question based on its number field
- **Reset Time**: 8:00 AM GMT+7 timezone when the daily question changes
- **Daily Points**: Points awarded for solving the daily question (Easy: 10, Medium: 25, Hard: 50)
- **Home Page**: The main landing page of the application where users access features
- **Question UI**: The existing individual question display and interaction interface

## Requirements

### Requirement 1

**User Story:** As a user, I want to see a daily question that is the same for all users, so that I can participate in a shared daily challenge

#### Acceptance Criteria

1. THE Daily Question System SHALL select one question per day that is identical for all users
2. WHEN the current time reaches 8:00 AM GMT+7, THE Daily Question System SHALL select a new daily question
3. THE Daily Question System SHALL use a deterministic algorithm based on the current date and a salt value to select the question number
4. THE Daily Question System SHALL select questions from the existing Question table using the number field
5. THE Daily Question System SHALL not require additional database tables for question selection

### Requirement 2

**User Story:** As a user, I want to access the daily question from the home page, so that I can easily find and attempt today's challenge

#### Acceptance Criteria

1. THE Home Page SHALL display a "Daily Question" button in place of the "Browse Questions" button
2. THE Home Page SHALL display text showing when the daily question will reset
3. WHEN a user clicks the "Daily Question" button, THE Home Page SHALL navigate to the Question UI with a URL parameter "?type=daily"
4. THE Home Page SHALL calculate and display the time remaining until the next reset at 8:00 AM GMT+7

### Requirement 3

**User Story:** As a user, I want to earn points for solving the daily question, so that I am rewarded for completing the daily challenge

#### Acceptance Criteria

1. WHEN a user correctly solves a daily question with Easy difficulty, THE Daily Question System SHALL award 10 points
2. WHEN a user correctly solves a daily question with Medium difficulty, THE Daily Question System SHALL award 25 points
3. WHEN a user correctly solves a daily question with Hard difficulty, THE Daily Question System SHALL award 50 points
4. THE Daily Question System SHALL record the points in the existing user statistics system
5. THE Daily Question System SHALL award points only once per user per daily question

### Requirement 4

**User Story:** As a user, I want the daily question UI to reuse the existing question interface, so that I have a consistent experience

#### Acceptance Criteria

1. THE Question UI SHALL detect the "type=daily" URL parameter to identify daily question mode
2. WHEN displaying a daily question, THE Question UI SHALL use the same layout and interaction patterns as regular questions
3. THE Question UI SHALL display the daily question selected by the Daily Question System
4. THE Question UI SHALL handle answer submission for daily questions using existing question attempt logic
5. THE Question UI SHALL apply daily points calculation when processing daily question attempts

### Requirement 5

**User Story:** As a developer, I want the daily question selection to be deterministic and simple, so that the system is maintainable without complex infrastructure

#### Acceptance Criteria

1. THE Question Selection Algorithm SHALL use the current date in GMT+7 timezone as input
2. THE Question Selection Algorithm SHALL use a predefined salt value to add randomization
3. THE Question Selection Algorithm SHALL compute a hash or modulo operation to map to a question number
4. THE Question Selection Algorithm SHALL handle cases where the computed question number does not exist
5. THE Question Selection Algorithm SHALL be implemented as a pure function without database state
