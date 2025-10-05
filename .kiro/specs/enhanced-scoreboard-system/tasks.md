# Implementation Plan

- [x] 1. Database Schema Migration






  - Create new database models: Tag, QuestionTag, QuestionAttempt, UserStats
  - Add new fields to Question model: number, difficulty, isActive, make quizId optional
  - Create database migration scripts with proper indexes
  - _Requirements: 1.1, 2.1, 3.1, 4.1_

- [ ] 2. Update TypeScript Types
  - [ ] 2.1 Add new types to types/index.ts
    - Add Difficulty, AttemptSource enums
    - Add Tag, QuestionTag, QuestionAttempt, UserStats interfaces
    - Add QuestionWithTags, TagWithStats, UserStatsWithComputed interfaces
    - Add new leaderboard types: DailyPointsLeaderboardEntry, QuestionsSolvedLeaderboardEntry
    - Add form data types: CreateTagData, SubmitQuestionAttemptData, QuestionFilters
    - _Requirements: 1.1, 2.1, 3.1, 5.1_

- [ ] 3. Data Migration and Seeding
  - [ ] 3.1 Create data migration utilities
    - Write functions to migrate existing questions to new schema
    - Create default tags from existing quiz titles
    - Link existing questions to appropriate tags
    - Calculate initial UserStats from existing QuizAttempt data
    - _Requirements: 1.1, 2.1, 3.1_

  - [ ] 3.2 Update seed data
    - Add sample tags to seed file
    - Link sample questions to tags
    - Add difficulty levels to sample questions
    - Create sample UserStats entries
    - _Requirements: 1.1, 2.1, 3.1_

- [ ] 4. Individual Question System Backend
  - [ ] 4.1 Create question browsing API
    - Implement GET /api/questions with filtering by tags, difficulty, status
    - Add search functionality by question text
    - Include pagination and sorting options
    - Return questions with tags and user attempt status
    - _Requirements: 2.1, 2.2, 5.1, 5.2, 5.3_

  - [ ] 4.2 Create individual question API
    - Implement GET /api/questions/[id] for single question display
    - Implement POST /api/questions/[id]/attempt for submitting answers
    - Handle answer validation and scoring
    - Update UserStats when question is answered
    - _Requirements: 2.2, 2.3, 2.4, 6.1, 6.2_

  - [ ] 4.3 Create tag management API
    - Implement GET /api/tags for listing all tags
    - Implement GET /api/tags/[id]/questions for questions by tag
    - Add tag statistics (question count, user progress)
    - _Requirements: 1.1, 5.1, 5.2, 6.5_

- [ ] 5. Enhanced Scoreboard Backend
  - [ ] 5.1 Update existing scoreboard API
    - Enhance GET /api/scoreboard to support new query parameters
    - Add type parameter: 'daily-points' | 'questions-solved' | 'recent'
    - Maintain backward compatibility for dashboard Recent Scores
    - _Requirements: 3.1, 3.2, 3.3_

  - [ ] 5.2 Create new leaderboard endpoints
    - Implement GET /api/scoreboard/daily-points for daily quiz points leaderboard
    - Implement GET /api/scoreboard/questions-solved for questions solved leaderboard
    - Add time filtering: all-time, this-week, this-month
    - Include user ranking and statistics
    - _Requirements: 3.1, 3.2, 3.3_

  - [ ] 5.3 Create user statistics API
    - Implement GET /api/user/[id]/stats for user profile statistics
    - Include daily points, questions solved, accuracy, streak
    - Add progress by tag/topic breakdown
    - Include recent activity timeline
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 6. Daily Quiz Integration
  - [ ] 6.1 Update daily quiz submission logic
    - Modify quiz submission to create both QuizAttempt and QuestionAttempt records
    - Update UserStats when daily quiz is completed
    - Ensure daily quiz attempts count toward both metrics
    - _Requirements: 3.4, 4.2, 4.3, 4.4_

  - [ ] 6.2 Maintain backward compatibility
    - Ensure existing quiz system continues to work
    - Keep existing API responses intact for dashboard
    - Test that Recent Scores still displays correctly
    - _Requirements: 3.1, 3.2, 3.3_

- [ ] 7. Question Browser Frontend
  - [ ] 7.1 Create Questions page layout
    - Build main questions page with filter sidebar
    - Implement tag filter checkboxes and difficulty radio buttons
    - Add search bar for question text
    - Create solved/unsolved status toggle
    - _Requirements: 2.1, 5.1, 5.2, 5.3_

  - [ ] 7.2 Create QuestionCard component
    - Display question number "#123", preview text, difficulty badge
    - Show tag chips (max 3, "+X more" if needed)
    - Add solved checkmark icon for completed questions
    - Implement click navigation to individual question page
    - _Requirements: 2.1, 5.4_

  - [ ] 7.3 Implement filtering and pagination
    - Connect filters to API calls with proper query parameters
    - Add pagination controls with page size options
    - Implement sort options: newest, difficulty, most attempted
    - Add loading states and error handling
    - _Requirements: 5.1, 5.2, 5.3_

- [ ] 8. Individual Question Page Frontend
  - [ ] 8.1 Create question display layout
    - Build breadcrumb navigation: Questions > [Tag] > Question #123
    - Display question header with number, difficulty badge, and tags
    - Show question text in clean typography
    - _Requirements: 2.2, 2.4_

  - [ ] 8.2 Implement answer submission
    - Create four answer options (A, B, C, D) with radio button behavior
    - Add submit button (disabled until answer selected)
    - Handle answer submission to API
    - _Requirements: 2.2, 2.3_

  - [ ] 8.3 Create result display
    - Show correct/incorrect result with color coding
    - Display explanation if available
    - Add "Next Question" and "Back to Questions" buttons
    - Show related questions section (same tags)
    - _Requirements: 2.4_

- [ ] 9. Enhanced Scoreboard Frontend
  - [ ] 9.1 Update scoreboard page layout
    - Add tab navigation: "Daily Points" | "Questions Solved"
    - Implement time filter buttons: "All Time" | "This Week" | "This Month"
    - Create responsive layout for both desktop and mobile
    - _Requirements: 3.1, 3.2_

  - [ ] 9.2 Create dual leaderboard tables
    - Build Daily Points leaderboard with columns: Rank, User, Daily Points, Current Streak, Last Active
    - Build Questions Solved leaderboard with columns: Rank, User, Questions Solved, Accuracy, Total Attempted
    - Highlight current user's row with different background
    - Add top 3 badges (🥇🥈🥉)
    - _Requirements: 3.1, 3.2, 3.3_

  - [ ] 9.3 Maintain Recent Scores component
    - Keep existing Recent Scores component for dashboard unchanged
    - Ensure it continues to show recent QuizAttempt entries
    - Test backward compatibility with existing dashboard
    - _Requirements: 3.1, 3.2_

- [ ] 10. User Statistics Page Frontend
  - [ ] 10.1 Create user profile page layout
    - Build header with user email and join date
    - Create stats overview cards grid (2x2): Daily Points, Questions Solved, Current Streak, Global Rank
    - Add trend arrows and icons for visual appeal
    - _Requirements: 6.1, 6.2, 6.3_

  - [ ] 10.2 Implement progress by tag section
    - Create horizontal bar chart showing progress per tag
    - Display solved/total questions for each tag
    - Add color coding by accuracy (green > 80%, yellow 60-80%, red < 60%)
    - _Requirements: 6.5_

  - [ ] 10.3 Create recent activity timeline
    - Display list of recent question attempts and quiz completions
    - Show date, question/quiz name, result (correct/incorrect)
    - Limit to last 20 activities with pagination
    - Add placeholder achievement section for future enhancements
    - _Requirements: 6.4_

- [ ] 11. Navigation and Integration
  - [ ] 11.1 Update header navigation
    - Add new "Questions" menu item in header
    - Update existing navigation to include user stats page
    - Ensure responsive navigation works on mobile
    - _Requirements: 2.1, 6.1_

  - [ ] 11.2 Update dashboard integration
    - Add "Quick Practice" section with random questions by tag
    - Include user stats summary card showing daily points and questions solved
    - Keep existing quiz cards and Recent Scores sections
    - _Requirements: 2.1, 6.1, 6.2_

- [ ] 12. Admin Panel Updates
  - [ ] 12.1 Create tag management interface
    - Add tag creation, editing, and deletion functionality
    - Implement tag assignment to questions
    - Create bulk tag operations for existing questions
    - _Requirements: 1.1, 1.2, 1.3_

  - [ ] 12.2 Update question management
    - Add difficulty level selection to question creation/editing
    - Implement tag assignment interface for questions
    - Add question number display and management
    - Update question listing to show tags and difficulty
    - _Requirements: 1.1, 1.2, 2.1_

- [ ] 13. Testing and Quality Assurance
  - [ ] 13.1 Test data migration
    - Verify existing data migrates correctly to new schema
    - Test that UserStats calculations are accurate
    - Ensure no data loss during migration process
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [ ] 13.2 Test individual question system
    - Verify question browsing with all filter combinations
    - Test individual question answering flow
    - Ensure UserStats updates correctly after question attempts
    - Test tag-based filtering and search functionality
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 5.1, 5.2, 5.3, 5.4_

  - [ ] 13.3 Test enhanced scoreboard
    - Verify both leaderboard types show correct data
    - Test time filtering functionality
    - Ensure backward compatibility with existing Recent Scores
    - Test user statistics page accuracy
    - _Requirements: 3.1, 3.2, 3.3, 6.1, 6.2, 6.3, 6.4, 6.5_

  - [ ] 13.4 Test daily quiz integration
    - Verify daily quiz attempts update both old and new systems
    - Test that daily quiz points are calculated correctly
    - Ensure daily quiz attempts count toward questions solved metric
    - Test backward compatibility with existing quiz system
    - _Requirements: 4.1, 4.2, 4.3, 4.4_