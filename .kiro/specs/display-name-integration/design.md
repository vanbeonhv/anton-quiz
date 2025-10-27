# Design Document

## Overview

This design implements display name integration from Supabase Auth across the application's user interface components. Based on the actual Supabase Auth user metadata structure, we will use the `user_name` field (for GitHub users) or the `full_name` field (for email users) from the `raw_user_meta_data` in the `auth.users` table. The solution extends existing API endpoints to fetch these display names and updates frontend components to display them instead of email-derived usernames.

**Note:** After reviewing the actual Supabase Auth response, the available fields in `user_metadata` are:
- For GitHub users: `user_name`, `preferred_username`
- For email users: potentially `full_name` (if set in Supabase UI)
- The field name in the database is stored in `raw_user_meta_data` JSONB column

## Architecture

### Data Flow

```
Supabase Auth (auth.users table)
    ↓ (SQL query for display_name)
API Layer (scoreboard routes)
    ↓ (include displayName in response)
React Components (Header, Leaderboards)
    ↓ (render displayName with fallback)
User Interface
```

### Component Hierarchy

```
Header Component
  └─ getDisplayName() → uses user.user_metadata.display_name

LeaderboardTable Component
  └─ UserWithAvatar Component → receives displayName prop

QuestionsSolvedLeaderboard Component
  └─ UserWithAvatar Component → receives displayName prop
```

## Components and Interfaces

### 1. API Layer Changes

#### Scoreboard API (`app/api/scoreboard/route.ts`)

**Current Implementation:**
- Fetches `avatar_url` from `auth.users.raw_user_meta_data`
- Returns `userEmail`, `avatarUrl` in leaderboard entries

**Enhanced Implementation:**
- Extend SQL query to fetch both `avatar_url` and `display_name`
- Add `displayName` field to leaderboard response

```typescript
// Enhanced SQL query
const authUsers = await prisma.$queryRaw<Array<{ 
  id: string; 
  raw_user_meta_data: any 
}>>`
  SELECT id, raw_user_meta_data 
  FROM auth.users 
  WHERE id = ANY(${userIds}::uuid[])
`

// Extract avatar and display name from available metadata fields
authUsers.forEach((user) => {
  const avatarUrl = user.raw_user_meta_data?.avatar_url || null
  // Priority: full_name > preferred_username > user_name
  const displayName = user.raw_user_meta_data?.full_name || 
                      user.raw_user_meta_data?.preferred_username || 
                      user.raw_user_meta_data?.user_name || 
                      null
  avatarMap.set(user.id, { avatarUrl, displayName })
})
```

#### Questions Solved API (`app/api/scoreboard/questions-solved/route.ts`)

**Current Implementation:**
- Returns basic user stats without avatar or display name
- Only includes `userEmail` field

**Enhanced Implementation:**
- Add SQL query to fetch `avatar_url` and `display_name` from `auth.users`
- Include `avatarUrl` and `displayName` in response

### 2. Type Definitions

#### Update `types/index.ts`

```typescript
export interface QuestionsSolvedLeaderboardEntry {
  rank: number
  userId: string
  userEmail: string
  avatarUrl?: string | null
  displayName?: string | null  // NEW FIELD
  totalCorrectAnswers: number
  totalQuestionsAnswered: number
  accuracyPercentage: number
  updatedAt: Date
}
```

### 3. Frontend Components

#### Header Component (`components/layout/Header.tsx`)

**Current Implementation:**
- `getDisplayName()` checks `full_name`, `user_name`, `name`, then falls back to email

**Enhanced Implementation:**
- Update `getDisplayName()` to prioritize `display_name` field
- Maintain existing fallback chain

```typescript
function getDisplayName(user: SupabaseUser): string {
  // Priority order based on actual Supabase Auth metadata:
  // 1. full_name (if user set it in Supabase UI or during signup)
  // 2. preferred_username (GitHub preferred username)
  // 3. user_name (GitHub username)
  // 4. name (generic name field)
  // 5. Email-based fallback
  
  if (user.user_metadata?.full_name) {
    return user.user_metadata.full_name
  }
  if (user.user_metadata?.preferred_username) {
    return user.user_metadata.preferred_username
  }
  if (user.user_metadata?.user_name) {
    return user.user_metadata.user_name
  }
  if (user.user_metadata?.name) {
    return user.user_metadata.name
  }
  if (user.email) {
    return user.email.split('@')[0]
  }
  return 'User'
}
```

#### UserWithAvatar Component (`components/shared/UserWithAvatar.tsx`)

**Current Implementation:**
- Accepts `displayName` prop (optional)
- Falls back to `userEmail` if `displayName` not provided

**Enhanced Implementation:**
- No changes needed - component already supports `displayName` prop
- Existing fallback logic handles missing display names

#### LeaderboardTable Component (`components/dashboard/LeaderboardTable.tsx`)

**Current Implementation:**
- Derives display name from email: `entry.userEmail.split('@')[0]`

**Enhanced Implementation:**
- Pass `displayName` from API response to `UserWithAvatar`
- Remove email-based name derivation

```typescript
<UserWithAvatar
  userEmail={entry.userEmail}
  avatarUrl={entry.avatarUrl}
  displayName={entry.displayName || entry.userEmail.split('@')[0]}
  rank={entry.rank}
/>
```

#### QuestionsSolvedLeaderboard Component (`components/scoreboard/QuestionsSolvedLeaderboard.tsx`)

**Current Implementation:**
- Derives display name from email: `entry.userEmail.split('@')[0]`

**Enhanced Implementation:**
- Pass `displayName` from API response to `UserWithAvatar`
- Maintain fallback to email-based derivation

## Data Models

### Supabase Auth Schema

```sql
-- auth.users table (managed by Supabase)
CREATE TABLE auth.users (
  id uuid PRIMARY KEY,
  email text,
  raw_user_meta_data jsonb,
  -- other fields...
)

-- raw_user_meta_data structure (actual fields from Supabase Auth)
-- For GitHub users:
{
  "avatar_url": "https://avatars.githubusercontent.com/...",
  "preferred_username": "vanbeonhv",  -- GitHub preferred username (PRIORITY)
  "user_name": "vanbeonhv",  -- GitHub username
  "email": "user@example.com",
  "provider_id": "44753130",
  "sub": "44753130"
}

-- For email users (potentially):
{
  "full_name": "John Doe",  -- If set in Supabase UI
  "email": "user@example.com"
}
```

### API Response Schema

```typescript
// Leaderboard Entry Response
{
  rank: number
  userId: string
  userEmail: string
  avatarUrl: string | null
  displayName: string | null  // NEW
  totalCorrectAnswers: number
  totalQuestionsAnswered: number
  accuracyPercentage: number
  updatedAt: Date
}
```

## Error Handling

### Database Query Failures

**Strategy:** Graceful degradation with logging

```typescript
try {
  const authUsers = await prisma.$queryRaw(...)
  // Process display names
} catch (error) {
  console.warn('Failed to fetch user display names:', error)
  // Continue with null displayName values
}
```

### Missing Display Names

**Strategy:** Multi-level fallback chain

1. Use `displayName` from API if available
2. Fall back to email-based derivation: `email.split('@')[0]`
3. Ultimate fallback: `'User'`

### Type Safety

- All `displayName` fields are typed as `string | null | undefined`
- Components handle null/undefined cases explicitly
- No runtime errors from missing display names

## Testing Strategy

### Unit Testing

1. **API Layer Tests**
   - Test display name extraction from `raw_user_meta_data`
   - Test fallback when display name is null
   - Test error handling when auth query fails

2. **Component Tests**
   - Test `getDisplayName()` function with various user metadata combinations
   - Test `UserWithAvatar` with and without `displayName` prop
   - Test leaderboard components with missing display names

### Integration Testing

1. **End-to-End Scenarios**
   - User with display name set → displays correctly in header and leaderboards
   - User without display name → falls back to email-based name
   - Database query failure → application continues functioning

### Manual Testing Checklist

- [ ] Header displays current user's display name
- [ ] Dashboard leaderboard shows display names
- [ ] Scoreboard page shows display names
- [ ] Fallback works for users without display names
- [ ] Application handles auth query failures gracefully
- [ ] No console errors related to display names

## Implementation Notes

### Backward Compatibility

- All changes are additive (new fields, not replacements)
- Existing email-based fallback logic preserved
- Components continue to work with old API responses

### Performance Considerations

- Single SQL query fetches all user metadata (avatar + display name)
- No additional database round trips
- Existing query patterns maintained

### Security Considerations

- Display names are user-provided data (sanitization handled by Supabase)
- No sensitive information exposed in display names
- Existing authentication and authorization unchanged
