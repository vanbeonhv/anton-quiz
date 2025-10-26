# Design Document

## Overview

The Loading Overlay Component is a reusable React component that provides a consistent loading experience across the application. It addresses the specific UX issue in the Individual Question Page where users briefly see "already attempted" messages during API calls, creating a jarring experience. The component will wrap content and display a loading spinner overlay when async operations are in progress.

## Architecture

### Component Structure
```
LoadingOverlay
├── Overlay Container (absolute positioned)
│   ├── Semi-transparent Background
│   └── Centered Spinner Container
│       ├── Loader2 Icon (animated)
│       └── Optional Loading Text
└── Children Content (wrapped)
```

### Integration Points
- **Individual Question Page**: Wraps the submit button and result display area
- **React Query Mutations**: Uses `isPending` state from mutations to control loading
- **Design System**: Leverages existing color tokens and spacing

## Components and Interfaces

### LoadingOverlay Component

```typescript
interface LoadingOverlayProps {
  isLoading: boolean
  children: React.ReactNode
  loadingText?: string
  className?: string
}

export function LoadingOverlay({
  isLoading,
  children,
  loadingText = "Loading...",
  className
}: LoadingOverlayProps): JSX.Element
```

**Props:**
- `isLoading`: Boolean to control overlay visibility
- `children`: Content to wrap with loading overlay
- `loadingText`: Optional text to display with spinner (default: "Loading...")
- `className`: Optional CSS classes for container styling

**Behavior:**
- When `isLoading` is true, displays overlay with spinner
- When `isLoading` is false, shows children normally
- Maintains original layout dimensions
- Prevents interaction with wrapped content during loading

### Updated IndividualQuestionPage Integration

The component will be integrated into the Individual Question Page to wrap the answer submission area:

```typescript
// Wrap the submit button and result area
<LoadingOverlay isLoading={submitAttemptMutation.isPending}>
  <div className="space-y-6">
    {/* Submit button */}
    {!result && !hasAttempted && (
      <div className="flex justify-center">
        <Button onClick={handleSubmit} disabled={!selectedAnswer}>
          Submit Answer
        </Button>
      </div>
    )}
    
    {/* Already attempted message */}
    {hasAttempted && !result && (
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-100 text-orange-800">
          Already attempted
        </div>
      </div>
    )}
    
    {/* Result display */}
    {result && (
      <div className="space-y-6">
        {/* Result content */}
      </div>
    )}
  </div>
</LoadingOverlay>
```

## Data Models

### Loading State Management
- **Source**: React Query mutation `isPending` state
- **Flow**: User clicks submit → `isPending` becomes true → overlay shows → API completes → `isPending` becomes false → overlay hides

### Component State
- **No internal state required**: Component is purely controlled by props
- **Stateless design**: Ensures predictable behavior and easier testing

## Error Handling

### Loading State Errors
- **Timeout Protection**: Component relies on React Query's built-in timeout handling
- **Error Recovery**: When mutation fails, `isPending` automatically becomes false, hiding overlay
- **Graceful Degradation**: If loading prop is undefined, defaults to false (no overlay)

### Accessibility Considerations
- **ARIA Labels**: Spinner includes `aria-label="Loading"` for screen readers
- **Focus Management**: Overlay prevents focus on wrapped content during loading
- **Reduced Motion**: Respects `prefers-reduced-motion` for spinner animation

## Testing Strategy

### Unit Tests
- **Props Handling**: Verify correct rendering based on `isLoading` prop
- **Children Rendering**: Ensure children are properly displayed when not loading
- **Accessibility**: Test ARIA attributes and keyboard navigation
- **CSS Classes**: Verify proper styling application

### Integration Tests
- **Individual Question Page**: Test loading overlay during answer submission
- **Mutation States**: Verify overlay shows/hides correctly with React Query states
- **User Interaction**: Ensure buttons are disabled during loading

### Visual Regression Tests
- **Overlay Appearance**: Verify spinner positioning and background opacity
- **Layout Preservation**: Ensure wrapped content maintains dimensions
- **Animation Smoothness**: Test spinner rotation and fade transitions

## Implementation Details

### Tailwind CSS Classes
```typescript
// Container classes
const containerClasses = "relative"

// Overlay backdrop classes
const overlayClasses = "absolute inset-0 bg-white/80 flex items-center justify-center z-10"

// Spinner classes
const spinnerClasses = "w-8 h-8 animate-spin text-primary-green"
```

### Styling Approach
- **Tailwind Utilities**: Uses only Tailwind CSS classes for all styling
- **No Custom CSS**: Leverages existing design system tokens
- **Responsive**: Built-in responsive behavior with Tailwind classes

### Animation
- **Spinner**: Uses existing `animate-spin` Tailwind class
- **Background**: Semi-transparent white overlay using `bg-white/80`
- **Performance**: CSS transforms for optimal rendering performance

### Responsive Design
- **Mobile Compatibility**: Overlay works on all screen sizes
- **Touch Interaction**: Prevents accidental taps during loading
- **Viewport Considerations**: Spinner remains visible in scrollable content

## File Structure

```
components/
├── shared/
│   ├── LoadingOverlay.tsx     # New reusable component
│   └── LoadingState.tsx       # Existing component (unchanged)
└── questions/
    └── IndividualQuestionPage.tsx  # Updated to use LoadingOverlay
```

## Migration Strategy

### Phase 1: Component Creation
1. Create `LoadingOverlay` component in `components/shared/`
2. Implement core functionality with TypeScript interfaces
3. Add comprehensive unit tests

### Phase 2: Integration
1. Update `IndividualQuestionPage` to use `LoadingOverlay`
2. Wrap submit button area with loading overlay
3. Connect to `submitAttemptMutation.isPending` state

### Phase 3: Enhancement
1. Add fade transitions for smoother UX
2. Implement accessibility improvements
3. Add visual regression tests

## Design Decisions

### Why Overlay Instead of Inline Loading?
- **Layout Stability**: Prevents content jumping during state changes
- **User Focus**: Clearly indicates what area is being processed
- **Reusability**: Can wrap any content that needs loading states

### Why Controlled Component?
- **Predictability**: Parent components have full control over loading state
- **Testability**: Easier to test with explicit prop values
- **Integration**: Works seamlessly with React Query mutation states

### Why Minimal Props?
- **Simplicity**: Reduces complexity and potential for misuse
- **Performance**: Fewer props mean fewer re-renders
- **Consistency**: Enforces consistent loading experience across app