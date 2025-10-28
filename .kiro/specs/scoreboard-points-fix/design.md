# Design Document

## Overview

This design addresses the bug where points and question counts are being incorrectly displayed throughout the application. The core issue is that the system uses `totalQuestionsAnswered` as a placeholder for daily points, when it should calculate actual points based on question difficulty (Easy: 10, Medium: 25, Hard: 50).

The solution involves:
1. Adding a `totalDailyPoints` field to the UserStats model
2. Updating the question attempt logic to track points correctly
3. Fixing all display components to show the correct metrics
4. Creating a migration to backfill existing data

## Architecture

### Database Schema Changes

**UserStats Model Update:**
```prisma
model UserStats {
  // ... existing fields ...
  totalDailyPoints        Int       @default(0)  // NEW FIELD
  // ... rest of fields ...
}
```

### Data Flow

```
Question Attempt Submission
    ↓
Calculate Points (based on difficulty + correctness)
    ↓
Update UserStats (increment totalDailyPoints)
    ↓
Display in Dashboard/Scoreboard
```

### Point Calculation Logic

Points are awarded ONLY for correct answers:
- Easy question: 10 points
- Medium question: 25 points  
- Hard question: 50 points
- Incorrect answer: 0 points

## Components and Interfaces

### 1. Database Migration

**File:** `prisma/migrations/YYYYMMDD_add_total_daily_points/migration.sql`

```sql
-- Add totalDailyPoints field to UserStats
ALTER TABLE "UserStats" ADD COLUMN "totalDailyPoints" INTEGER NOT NULL DEFAULT 0;

-- Backfill existing data by calculating points from QuestionAttempts
UPDATE "UserStats" us
SET "totalDailyPoints" = (
  SELECT COALESCE(SUM(
    CASE 
      WHEN qa."isCorrect" = true THEN
        CASE q.difficulty
          WHEN 'EASY' THEN 10
          WHEN 'MEDIUM' THEN 25
          WHEN 'HARD' THEN 50
          ELSE 0
        END
      ELSE 0
    END
  ), 0)
  FROM "QuestionAttempt" qa
  JOIN "Question" q ON qa."questionId" = q.id
  WHERE qa."userId" = us."userId"
);

-- Add index for performance
CREATE INDEX "UserStats_totalDailyPoints_idx" ON "UserStats"("totalDailyPoints");
```

### 2. Question Attempt API Update

**File:** `app/api/questions/[id]/attempt/route.ts`

**Current Issue:**
The code currently has this problematic logic:
```typescript
// WRONG: Using daily points value as increment for totalCorrectAnswers
const correctAnswersIncrement = isCorrect ? (dailyPoints > 0 ? dailyPoints : 1) : 0

await tx.userStats.update({
  data: {
    totalCorrectAnswers: { increment: correctAnswersIncrement }
  }
})
```

**Fixed Logic:**
```typescript
// Calculate points based on difficulty (only for correct answers)
const pointsEarned = isCorrect ? getDailyPoints(question.difficulty) : 0

await tx.userStats.update({
  data: {
    totalQuestionsAnswered: { increment: 1 },
    totalCorrectAnswers: isCorrect ? { increment: 1 } : undefined,
    totalDailyPoints: { increment: pointsEarned },
    // ... rest of updates
  }
})
```

**Key Changes:**
- `totalCorrectAnswers` always increments by 1 (not by points)
- `totalDailyPoints` increments by calculated points
- Points are calculated for ALL correct answers (not just daily questions)

### 3. Dashboard Components

**File:** `components/dashboard/StatsSection.tsx`

**Current Issue:**
```typescript
<UserStatsCard
  dailyPoints={data?.totalQuestionsAnswered || 0}  // WRONG
  questionsSolved={data?.totalCorrectAnswers || 0}
/>
```

**Fixed:**
```typescript
<UserStatsCard
  dailyPoints={data?.totalDailyPoints || 0}  // CORRECT
  questionsSolved={data?.totalCorrectAnswers || 0}
/>
```

### 4. Scoreboard API Updates

**File:** `app/api/scoreboard/daily-points/route.ts`

**Current Issue:**
```typescript
const leaderboard = userStats.map((stats, index) => ({
  totalDailyPoints: stats.totalQuestionsAnswered,  // WRONG
  dailyQuizStreak: stats.currentStreak,
}))
```

**Fixed:**
```typescript
const leaderboard = userStats.map((stats, index) => ({
  totalDailyPoints: stats.totalDailyPoints,  // CORRECT
  dailyQuizStreak: stats.currentStreak,
}))

// Also update the orderBy clause
orderBy: [
  { totalDailyPoints: 'desc' },  // Sort by points, not questions
  { updatedAt: 'asc' }
]
```

### 5. Questions Solved Leaderboard

**File:** `components/scoreboard/QuestionsSolvedLeaderboard.tsx`

**Current Status:** This component is already correct! It displays:
- `totalCorrectAnswers` as "Questions Solved" ✓
- `totalQuestionsAnswered` as "Total Attempted" ✓
- Accuracy percentage calculated correctly ✓

No changes needed here.

## Data Models

### UserStats (Updated)

```typescript
interface UserStats {
  id: string
  userId: string
  userEmail: string
  totalQuestionsAnswered: number      // Total attempts (correct + incorrect)
  totalCorrectAnswers: number         // Count of correct answers
  totalDailyPoints: number            // NEW: Sum of points earned
  easyQuestionsAnswered: number
  easyCorrectAnswers: number
  mediumQuestionsAnswered: number
  mediumCorrectAnswers: number
  hardQuestionsAnswered: number
  hardCorrectAnswers: number
  currentStreak: number
  longestStreak: number
  lastAnsweredDate?: Date
  createdAt: Date
  updatedAt: Date
}
```

### Point Calculation Constants

**File:** `types/index.ts` (already exists)

```typescript
export const DAILY_POINTS = {
  EASY: 10,
  MEDIUM: 25,
  HARD: 50,
} as const
```

## Error Handling

### Migration Errors

- If migration fails, roll back and log error
- Ensure backfill calculation handles NULL values with COALESCE
- Handle cases where questions may have been deleted

### API Errors

- If point calculation fails, log error but don't block attempt submission
- Ensure transaction rollback if any part of stats update fails
- Return appropriate error messages to client

### Display Errors

- If `totalDailyPoints` is undefined, default to 0
- Handle loading states gracefully
- Show error states if data fetch fails

## Testing Strategy

### Unit Tests (Optional)

- Test point calculation logic for each difficulty level
- Test that incorrect answers award 0 points
- Test UserStats update logic

### Integration Tests (Optional)

- Test full flow: submit answer → update stats → display points
- Test migration backfill calculation
- Test leaderboard sorting by points

### Manual Testing (Required)

1. **Migration Testing:**
   - Run migration on development database
   - Verify totalDailyPoints values match expected calculations
   - Check that existing users have correct point totals

2. **Question Attempt Testing:**
   - Submit correct answer for Easy question → verify +10 points
   - Submit correct answer for Medium question → verify +25 points
   - Submit correct answer for Hard question → verify +50 points
   - Submit incorrect answer → verify +0 points
   - Verify totalCorrectAnswers increments by 1 (not by points)

3. **Dashboard Testing:**
   - Verify "Daily Points" shows totalDailyPoints value
   - Verify "Questions Solved" shows totalCorrectAnswers value
   - Check that numbers are different (points should be higher)

4. **Scoreboard Testing:**
   - Verify Questions Solved leaderboard ranks by totalCorrectAnswers
   - Verify Daily Points leaderboard ranks by totalDailyPoints
   - Check that rankings differ between the two leaderboards

5. **Edge Cases:**
   - New user with no attempts → 0 points, 0 questions
   - User with only incorrect answers → 0 points, 0 correct
   - User with mixed difficulties → correct point sum

## Implementation Notes

### Order of Implementation

1. **Database Migration** - Must be first to add the field
2. **Question Attempt API** - Update to track points correctly
3. **Dashboard Components** - Fix display to use new field
4. **Scoreboard APIs** - Update to use and sort by new field
5. **Testing** - Verify all changes work correctly

### Backward Compatibility

- The `totalDailyPoints` field defaults to 0 for new records
- Migration backfills existing records automatically
- No breaking changes to API contracts
- Frontend components gracefully handle missing field with default value

### Performance Considerations

- Add index on `totalDailyPoints` for efficient leaderboard queries
- Migration backfill may take time on large datasets (run during low traffic)
- Consider batching backfill updates if dataset is very large

## Affected Files Summary

### Files to Modify:
1. `prisma/schema.prisma` - Add totalDailyPoints field
2. `app/api/questions/[id]/attempt/route.ts` - Fix point tracking logic
3. `components/dashboard/StatsSection.tsx` - Use correct field
4. `app/api/scoreboard/daily-points/route.ts` - Use and sort by correct field

### Files Already Correct:
1. `components/scoreboard/QuestionsSolvedLeaderboard.tsx` - No changes needed
2. `app/api/scoreboard/questions-solved/route.ts` - No changes needed
3. `types/index.ts` - DAILY_POINTS constants already defined

### New Files:
1. Migration file for adding totalDailyPoints field
