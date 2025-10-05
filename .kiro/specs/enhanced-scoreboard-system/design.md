# Enhanced Scoreboard System - Design Document

## Overview

Thiết kế này chuyển đổi hệ thống quiz hiện tại thành một hệ thống giống LeetCode, nơi:
- Topic trở thành tags cho từng câu hỏi riêng lẻ
- Câu hỏi có thể được trả lời độc lập
- Scoreboard có hai metrics: điểm daily quiz và tổng câu hỏi đã trả lời đúng
- Chỉ daily quiz mới cho điểm, câu hỏi độc lập chỉ tính vào số câu đã trả lời

## Architecture

### Database Schema Changes

#### New Models

```prisma
// Tag system for questions
model Tag {
  id          String   @id @default(cuid())
  name        String   @unique
  description String?
  color       String?  // Hex color for UI display
  createdAt   DateTime @default(now())
  
  // Relations
  questions   QuestionTag[]
  
  @@index([name])
}

// Many-to-many relationship between Questions and Tags
model QuestionTag {
  id         String   @id @default(cuid())
  questionId String
  tagId      String
  
  question   Question @relation(fields: [questionId], references: [id], onDelete: Cascade)
  tag        Tag      @relation(fields: [tagId], references: [id], onDelete: Cascade)
  
  @@unique([questionId, tagId])
  @@index([questionId])
  @@index([tagId])
}

// Individual question attempts (separate from quiz attempts)
model QuestionAttempt {
  id         String   @id @default(cuid())
  
  // Question reference
  questionId String
  question   Question @relation(fields: [questionId], references: [id], onDelete: Cascade)
  
  // User info
  userId     String
  userEmail  String
  
  // Answer
  selectedAnswer String  // 'A', 'B', 'C', or 'D'
  isCorrect     Boolean
  
  // Context - where this attempt came from
  source        AttemptSource @default(INDIVIDUAL)
  quizAttemptId String?       // If from quiz, reference to QuizAttempt
  
  // Timestamps
  answeredAt DateTime @default(now())
  
  @@index([userId])
  @@index([questionId])
  @@index([userId, questionId]) // For checking if user answered this question
  @@index([source])
}

enum AttemptSource {
  INDIVIDUAL  // Answered as standalone question
  DAILY_QUIZ  // Answered as part of daily quiz
  NORMAL_QUIZ // Answered as part of normal quiz
}

// User statistics aggregation table for performance
model UserStats {
  id                    String   @id @default(cuid())
  userId                String   @unique
  userEmail             String
  
  // Daily quiz metrics
  totalDailyPoints      Int      @default(0)
  dailyQuizStreak       Int      @default(0)
  lastDailyQuizDate     DateTime?
  
  // Question metrics
  totalQuestionsAnswered Int     @default(0)
  totalCorrectAnswers    Int     @default(0)
  
  // Timestamps
  updatedAt             DateTime @updatedAt
  
  @@index([totalDailyPoints])
  @@index([totalCorrectAnswers])
  @@index([userId])
}
```

#### Modified Models

```prisma
// Update Question model to support independent questions
model Question {
  id        String   @id @default(cuid())
  number    Int      @default(autoincrement()) // For display as "#1", "#2", etc.
  quizId    String?  // Make optional - questions can exist without quiz
  quiz      Quiz?    @relation(fields: [quizId], references: [id], onDelete: Cascade)
  
  // Question content (unchanged)
  text      String   @db.Text
  optionA   String
  optionB   String
  optionC   String
  optionD   String
  correctAnswer String
  explanation   String? @db.Text
  
  // Remove order field - not needed for independent questions
  // order     Int
  
  // New fields
  difficulty    Difficulty @default(MEDIUM)
  isActive      Boolean    @default(true)
  
  // Timestamps
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Relations
  tags              QuestionTag[]
  answers           Answer[]           // Keep for quiz attempts
  questionAttempts  QuestionAttempt[]  // New for individual attempts
  
  @@index([quizId])
  @@index([number])     // For sorting by question number
  @@index([difficulty])
  @@index([isActive])
  @@index([createdAt])
}

enum Difficulty {
  EASY
  MEDIUM
  HARD
}
```

### Data Migration Strategy

1. **Create new tables**: Tag, QuestionTag, QuestionAttempt, UserStats
2. **Migrate existing data**:
   - Create default tags from existing quiz titles
   - Link questions to their quiz-based tags
   - Migrate existing Answer records to QuestionAttempt records
   - Calculate initial UserStats from existing QuizAttempt data
3. **Update Question model**: Make quizId optional, add new fields

## UI/UX Design Changes

### Navigation Updates
- Add new "Questions" menu item in header navigation
- Keep existing "Dashboard", "Scoreboard" menu items
- Update "Scoreboard" to show dual metrics

### Dashboard Page Updates
- Keep existing quiz cards layout
- Keep "Recent Scores" section showing recent quiz attempts
- Add new section "Quick Practice" with random questions by tag
- Add user stats summary card showing daily points and questions solved

### New Questions Page
- Replace or supplement existing quiz-based navigation
- Grid layout similar to LeetCode problems page
- Each question card shows:
  - Question title/preview
  - Difficulty badge (Easy/Medium/Hard)
  - Tag chips
  - Solved status (checkmark icon)
  - Accuracy rate if attempted

### Enhanced Scoreboard Page
- Tab navigation: "Daily Points" | "Questions Solved"
- Time filter: "All Time" | "This Week" | "This Month"
- Leaderboard table with appropriate columns for each tab
- User's current rank highlighted

### Individual Question Page
- Clean question display similar to LeetCode
- Tag chips below question
- Answer options with radio buttons
- Submit button
- After submission: show result, explanation, and "Next Question" button
- Breadcrumb navigation back to questions list

### User Profile/Stats Page (New)
- Overview cards: Daily Points, Questions Solved, Current Streak
- Progress charts by tag/difficulty
- Recent activity timeline
- Achievement badges (future enhancement)

## Components and Interfaces

### Frontend Components

#### Question Browser
```typescript
interface QuestionBrowserProps {
  filters: QuestionFilters
  onFilterChange: (filters: QuestionFilters) => void
}

// Features:
// - Filter sidebar with tag checkboxes, difficulty radio buttons
// - Search bar for question text
// - Solved/unsolved status toggle
// - Question grid with cards showing:
//   * Question number "#1", "#2", etc.
//   * Question preview (first 100 chars)
//   * Difficulty badge with color coding
//   * Tag chips (max 3, show "+2 more" if more)
//   * Solved checkmark icon
//   * Click to navigate to individual question page
// - Pagination with page size options
// - Sort options: "Newest", "Difficulty", "Most Attempted"
```

#### Individual Question Page
```typescript
interface IndividualQuestionProps {
  questionId: string
  showSimilar?: boolean
}

// Layout:
// - Breadcrumb: Questions > [Tag] > Question #123
// - Question header with number "#123", difficulty badge and tags
// - Question text in clean typography
// - Four answer options (A, B, C, D) with radio button behavior
// - Submit button (disabled until answer selected)
// - After submission:
//   * Show correct/incorrect result with color coding
//   * Display explanation if available
//   * Show "Next Question" and "Back to Questions" buttons
//   * Related questions section (same tags)
// - Progress indicator if coming from filtered set
```

#### Enhanced Scoreboard
```typescript
interface ScoreboardProps {
  activeTab: ScoreboardType
  timeFilter: 'all-time' | 'this-week' | 'this-month'
}

// Layout:
// - Tab navigation at top: "Daily Points" | "Questions Solved"
// - Time filter buttons: "All Time" | "This Week" | "This Month"
// - Leaderboard table with columns based on active tab:
//   
//   Daily Points Tab:
//   * Rank | User | Daily Points | Current Streak | Last Active
//   
//   Questions Solved Tab:
//   * Rank | User | Questions Solved | Accuracy | Total Attempted
//
// - Current user's row highlighted with different background
// - Top 3 users get special badges (🥇🥈🥉)
// - Pagination for large leaderboards
// - Loading skeleton while fetching data

// Keep existing Recent Scores component for dashboard
interface RecentScoresProps {
  limit?: number // Default 5
}
// Shows recent QuizAttempt entries (both daily and normal quizzes)
// Layout unchanged from current implementation
```

#### User Profile/Stats (New Page)
```typescript
interface UserStatsProps {
  userId: string
}

// Layout:
// - Header with user email and join date
// - Stats overview cards in grid (2x2):
//   * Daily Points (with trend arrow)
//   * Questions Solved (with accuracy percentage)
//   * Current Streak (with fire icon)
//   * Global Rank (with position change)
//
// - Progress by Tag section:
//   * Horizontal bar chart showing progress per tag
//   * Each bar shows: solved/total questions for that tag
//   * Color coding by accuracy (green > 80%, yellow 60-80%, red < 60%)
//
// - Recent Activity timeline:
//   * List of recent question attempts and quiz completions
//   * Show date, question/quiz name, result (correct/incorrect)
//   * Limit to last 20 activities
//
// - Achievement section (placeholder for future):
//   * Badge grid for future achievement system
```

### API Endpoints

#### Question Management
```typescript
// GET /api/questions - Browse questions with filters
// GET /api/questions/[id] - Get individual question
// POST /api/questions/[id]/attempt - Submit answer to individual question

// GET /api/tags - Get all available tags
// GET /api/tags/[id]/questions - Get questions by tag
```

#### Scoreboard
```typescript
// Enhanced scoreboard endpoints
// GET /api/scoreboard/daily-points - Daily quiz points leaderboard
// GET /api/scoreboard/questions-solved - Questions solved leaderboard

// Backward compatibility - keep existing endpoint but enhance response
// GET /api/scoreboard - Enhanced to support new dual metrics
//   Query params: 
//   - type: 'daily-points' | 'questions-solved' | 'recent' (default: 'recent' for backward compatibility)
//   - filter: 'all-time' | 'this-week' | 'this-month'
//   - limit: number

// User statistics
// GET /api/user/[id]/stats - User statistics and progress
```

#### Admin
```typescript
// POST /api/admin/tags - Create new tag
// PUT /api/admin/tags/[id] - Update tag
// DELETE /api/admin/tags/[id] - Delete tag
// POST /api/admin/questions/[id]/tags - Add tags to question
// DELETE /api/admin/questions/[id]/tags/[tagId] - Remove tag from question
```

## Data Models

### Core Types (to be added to types/index.ts)

```typescript
// ============================================
// NEW ENUMS
// ============================================

export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD'
export type AttemptSource = 'INDIVIDUAL' | 'DAILY_QUIZ' | 'NORMAL_QUIZ'

// ============================================
// NEW DATABASE MODELS
// ============================================

export interface Tag {
  id: string
  name: string
  description?: string
  color?: string
  createdAt: Date
}

export interface QuestionTag {
  id: string
  questionId: string
  tagId: string
}

export interface QuestionAttempt {
  id: string
  questionId: string
  userId: string
  userEmail: string
  selectedAnswer: OptionKey
  isCorrect: boolean
  source: AttemptSource
  quizAttemptId?: string
  answeredAt: Date
}

export interface UserStats {
  id: string
  userId: string
  userEmail: string
  totalDailyPoints: number
  dailyQuizStreak: number
  lastDailyQuizDate?: Date
  totalQuestionsAnswered: number
  totalCorrectAnswers: number
  updatedAt: Date
}

// ============================================
// EXTENDED TYPES (with relations)
// ============================================

// Extend existing Question interface with new fields and tags
export interface QuestionWithTags extends Omit<Question, 'quizId' | 'order'> {
  number: number    // For display as "#1", "#2", etc.
  quizId?: string   // Make optional
  difficulty: Difficulty
  isActive: boolean
  tags: Tag[]
  userAttempt?: QuestionAttempt // If user has attempted this question
}

export interface TagWithStats extends Tag {
  questionCount: number // Computed field
}

export interface UserStatsWithComputed extends UserStats {
  accuracyPercentage: number // Computed field
  tagStats: TagStats[] // Computed field
}

export interface TagStats {
  tagId: string
  tagName: string
  totalQuestions: number
  answeredQuestions: number
  correctAnswers: number
  accuracyPercentage: number
}

// ============================================
// NEW LEADERBOARD TYPES
// ============================================

export interface DailyPointsLeaderboardEntry {
  rank: number
  userId: string
  userEmail: string
  totalDailyPoints: number
  dailyQuizStreak: number
  updatedAt: Date
}

export interface QuestionsSolvedLeaderboardEntry {
  rank: number
  userId: string
  userEmail: string
  totalCorrectAnswers: number
  totalQuestionsAnswered: number
  accuracyPercentage: number
  updatedAt: Date
}

export type ScoreboardType = 'daily-points' | 'questions-solved'

// ============================================
// FORM DATA TYPES
// ============================================

export interface CreateTagData {
  name: string
  description?: string
  color?: string
}

export interface SubmitQuestionAttemptData {
  questionId: string
  selectedAnswer: OptionKey
}

export interface QuestionFilters {
  tags: string[]
  difficulty: Difficulty[]
  status: 'all' | 'solved' | 'unsolved'
  search?: string
}
```

## Error Handling

### Question Attempt Validation
- Validate question exists and is active
- Validate selected answer is valid option (A, B, C, D)
- Prevent duplicate attempts for same question by same user
- Handle concurrent attempts gracefully

### Daily Quiz Integration
- Ensure daily quiz attempts are properly recorded in both systems (QuizAttempt + QuestionAttempt)
- Maintain backward compatibility with existing quiz system
- Handle edge cases where user attempts daily quiz multiple times
- Update UserStats when daily quiz is completed

### Backward Compatibility
- Keep existing /api/scoreboard endpoint working for dashboard "Recent Scores"
- Enhance response to include both old format and new metrics
- Existing QuizAttempt and Answer models remain unchanged
- Dashboard Recent Scores will show recent quiz attempts (both daily and normal)

### Data Consistency
- Use database transactions for multi-table updates
- Implement proper foreign key constraints
- Handle cascade deletes appropriately
- Maintain UserStats consistency with actual attempt data

## Testing Strategy

### Unit Tests
- Question attempt submission logic
- Scoring calculation algorithms
- User statistics aggregation
- Tag filtering and search functionality

### Integration Tests
- End-to-end question answering flow
- Daily quiz integration with new scoring system
- Scoreboard data accuracy
- User statistics updates

### Performance Tests
- Question browsing with large datasets
- Leaderboard query performance
- User statistics calculation efficiency
- Tag-based filtering performance

### Migration Tests
- Data migration from old to new schema
- Backward compatibility verification
- Data integrity validation

## Performance Considerations

### Database Optimization
- Proper indexing on frequently queried fields
- UserStats table for aggregated data to avoid expensive calculations
- Pagination for question browsing and leaderboards
- Caching for tag lists and popular questions

### Frontend Optimization
- Virtual scrolling for large question lists
- Debounced search and filtering
- Optimistic updates for question attempts
- Lazy loading of question details

### Caching Strategy
- Cache tag lists (rarely change)
- Cache user statistics (update periodically)
- Cache leaderboard data (refresh every few minutes)
- Cache question metadata for browsing

## Migration Plan

### Phase 1: Schema Updates
1. Create new tables (Tag, QuestionTag, QuestionAttempt, UserStats)
2. Add new fields to Question table
3. Create necessary indexes

### Phase 2: Data Migration
1. Create default tags from existing quiz titles
2. Link existing questions to appropriate tags
3. Migrate Answer records to QuestionAttempt records
4. Calculate initial UserStats from existing data

### Phase 3: Feature Implementation
1. Implement individual question answering
2. Build question browser with tag filtering
3. Update scoreboard with dual metrics
4. Add user statistics page

### Phase 4: Integration & Testing
1. Ensure daily quiz still works with new system
2. Test data consistency between old and new systems
3. Performance testing with migrated data
4. User acceptance testing

### Phase 5: Cleanup
1. Remove unused fields/tables if any
2. Optimize queries based on usage patterns
3. Final performance tuning
4. Documentation updates