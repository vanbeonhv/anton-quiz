# User Level System Design

## Overview

The User Level System extends the existing Anton Questions App with an XP-based progression system. Users earn experience points for correctly answering questions and advance through developer-themed levels. The system integrates seamlessly with the existing question attempt flow and user statistics tracking.

## Architecture

### Database Schema Changes

The existing `UserStats` model will be extended with XP tracking fields:

```prisma
model UserStats {
  // ... existing fields
  totalXp              Int       @default(0)
  currentLevel         Int       @default(1)
  currentTitle         String    @default("Newbie")
}
```

### Level Configuration

The system uses a TypeScript configuration file that hardcodes the level data in the backend. This configuration includes:
- 20 levels from "Newbie" to "Architect"
- Cumulative XP requirements for each level
- Developer-themed titles reflecting career progression
- Converted from the existing `docs/Level-exp.json` for better type safety and performance

### XP Award System

XP is awarded based on question difficulty:
- EASY: 10 XP (matches existing daily points)
- MEDIUM: 25 XP (matches existing daily points)  
- HARD: 50 XP (matches existing daily points)

XP is only awarded for the first correct answer to each question to prevent farming.

## Components and Interfaces

### Level Calculator Service

```typescript
interface LevelCalculatorService {
  calculateLevel(totalXp: number): LevelInfo
  calculateXpToNextLevel(currentLevel: number, totalXp: number): number
  checkLevelUp(previousXp: number, newXp: number): boolean
}

interface LevelInfo {
  level: number
  title: string
  xpRequired: number
}
```

### Enhanced API Response

The question attempt API response will be extended:

```typescript
interface QuestionAttemptResponse {
  // ... existing fields
  status: "success"
  xpEarned: number
  userProgress: {
    currentLevel: number
    currentTitle: string
    totalXp: number
    xpToNextLevel: number
    leveledUp: boolean
    newTitle?: string // Only present when leveledUp is true
  }
}
```

## Data Models

### Level Data Structure

The level configuration follows this structure:
```typescript
interface LevelConfig {
  level: number
  title: string
  cumulativeXpNeeded: number
}
```

### XP Calculation Logic

1. Check if user has previously answered the question correctly
2. If first correct attempt, award XP based on difficulty
3. Calculate new total XP
4. Determine new level using cumulative XP thresholds
5. Check if level increased from previous level
6. Calculate XP needed for next level

## Error Handling

### XP Calculation Errors
- Invalid difficulty values default to 0 XP
- Level calculation failures default to level 1
- Database transaction failures roll back all changes

### Level Configuration Errors
- Level calculation bounds checking prevents overflow
- Maximum level cap handling (level 20)
- Minimum level enforcement (level 1)

## Testing Strategy

### Unit Tests
- Level calculation with various XP amounts
- XP award logic for different difficulties
- Level-up detection across thresholds
- Edge cases (max level, zero XP)

### Integration Tests  
- End-to-end question attempt with XP award
- Database transaction integrity
- API response format validation
- Level progression across multiple questions