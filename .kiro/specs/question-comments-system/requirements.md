# Requirements Document

## Introduction

This document specifies the requirements for a commenting system that allows users to discuss questions after answering them. The system enables both authenticated and unauthenticated users to view comments, while only authenticated users can create, edit, and delete their own comments. The feature enhances community engagement and knowledge sharing around individual questions.

## Glossary

- **Comment System**: The feature that allows users to post, view, edit, and delete text-based comments on questions
- **Authenticated User**: A user who has logged in with valid credentials through Supabase Auth
- **Unauthenticated User**: A visitor who has not logged in but can view public content
- **Comment Author**: The authenticated user who created a specific comment
- **Display Name**: The user's chosen public identifier shown with their comments
- **Avatar**: The user's profile image displayed alongside their comments
- **Edit Indicator**: A visual label showing that a comment has been modified after initial posting
- **Character Limit**: The minimum (1) and maximum (500) character constraints for comment content
- **Question Discussion**: The collection of all comments associated with a specific question

## Requirements

### Requirement 1

**User Story:** As an authenticated user, I want to post comments on questions after answering them, so that I can share insights and discuss the question with other learners

#### Acceptance Criteria

1. WHEN an authenticated user views a question page, THE Comment System SHALL display a comment input interface below the question content
2. WHEN an authenticated user submits a comment, THE Comment System SHALL validate that the content is between 1 and 500 characters
3. IF the comment content is less than 1 character or more than 500 characters, THEN THE Comment System SHALL display an error message and prevent submission
4. WHEN a valid comment is submitted, THE Comment System SHALL save the comment with the user's ID, display name, avatar, and timestamp
5. WHEN a comment is successfully posted, THE Comment System SHALL display the new comment immediately in the discussion thread

### Requirement 2

**User Story:** As an unauthenticated user, I want to view comments on questions, so that I can learn from community discussions without needing to log in

#### Acceptance Criteria

1. WHEN an unauthenticated user views a question page, THE Comment System SHALL display all existing comments in chronological order
2. WHEN displaying comments to unauthenticated users, THE Comment System SHALL show the author's avatar, display name, comment content, and posting time
3. WHEN an unauthenticated user views the question page, THE Comment System SHALL hide the comment input interface
4. THE Comment System SHALL render all comments with proper formatting and readability for unauthenticated users

### Requirement 3

**User Story:** As a comment author, I want to edit my own comments, so that I can correct mistakes or update my thoughts

#### Acceptance Criteria

1. WHEN a comment author views their own comment, THE Comment System SHALL display an edit action button
2. WHEN the edit button is clicked, THE Comment System SHALL replace the comment display with an editable text input containing the current comment content
3. WHEN an edited comment is submitted, THE Comment System SHALL validate that the content is between 1 and 500 characters
4. WHEN a comment is successfully edited, THE Comment System SHALL update the comment content and display an "edited" indicator next to the timestamp
5. WHEN a user views an edited comment, THE Comment System SHALL show the "edited" label similar to Discord's implementation

### Requirement 4

**User Story:** As a comment author, I want to delete my own comments, so that I can remove content I no longer want to share

#### Acceptance Criteria

1. WHEN a comment author views their own comment, THE Comment System SHALL display a delete action button
2. WHEN the delete button is clicked, THE Comment System SHALL prompt the user for confirmation before deletion
3. WHEN deletion is confirmed, THE Comment System SHALL remove the comment from the database and the display
4. WHEN a comment is deleted, THE Comment System SHALL update the comment count for the question
5. THE Comment System SHALL prevent users from deleting comments authored by other users

### Requirement 5

**User Story:** As any user viewing comments, I want to see author information and timestamps, so that I can understand the context and credibility of each comment

#### Acceptance Criteria

1. WHEN displaying a comment, THE Comment System SHALL show the author's avatar image
2. WHEN displaying a comment, THE Comment System SHALL show the author's display name
3. WHEN displaying a comment, THE Comment System SHALL show the relative time since posting (e.g., "2 hours ago", "3 days ago")
4. WHEN a comment has been edited, THE Comment System SHALL display an "edited" indicator adjacent to the timestamp
5. THE Comment System SHALL format all comment metadata consistently across all comments

### Requirement 6

**User Story:** As a user managing comments, I want clear feedback on character limits, so that I can write comments within the acceptable range

#### Acceptance Criteria

1. WHILE a user is typing a comment, THE Comment System SHALL display a character counter showing current length and maximum limit
2. WHEN the character count is 0 characters, THE Comment System SHALL disable the submit button
3. WHEN the character count exceeds 500 characters, THE Comment System SHALL display an error indicator and disable the submit button
4. WHEN the character count is between 1 and 500 characters, THE Comment System SHALL enable the submit button
5. THE Comment System SHALL update the character counter in real-time as the user types
