# User Level Drawer Improvement Design

## Overview

This design transforms the current tooltip-based user level display into a robust drawer system with centralized state management. The solution addresses positioning bugs in the existing tooltip implementation while providing a more scalable architecture for user level data sharing across the application.

## Architecture

### Component Architecture

```
App
├── UserLevelProvider (Context Provider)
│   ├── useUserStats() hook integration
│   └── Centralized level data state
├── LevelBadge (Updated)
│   ├── Simplified click handler
│   └── Drawer trigger functionality
└── LevelDrawer (New)
    ├── Drawer component (shadcn/ui)
    ├── Level progression display
    └── Rich user information
```

### State Management Flow

1. **UserLevelProvider** wraps the application and manages user level data
2. **useUserStats** hook is called once at the provider level
3. Level data is distributed via React Context to all consuming components
4. **LevelBadge** components access data from context instead of individual API calls
5. **LevelDrawer** receives data from context and displays comprehensive information

## Components and Interfaces

### UserLevelProvider Context

```typescript
interface UserLevelContextType {
  userStats: (UserStats & { xpToNextLevel: number }) | null
  isLoading: boolean
  error: Error | null
  openDrawer: () => void
  closeDrawer: () => void
  isDrawerOpen: boolean
}

interface UserLevelProviderProps {
  children: React.ReactNode
}
```

### Updated LevelBadge Component

```typescript
interface LevelBadgeProps {
  level?: number // Optional - will use context if not provided
  title?: string // Optional - will use context if not provided
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
  className?: string
  variant?: 'clickable' | 'display-only' // New prop for behavior control
}
```

### New LevelDrawer Component

```typescript
interface LevelDrawerProps {
  // No props needed - uses context for all data
}

interface LevelProgressionItemProps {
  level: number
  title: string
  xpRequired: number
  isCurrentLevel: boolean
  isPastLevel: boolean
  isFutureLevel: boolean
}
```

### Shadcn/ui Drawer Integration

The drawer component will be added using:
```bash
npx shadcn-ui@latest add drawer
```

Configuration will include:
- Right-side positioning by default
- Responsive behavior for mobile/desktop
- Proper z-index management
- Accessibility features (ARIA labels, keyboard navigation)

## Data Models

### Enhanced Context State

```typescript
interface UserLevelState {
  userStats: UserStatsWithLevel | null
  isLoading: boolean
  error: Error | null
  drawerState: {
    isOpen: boolean
    position: 'left' | 'right' | 'top' | 'bottom'
  }
}

interface UserStatsWithLevel extends UserStats {
  xpToNextLevel: number
  progressPercentage: number
  nextLevelTitle: string
  levelsUntilNext: number
}
```

### Level Progression Display Data

```typescript
interface LevelProgressionData {
  currentLevel: number
  totalLevels: number
  levels: LevelProgressionItem[]
  userProgress: {
    currentXp: number
    totalXp: number
    xpToNext: number
    progressPercentage: number
  }
}

interface LevelProgressionItem {
  level: number
  title: string
  cumulativeXpNeeded: number
  xpForThisLevel: number
  status: 'completed' | 'current' | 'locked'
  colorScheme: string
}
```

## Implementation Strategy

### Phase 1: Drawer Component Setup
1. Install and configure shadcn/ui drawer component
2. Create base LevelDrawer component with basic layout
3. Implement drawer open/close functionality

### Phase 2: Context Provider Implementation
1. Create UserLevelProvider with React Context
2. Integrate with existing useUserStats hook
3. Add drawer state management to context
4. Implement error handling and loading states

### Phase 3: Component Updates
1. Update LevelBadge to use context data
2. Remove tooltip logic from LevelBadge
3. Add drawer trigger functionality to LevelBadge
4. Implement backward compatibility for existing props

### Phase 4: Rich Drawer Content
1. Port existing tooltip content to drawer
2. Enhance with additional user information
3. Implement progressive color schemes
4. Add animations and micro-interactions

### Phase 5: Application Integration
1. Wrap application with UserLevelProvider
2. Update all LevelBadge usage throughout the app
3. Remove redundant useUserStats calls
4. Test consistency across all pages

## Error Handling

### Context Provider Error States
- Network failures during user stats fetching
- Authentication errors when user is not logged in
- Graceful degradation when level data is unavailable
- Retry mechanisms for transient failures

### Component Error Boundaries
- LevelDrawer wrapped in error boundary
- Fallback UI for drawer rendering failures
- Logging for debugging drawer-related issues

### Loading States
- Skeleton loading for LevelBadge when data is not available
- Progressive loading for drawer content
- Optimistic updates when user levels up

## Testing Strategy

### Unit Tests
- UserLevelProvider context functionality
- LevelBadge component with and without context data
- LevelDrawer rendering with various user states
- Drawer open/close state management

### Integration Tests
- End-to-end drawer interaction flow
- Context data consistency across components
- Level progression display accuracy
- Responsive behavior testing

### Accessibility Tests
- Keyboard navigation through drawer
- Screen reader compatibility
- Focus management when drawer opens/closes
- ARIA label and role verification

## Migration Strategy

### Backward Compatibility
- Existing LevelBadge props remain functional
- Gradual migration of components to use context
- Fallback to individual API calls if context is not available
- No breaking changes to existing component APIs

### Rollout Plan
1. Deploy drawer component and context provider
2. Update Header component first (highest visibility)
3. Gradually migrate other components
4. Remove tooltip logic after all components are migrated
5. Clean up redundant useUserStats calls

## Performance Considerations

### Data Fetching Optimization
- Single API call for user stats instead of multiple calls
- Proper caching with React Query integration
- Reduced network requests across the application
- Optimized re-renders with React Context best practices

### Component Rendering
- Memoization of expensive level calculations
- Lazy loading of drawer content
- Efficient color scheme calculations
- Minimal re-renders when drawer state changes

### Bundle Size Impact
- Shadcn/ui drawer component adds minimal overhead
- Tree-shaking of unused drawer features
- Code splitting for drawer content if needed
- Overall reduction in duplicate code across components