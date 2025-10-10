-- Drop quiz-related tables and update schema

-- Drop foreign key constraints first
ALTER TABLE "Question" DROP CONSTRAINT IF EXISTS "Question_quizId_fkey";

-- Drop quiz-related tables
DROP TABLE IF EXISTS "Answer";
DROP TABLE IF EXISTS "QuizAttempt";
DROP TABLE IF EXISTS "Quiz";

-- Remove quiz-related columns from Question table
ALTER TABLE "Question" DROP COLUMN IF EXISTS "quizId";
ALTER TABLE "Question" DROP COLUMN IF EXISTS "order";

-- Remove quiz-related columns from UserStats table
ALTER TABLE "UserStats" DROP COLUMN IF EXISTS "totalQuizzesTaken";
ALTER TABLE "UserStats" DROP COLUMN IF EXISTS "dailyQuizzesTaken";

-- Remove quiz-related columns from QuestionAttempt table
ALTER TABLE "QuestionAttempt" DROP COLUMN IF EXISTS "source";

-- Drop quiz-related enums
DROP TYPE IF EXISTS "QuizType";
DROP TYPE IF EXISTS "AttemptSource";

-- Drop unused indexes
DROP INDEX IF EXISTS "Question_quizId_idx";
DROP INDEX IF EXISTS "Question_quizId_order_idx";