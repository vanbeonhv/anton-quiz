# Requirements Document

## Introduction

This feature implements a mandatory display name setup flow for email-authenticated users who do not have a display name configured. When users sign in with email and lack a display name in their Supabase Auth metadata, they will be presented with a non-dismissible modal dialog that requires them to set a display name before accessing the application. This prevents errors in components that expect display names and ensures all users have a proper identity in the system.

## Glossary

- **Display Name**: The user-identifying name stored in Supabase Auth's `raw_user_meta_data` under fields like `full_name`, `preferred_username`, or `user_name`
- **Mandatory Modal**: A modal dialog that cannot be closed or dismissed until the user completes the required action
- **Email Login User**: A user who authenticates using email/password rather than OAuth providers like GitHub
- **Dashboard Page**: The main application page at `/dashboard` where users land after successful authentication
- **Supabase Auth**: The authentication service that manages user accounts and metadata
- **User Metadata**: The JSONB data stored in `raw_user_meta_data` containing user profile information
- **UUID**: Universally Unique Identifier used to identify users in the system

## Requirements

### Requirement 1

**User Story:** As an email login user without a display name, I want to be prompted to set my display name immediately after login, so that I can properly identify myself in the application

#### Acceptance Criteria

1. WHEN a user completes email authentication, THE System SHALL check if the user has a display name in their Supabase Auth metadata
2. IF the user does not have a display name (full_name, preferred_username, or user_name are all null or empty), THEN THE System SHALL display a mandatory display name setup modal
3. THE System SHALL navigate the user to the dashboard page before displaying the modal
4. THE mandatory modal SHALL appear on top of the dashboard content
5. THE System SHALL perform the display name check on every login until a display name is set

### Requirement 2

**User Story:** As an email login user, I want a default display name suggestion based on my user ID, so that I have a starting point for my display name

#### Acceptance Criteria

1. WHEN THE Display Name Setup Modal renders, THE Display Name Setup Modal SHALL generate a default display name with the pattern "User-{uuid}"
2. THE Display Name Setup Modal SHALL use the first 8 characters of the user's UUID for the default value
3. THE Display Name Setup Modal SHALL pre-fill the input field with the default display name
4. THE user SHALL be able to modify the pre-filled default value
5. THE default display name SHALL be unique and identifiable

### Requirement 3

**User Story:** As a user setting my display name, I want the modal to be non-dismissible, so that I understand setting a display name is mandatory

#### Acceptance Criteria

1. THE Display Name Setup Modal SHALL NOT include a close button or X icon
2. WHEN the user clicks outside the modal, THE Display Name Setup Modal SHALL remain open
3. WHEN the user presses the Escape key, THE Display Name Setup Modal SHALL remain open
4. THE Display Name Setup Modal SHALL only close after the user successfully submits a valid display name
5. THE Display Name Setup Modal SHALL prevent all interaction with the underlying dashboard content

### Requirement 4

**User Story:** As a user setting my display name, I want to submit my chosen name and have it saved to my profile, so that I can proceed to use the application

#### Acceptance Criteria

1. THE Display Name Setup Modal SHALL include a text input field for entering the display name
2. THE Display Name Setup Modal SHALL include a submit button labeled "Set Display Name" or similar
3. WHEN the user submits the form, THE System SHALL validate that the display name is not empty
4. WHEN the display name is valid, THE System SHALL update the user's `full_name` field in Supabase Auth metadata
5. WHEN the update is successful, THE System SHALL close the modal and allow access to the dashboard
6. IF the update fails, THEN THE System SHALL display an error message and keep the modal open

### Requirement 5

**User Story:** As a user, I want clear instructions in the modal, so that I understand why I need to set a display name

#### Acceptance Criteria

1. THE Display Name Setup Modal SHALL display a title explaining the purpose (e.g., "Set Your Display Name")
2. THE Display Name Setup Modal SHALL include descriptive text explaining why a display name is required
3. THE Display Name Setup Modal SHALL indicate that the display name will be visible to other users
4. THE modal content SHALL be clear, concise, and user-friendly
5. THE modal SHALL follow the application's design system and color palette

### Requirement 6

**User Story:** As a developer, I want the display name check to be reusable, so that it can be triggered from multiple authentication flows

#### Acceptance Criteria

1. THE System SHALL implement a reusable hook or utility function to check for missing display names
2. THE display name check function SHALL return a boolean indicating whether a display name exists
3. THE display name check function SHALL handle null, undefined, and empty string values
4. THE display name check function SHALL check all relevant metadata fields (full_name, preferred_username, user_name)
5. THE display name check function SHALL be usable in both client and server components

### Requirement 7

**User Story:** As a system, I want to handle display name updates gracefully, so that the application remains stable during the setup process

#### Acceptance Criteria

1. WHEN a display name update is in progress, THE System SHALL show a loading state on the submit button
2. THE System SHALL disable the submit button during the update process to prevent duplicate submissions
3. IF the Supabase Auth update fails, THEN THE System SHALL display a user-friendly error message
4. THE System SHALL log errors to the console for debugging purposes
5. WHEN the update succeeds, THE System SHALL refresh the user session to reflect the new display name

### Requirement 8

**User Story:** As a GitHub OAuth user, I want to skip the display name setup, so that I am not prompted unnecessarily since my username is already available

#### Acceptance Criteria

1. WHEN a user authenticates via GitHub OAuth, THE System SHALL check if a display name exists in the metadata
2. IF the GitHub user has a `user_name` or `preferred_username` field, THEN THE System SHALL NOT display the mandatory modal
3. THE System SHALL only display the mandatory modal for users who lack all display name fields
4. THE System SHALL correctly identify OAuth users versus email users
5. THE display name check SHALL work consistently across all authentication methods
