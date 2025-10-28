# Implementation Plan

- [x] 1. Create daily question utility functions
  - Create `lib/utils/dailyQuestion.ts` with core logic for selecting today's daily question
  - Implement `calculateDailyQuestionNumber()` function using date + hardcoded salt to generate deterministic question number
  - Implement `getDailyQuestion()` function to fetch question by calculated number with fallback logic
  - Implement `getNextResetTime()` function to calculate next 8 AM GMT+7 reset time
  - Implement `formatTimeUntilReset()` function to format countdown display (e.g., "5h 23m")
  - Implement `hasAttemptedDailyQuestion()` function to check if user already attempted today's daily question
  - Add constants for salt, timezone, reset hour, and daily points (Easy: 10, Medium: 25, Hard: 50)
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 2. Create API endpoint for daily question info
  - Create `app/api/daily-question/route.ts` with GET handler
  - Implement logic to return today's daily question metadata (id, number, difficulty, resetTime, timeUntilReset)
  - Use `getDailyQuestion()` utility to fetch question
  - Add authentication check using Supabase
  - Include user's attempt status (hasAttempted, isCompleted) in response
  - Handle errors when daily question cannot be determined
  - _Requirements: 1.1, 1.2, 1.3, 2.4_

- [x] 3. Update question attempt API to handle daily questions
  - Modify `app/api/questions/[id]/attempt/route.ts` to accept `isDailyQuestion` flag in request body
  - Add server-side validation to verify question ID matches today's daily question when `isDailyQuestion` is true
  - Implement check to prevent duplicate daily question attempts (query QuestionAttempt by userId + questionId + today's date)
  - Implement daily points calculation based on difficulty (Easy: 10, Medium: 25, Hard: 50)
  - Update UserStats with daily points when correct answer is submitted
  - Return appropriate error messages for duplicate attempts or invalid daily question
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 4.5_

- [x] 4. Create DailyQuestionButton component
  - Create `components/dashboard/DailyQuestionButton.tsx` component
  - Fetch daily question info from `/api/daily-question` endpoint using React Query
  - Display "Daily Question" button with difficulty badge
  - Implement real-time countdown timer that updates every minute showing time until reset
  - Show completion status if user has already solved today's daily question
  - Handle click to navigate to `/questions/[id]?type=daily`
  - Add loading and error states
  - Style with existing design system (primary-green, bg-white, rounded-xl)
  - Make responsive for mobile devices
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 5. Update dashboard page to show daily question
  - Modify `app/dashboard/page.tsx` to replace "Browse Questions" button with DailyQuestionButton component
  - Update Quick Actions section layout to accommodate daily question button
  - Keep "View Scoreboard" button in Quick Actions
  - Add "Browse Questions" as secondary action or move to different section
  - Ensure responsive layout works on mobile
  - _Requirements: 2.1_

- [x] 6. Enhance question page to support daily mode
  - Modify `app/questions/[id]/page.tsx` to detect `type=daily` URL parameter
  - Pass `isDailyQuestion` prop to IndividualQuestionPage component
  - Update `components/questions/IndividualQuestionPage.tsx` to accept `isDailyQuestion` prop
  - Display "Daily Challenge" badge when in daily mode
  - Show points indicator based on difficulty (10/25/50 points)
  - Update answer submission to include `isDailyQuestion: true` flag in API request
  - Show special success message when daily question is completed correctly
  - Handle error when user has already attempted today's daily question
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 7. Add TypeScript types for daily question feature
  - Update `types/index.ts` with daily question related types
  - Add `DailyQuestionInfo` interface for API response
  - Add `DailyQuestionConfig` interface for configuration
  - Add `DailyQuestionAttemptRequest` interface extending existing attempt request
  - Add `DAILY_POINTS` constant type
  - _Requirements: 1.1, 3.1, 4.5_

- [ ]* 8. Add error handling and edge cases
  - Handle case when no questions available for calculated number (fallback to adjacent numbers)
  - Handle case when calculated question is inactive (recalculate with offset)
  - Add proper error messages for all failure scenarios
  - Add validation to prevent URL manipulation (verify question ID server-side)
  - Handle timezone edge cases consistently using GMT+7
  - _Requirements: 1.1, 1.3, 1.4, 5.4_

- [ ]* 9. Test daily question functionality
  - Verify daily question selection is deterministic (same date = same question)
  - Verify different dates produce different questions
  - Verify reset time calculation is correct for GMT+7
  - Verify countdown timer displays and updates correctly
  - Verify points are awarded correctly (Easy: 10, Medium: 25, Hard: 50)
  - Verify duplicate attempt prevention works
  - Verify URL manipulation is blocked by server validation
  - Test mobile responsive design
  - _Requirements: 1.1, 1.2, 2.4, 3.1, 3.2, 3.3, 3.5_
