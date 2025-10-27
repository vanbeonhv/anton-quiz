# Scoreboard UI Enhancements - Design Document

## Overview

Thiết kế này cải thiện giao diện người dùng của scoreboard và Recent Scores bằng cách:
- Thay thế icon cột "Rank" bằng huy chương cho top 3 người dùng
- Thêm avatar người dùng bên cạnh tên trong tất cả bảng xếp hạng
- Đảm bảo tính nhất quán về style avatar trên toàn ứng dụng

## Architecture

### Component Structure

#### Existing Components to Modify
- `components/scoreboard/ScoreboardTable.tsx` - Main scoreboard table
- `components/dashboard/RecentScores.tsx` - Recent scores component on dashboard
- `components/shared/UserAvatar.tsx` - Reusable avatar component (if exists, or create new)

#### New Components to Create
- `components/shared/RankDisplay.tsx` - Medal/rank display component
- `components/shared/UserWithAvatar.tsx` - User name with avatar component

### Design System Integration

#### Medal Icons
- **Gold Medal (🥇)**: For rank #1
- **Silver Medal (🥈)**: For rank #2  
- **Bronze Medal (🥉)**: For rank #3
- **Numeric Rank**: #4, #5, #6... for ranks 4 and below

#### Avatar Specifications
- **Size Options**: 
  - Small (24px): For mobile or compact layouts
  - Medium (32px): Default size, consistent with topbar
  - Large (40px): For top 3 users to emphasize their achievement
- **Shape**: Rounded full circle
- **Fallback**: First letter of email in colored background
- **Border**: Optional subtle border for better contrast
- **Loading**: Skeleton placeholder while loading

## Components and Interfaces

### RankDisplay Component

```typescript
interface RankDisplayProps {
  rank: number
  className?: string
}

export function RankDisplay({ rank, className }: RankDisplayProps) {
  // Implementation details:
  // - Show medal emoji for ranks 1-3
  // - Show "#4", "#5", etc. for ranks 4+
  // - Apply consistent styling and spacing
  // - Support custom className for layout flexibility
}
```

**Visual Design:**
- Medal emojis should be 20px size for good visibility
- Numeric ranks should use consistent typography (font-medium)
- Center-aligned in table cell
- Proper spacing and padding

### UserWithAvatar Component

```typescript
interface UserWithAvatarProps {
  userEmail: string
  avatarUrl?: string | null
  displayName?: string
  className?: string
  avatarSize?: 'sm' | 'md' | 'lg' // Default 'md' (32px)
  rank?: number // Used to determine if user is in top 3 for larger avatar
}

export function UserWithAvatar({ 
  userEmail, 
  avatarUrl, 
  displayName, 
  className,
  avatarSize,
  rank
}: UserWithAvatarProps) {
  // Implementation details:
  // - Use existing UserAvatar component or create new one
  // - Display avatar on left, name on right
  // - Handle long names with truncation
  // - Auto-determine avatar size: 'lg' for ranks 1-3, 'md' for others (unless avatarSize is explicitly provided)
  // - Consistent spacing between avatar and name (8px gap)
  // - Larger avatars for top 3 users to emphasize achievement
}
```

**Layout Design:**
```
[Avatar] Username
  32px   8px gap
```

### Enhanced UserAvatar Component

```typescript
interface UserAvatarProps {
  userEmail: string
  avatarUrl?: string | null
  size?: 'sm' | 'md' | 'lg' // sm=24px, md=32px, lg=40px
  className?: string
  showBorder?: boolean
}

export function UserAvatar({ 
  userEmail, 
  avatarUrl, 
  size = 'md',
  className,
  showBorder = false 
}: UserAvatarProps) {
  // Implementation details:
  // - Try to load avatarUrl first
  // - Fallback to first letter of email with colored background
  // - Use consistent color generation based on email hash
  // - Apply proper sizing based on size prop (sm=24px, md=32px, lg=40px)
  // - Handle loading states with skeleton
  // - Support optional border for better contrast
  // - Top 3 users (ranks 1-3) should use 'lg' size for emphasis
}
```

**Fallback Avatar Design:**
- Background colors: Use a set of 8-10 pleasant colors
- Text color: White or dark based on background contrast
- Font: Semi-bold, uppercase letter
- Color selection: Hash email to consistently pick same color

## UI/UX Design Changes

### Scoreboard Table Updates

#### Before:
```
| Rank | User              | Questions Solved |
|------|-------------------|------------------|
| 1    | nguyen_ngoclinh   | 2 solved         |
| 2    | hoaiky1802        | 2 solved         |
| 3    | anreo.me+github   | 2 solved         |
```

#### After:
```
| Rank | User                              | Questions Solved |
|------|-----------------------------------|------------------|
| 🥇   | [Large Avatar] nguyen_ngoclinh    | 2 solved         |
| 🥈   | [Large Avatar] hoaiky1802         | 2 solved         |
| 🥉   | [Large Avatar] anreo.me+github    | 2 solved         |
| #4   | [Avatar] nguyen_vanhung           | 1 solved         |
| #5   | [Avatar] chu_minhduc              | 1 solved         |
```

**Note:** Top 3 users (🥇🥈🥉) have larger avatars (40px) to emphasize their achievement, while others use standard size (32px).

### Recent Scores Updates

#### Before:
```
Recent Scores
| Rank | User              | Score | Date |
|------|-------------------|-------|------|
| 1    | nguyen_ngoclinh   | 85%   | Today|
```

#### After:
```
Recent Scores  
| Rank | User                           | Score | Date |
|------|--------------------------------|-------|------|
| 🥇   | [Large Avatar] nguyen_ngoclinh  | 85%   | Today|
| 🥈   | [Large Avatar] hoaiky1802       | 78%   | Today|
| #4   | [Avatar] nguyen_vanhung         | 65%   | Today|
```

**Note:** Top 3 users in Recent Scores also get larger avatars to maintain consistency.

### Responsive Design Considerations

#### Desktop (≥768px)
- Large avatars (40px) for top 3 users, standard (32px) for others
- Medal emojis at full size (20px)
- Comfortable spacing between elements
- Complete username display

#### Mobile (<768px)
- Medium avatars (32px) for top 3 users, small (24px) for others
- Maintain medal visibility
- Truncate long usernames with ellipsis
- Adjust spacing for smaller screens
- Stack elements if needed for very narrow screens

## Data Models

### Enhanced Types

```typescript
// Extend existing leaderboard types to include avatar data
export interface LeaderboardEntryWithAvatar extends LeaderboardEntry {
  avatarUrl?: string | null
}

// For Recent Scores
export interface RecentScoreWithAvatar extends RecentScore {
  avatarUrl?: string | null
}

// Avatar data fetching
export interface UserAvatarData {
  userEmail: string
  avatarUrl?: string | null
  displayName?: string
}
```

### API Enhancements

#### Existing Endpoints to Modify

```typescript
// GET /api/scoreboard - Include avatar data
// Response should include avatarUrl for each user entry

// GET /api/scoreboard/daily-points - Include avatar data  
// GET /api/scoreboard/questions-solved - Include avatar data

// For Recent Scores (dashboard)
// Existing endpoint should include avatar data for each entry
```

**Implementation Note:** 
- Avatar URLs should come from Supabase Auth user metadata
- For GitHub OAuth users, use GitHub avatar URL
- For email users, avatarUrl will be null (use fallback)

## Error Handling

### Avatar Loading
- **Failed to load image**: Show fallback with first letter
- **No avatar URL**: Immediately show fallback
- **Slow loading**: Show skeleton placeholder, timeout after 3 seconds
- **Invalid URL**: Gracefully fallback to letter avatar

### Medal Display
- **Invalid rank**: Show numeric rank as fallback
- **Missing rank data**: Show "-" or empty state
- **Rank 0 or negative**: Handle edge case gracefully

### Responsive Breakpoints
- **Very narrow screens**: Ensure medals don't break layout
- **Long usernames**: Truncate with tooltip on hover
- **Avatar loading on slow connections**: Show skeleton state

## Testing Strategy

### Visual Testing
- Test medal display for ranks 1-10
- Verify avatar loading and fallback states
- Check responsive behavior on different screen sizes
- Validate consistent styling across scoreboard and recent scores

### Accessibility Testing
- Ensure medal emojis have proper alt text/aria-labels
- Verify avatar images have appropriate alt attributes
- Test keyboard navigation and focus states
- Check color contrast for fallback avatars

### Performance Testing
- Test avatar loading performance with multiple users
- Verify no layout shift during avatar loading
- Check memory usage with many avatar images
- Test caching behavior for repeated avatar loads

### Cross-browser Testing
- Verify medal emoji rendering across browsers
- Test avatar border-radius support
- Check fallback avatar color consistency
- Validate responsive design on different devices

## Implementation Notes

### Existing Code Integration
- Leverage existing Supabase Auth user data for avatars
- Reuse existing responsive design patterns
- Maintain current table styling and spacing
- Preserve existing sorting and filtering functionality

### Performance Optimizations
- Lazy load avatars outside viewport
- Cache avatar URLs in memory
- Use CSS for consistent avatar sizing
- Optimize medal emoji rendering

### Accessibility Considerations
- Add aria-labels for medal rankings ("Gold medal - Rank 1")
- Ensure avatar alt text includes user identification
- Maintain proper heading hierarchy in tables
- Support high contrast mode for fallback avatars

### Future Enhancements
- Animated medal effects on hover
- User profile modal on avatar click
- Custom avatar upload functionality
- Achievement badges alongside medals