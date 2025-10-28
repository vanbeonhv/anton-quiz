# Implementation Plan

- [x] 1. Add totalDailyPoints field to database schema
  - Update `prisma/schema.prisma` to add `totalDailyPoints Int @default(0)` field to UserStats model
  - Add index on totalDailyPoints for leaderboard query performance
  - _Requirements: 4.1, 4.2_

- [ ] 2. Create and run database migration
  - Generate Prisma migration with `npx prisma migrate dev --name add_total_daily_points`
  - Verify migration SQL adds the field with default value 0
  - Manually add index creation SQL to migration: `CREATE INDEX "UserStats_totalDailyPoints_idx" ON "UserStats"("totalDailyPoints")`
  - Run migration to apply changes to database
  - Note: No backfill needed since database was wiped
  - _Requirements: 4.3, 4.4_

- [x] 3. Fix question attempt API to track points correctly
  - Modify `app/api/questions/[id]/attempt/route.ts` to fix the bug in line 119-120
  - Remove the problematic logic: `const correctAnswersIncrement = isCorrect ? (dailyPoints > 0 ? dailyPoints : 1) : 0`
  - Change `totalCorrectAnswers` to always increment by 1 when correct (not by points value)
  - Add `totalDailyPoints` increment with calculated points: `getDailyPoints(question.difficulty)` for correct answers
  - Calculate points for ALL correct answers (not just daily questions - remove isDailyQuestion check)
  - Ensure points are only awarded for correct answers (0 for incorrect)
  - Update both the update branch (line 121-147) and create branch (line 165-180) of the UserStats transaction
  - _Requirements: 4.2, 1.1_

- [x] 4. Fix dashboard to display correct metrics
  - Update `components/dashboard/StatsSection.tsx` line 31 to pass `totalDailyPoints` instead of `totalQuestionsAnswered` to UserStatsCard
  - Verify UserStatsCard component correctly displays the dailyPoints prop (already correct)
  - _Requirements: 1.1, 1.2, 5.2_

- [x] 5. Fix daily points leaderboard API
  - Update `app/api/scoreboard/daily-points/route.ts` line 30 to sort by `totalDailyPoints` instead of `totalQuestionsAnswered`
  - Change orderBy clause to: `{ totalDailyPoints: 'desc' }`
  - Update line 35 response mapping to use `totalDailyPoints: stats.totalDailyPoints` instead of `stats.totalQuestionsAnswered`
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 6. Verify Questions Solved leaderboard is correct
  - Reviewed `components/scoreboard/QuestionsSolvedLeaderboard.tsx` - displays totalCorrectAnswers correctly ✓
  - Reviewed `app/api/scoreboard/questions-solved/route.ts` - uses correct fields and sorting ✓
  - No changes needed (already correct)
  - _Requirements: 2.1, 2.2, 2.3_

- [x] 7. Update TypeScript types
  - Reviewed `types/index.ts` - UserStats interface already includes all necessary fields ✓
  - DAILY_POINTS constants are properly exported and available ✓
  - No changes needed (already correct)
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] 8. Test the complete flow manually
  - Submit Easy question (correct) and verify +10 points to totalDailyPoints, +1 to totalCorrectAnswers
  - Submit Medium question (correct) and verify +25 points to totalDailyPoints, +1 to totalCorrectAnswers
  - Submit Hard question (correct) and verify +50 points to totalDailyPoints, +1 to totalCorrectAnswers
  - Submit incorrect answer and verify +0 points, +0 correct answers
  - Check dashboard displays correct point total from totalDailyPoints (not question count)
  - Check Questions Solved leaderboard ranks by totalCorrectAnswers
  - Check Daily Points leaderboard ranks by totalDailyPoints
  - Verify the two leaderboards show different rankings based on their respective metrics
  - _Requirements: 1.1, 2.1, 3.1, 5.1_
