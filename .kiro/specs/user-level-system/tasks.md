# Implementation Plan

- [ ] 1. Update database schema with XP and level fields
  - Add totalXp, currentLevel, and currentTitle fields to UserStats model in Prisma schema
  - Create and run database migration to add the new fields
  - _Requirements: 1.4, 2.1_

- [x] 2. Create level configuration system
  - [x] 2.1 Create TypeScript level configuration file
    - Convert docs/Level-exp.json to TypeScript configuration in lib/utils/levels.ts
    - Define LevelConfig interface and export level data array
    - _Requirements: 2.1_
  
  - [x] 2.2 Implement level calculation service
    - Create LevelCalculatorService with calculateLevel, calculateXpToNextLevel, and checkLevelUp methods
    - Add utility functions for level progression logic
    - _Requirements: 2.1, 2.2, 2.5_

- [x] 3. Update TypeScript types for XP system
  - [x] 3.1 Extend UserStats interface with XP fields
    - Add totalXp, currentLevel, currentTitle to UserStats interface in types/index.ts
    - Update UserStatsWithComputed interface to include XP-related computed fields
    - _Requirements: 1.4, 2.2_
  
  - [x] 3.2 Create XP system response types
    - Define QuestionAttemptResponse interface with xpEarned and userProgress fields
    - Create UserProgress interface with level progression data
    - _Requirements: 2.3, 2.4, 3.3_

- [x] 4. Implement XP award logic in question attempt API
  - [x] 4.1 Add XP calculation to question attempt handler
    - Modify app/api/questions/[id]/attempt/route.ts to calculate XP based on difficulty
    - Implement first-time correct answer validation for XP awards
    - _Requirements: 1.1, 1.2, 1.3_
  
  - [x] 4.2 Update database transaction with XP and level updates
    - Add totalXp increment and level calculation to the existing transaction
    - Update currentLevel and currentTitle fields when user levels up
    - _Requirements: 1.4, 2.5, 3.5_
  
  - [x] 4.3 Enhance API response with XP and level data
    - Return xpEarned, userProgress object with level information
    - Include leveledUp flag and newTitle when user advances
    - _Requirements: 1.5, 2.3, 2.4, 3.1, 3.2, 3.4_

- [x] 5. Update user statistics queries and API endpoints
  - [x] 5.1 Update user stats API to include XP fields
    - Modify app/api/user/stats/route.ts to return XP and level information
    - Update app/api/user/[id]/stats/route.ts for profile views
    - _Requirements: 2.2_
  
  - [x] 5.2 Update React Query hooks for XP data
    - Modify useUserStats and useUserProfileStats in lib/queries.ts
    - Update optimistic update functions to handle XP changes
    - _Requirements: 2.2_

- [x] 6. Create XP gain and level-up UI components
  - [x] 6.1 Create XP gain modal component
    - Build XpGainModal component to show XP earned after answering questions
    - Include animated XP counter and progress bar to next level
    - Display current level, title, and XP progress visually
    - _Requirements: 3.6_
  
  - [x] 6.2 Create level-up celebration modal
    - Build LevelUpModal component with congratulations animation
    - Show old vs new level, new title, and celebration effects
    - Include confetti or other celebratory animations
    - _Requirements: 3.6_
  
  - [x] 6.3 Integrate modals with question attempt flow
    - Update question practice components to show XP modal after each answer
    - Trigger level-up modal when leveledUp flag is true in API response
    - Ensure modals work for both individual questions and daily questions
    - _Requirements: 3.6_

- [x] 7. Update existing UI to display level information
  - [x] 7.1 Add level display to user profile and dashboard
    - Show current level, title, and XP progress in user profile
    - Add level badge or indicator in dashboard header/navigation
    - _Requirements: 2.2_
  
  - [x] 7.2 Update scoreboard to include level information
    - Display user levels and titles in leaderboard components
    - Consider adding level-based filtering or sorting options
    - _Requirements: 2.2_

- [ ]* 8. Add unit tests for XP system
  - [ ]* 8.1 Test level calculation service
    - Write tests for calculateLevel with various XP amounts
    - Test XP to next level calculations and level-up detection
    - _Requirements: 2.1, 2.2, 2.5_
  
  - [ ]* 8.2 Test XP award logic
    - Test XP calculation for different difficulties
    - Test first-time answer validation and duplicate prevention
    - _Requirements: 1.1, 1.2, 1.3_
  
  - [ ]* 8.3 Test UI components
    - Test XP gain modal displays correct information
    - Test level-up modal triggers and animations
    - Test modal integration with question attempt flow
    - _Requirements: 3.6_