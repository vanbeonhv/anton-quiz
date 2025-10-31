# Next Unanswered Question Feature

## Overview

This feature implements a "Next Unanswered Question" functionality that allows users to continuously practice by automatically navigating to random unanswered questions after completing one.

## Implementation

### API Endpoint

**`GET /api/questions/next-unanswered`**

- Returns a random question ID that the user hasn't attempted yet
- Returns `{ questionId: null }` if all questions have been attempted
- Requires authentication

### Query Hook

**`useNextUnansweredQuestion()`**

- React Query hook that fetches the next unanswered question ID
- Automatically refetches when user submits an answer
- Returns `{ questionId: string | null, remainingQuestions: number }`

### UI Changes

**IndividualQuestionPage Component**

- Added "Next Unanswered Question" button (replaces generic "Next Question")
- Button shows loading state while fetching next question
- Automatically navigates to next random unanswered question
- Shows success message when all questions are completed

## User Experience

1. User answers a question
2. Clicks "Next Unanswered Question" button
3. System finds a random question they haven't attempted
4. User is navigated to that question
5. Process continues until all questions are answered

## Benefits

- **Continuous Practice**: Users can practice without interruption
- **Random Selection**: Prevents predictable question order
- **Progress Awareness**: Clear indication when all questions are completed
- **Efficient Navigation**: No need to manually browse for unanswered questions

## Technical Details

- Uses Prisma to query unanswered questions efficiently
- Implements client-side loading states for better UX
- Integrates with existing React Query caching system
- Maintains separation between daily questions and regular practice