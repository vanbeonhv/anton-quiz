# Design Document

## Overview

This design transforms the Anton Questions App from a fully authenticated application to a public-first experience where users can browse and explore content without logging in. Authentication is only required when users attempt to submit answers, at which point they are prompted with a modal dialog to log in or sign up. This approach reduces friction for new users while maintaining the value of user accounts for progress tracking and engagement features.

The implementation involves modifying the middleware authentication logic, creating a reusable authentication modal component, updating the question submission flow to check authentication state, and ensuring API endpoints handle both authenticated and unauthenticated requests appropriately.

## Architecture

### High-Level Flow

```
User visits app
    ↓
Middleware checks route
    ↓
Is route public? (questions, scoreboard, home)
    ├─ Yes → Allow access
    └─ No → Check authentication
        ├─ Authenticated → Allow access
        └─ Not authenticated → Redirect to login

User browses questions (no auth required)
    ↓
User selects answer
    ↓
Check authentication state
    ├─ Authenticated → Submit answer immediately
    └─ Not authenticated → Show auth modal
        ├─ User logs in → Submit answer
        └─ User closes modal → Return to question
```

### Component Architecture

```
App Layout
├── Middleware (route protection)
├── Public Pages
│   ├── Landing Page (public, redirects to dashboard if authenticated)
│   ├── Questions Page (public)
│   ├── Question Detail Page (public)
│   └── Scoreboard Page (public)
├── Protected Pages
│   ├── Dashboard (requires auth)
│   ├── Profile (requires auth)
│   └── Admin (requires auth)
└── Shared Components
    └── AuthPromptModal (new)
```

## Components and Interfaces

### 1. Middleware Updates

**File**: `middleware.ts`

**Changes**:
- Define public routes that don't require authentication
- Update authentication check to allow public routes
- Maintain protection for dashboard, profile, and admin routes

**Public Routes**:
- `/` (landing page for unauthenticated users, redirects to dashboard for authenticated users)
- `/questions` (question list)
- `/questions/[id]` (individual question)
- `/scoreboard` (leaderboard)
- `/login` (auth pages)
- `/auth` (auth callbacks)
- `/api/questions` (public question data)
- `/api/scoreboard` (public leaderboard data)
- `/api/tags` (public tag data)
- `/api/metrics` (monitoring)

**Protected Routes**:
- `/dashboard`
- `/profile`
- `/admin`
- `/api/questions/[id]/attempt` (answer submission)
- `/api/user` (user data)

**Implementation**:
```typescript
const publicRoutes = [
  '/',
  '/questions',
  '/scoreboard',
  '/login',
  '/auth'
]

const publicApiRoutes = [
  '/api/questions',
  '/api/scoreboard',
  '/api/tags',
  '/api/metrics',
  '/api/daily-question'
]

function isPublicRoute(pathname: string): boolean {
  // Check exact matches
  if (publicRoutes.includes(pathname)) return true
  
  // Check patterns
  if (pathname.startsWith('/questions/')) return true
  if (publicApiRoutes.some(route => pathname.startsWith(route))) return true
  
  return false
}
```

### 2. AuthPromptModal Component

**File**: `components/shared/AuthPromptModal.tsx`

**Purpose**: Display a modal dialog prompting users to log in or sign up when they attempt to submit an answer without authentication.

**Props**:
```typescript
interface AuthPromptModalProps {
  isOpen: boolean
  onClose: () => void
  onLogin: () => void
  onSignup: () => void
  message?: string
}
```

**Features**:
- Clear heading: "Login Required"
- Explanation of benefits (progress tracking, streaks, leaderboard)
- Two prominent action buttons: "Log In" and "Sign Up"
- Close button (X) to dismiss
- Backdrop click to close
- Keyboard escape to close
- Uses app's design system (bg-peach, primary-green, primary-orange)
- Responsive design for mobile and desktop

**Visual Design**:
- Modal overlay with semi-transparent backdrop
- Centered card with rounded corners
- Icon (Lock or User) at the top
- Heading and description text
- Button group with primary and secondary actions
- Close button in top-right corner

### 3. IndividualQuestionPage Updates

**File**: `components/questions/IndividualQuestionPage.tsx`

**Changes**:
- Add authentication state check using `useAuth` hook
- Show AuthPromptModal when unauthenticated user clicks submit
- Store selected answer in component state when modal is shown
- Redirect to login page with return URL when user chooses to log in
- Preserve selected answer in URL params or session storage for post-login submission

**New State**:
```typescript
const [showAuthModal, setShowAuthModal] = useState(false)
const [pendingAnswer, setPendingAnswer] = useState<OptionKey | null>(null)
```

**Updated Submit Flow**:
```typescript
const handleSubmit = () => {
  if (!selectedAnswer) return
  
  // Check authentication
  if (!user) {
    setPendingAnswer(selectedAnswer)
    setShowAuthModal(true)
    return
  }
  
  // Existing submission logic
  submitAttemptMutation.mutate(...)
}

const handleLogin = () => {
  // Store pending answer in session storage
  if (pendingAnswer) {
    sessionStorage.setItem('pendingAnswer', JSON.stringify({
      questionId: question.id,
      answer: pendingAnswer,
      isDailyQuestion
    }))
  }
  
  // Redirect to login with return URL
  router.push(`/login?returnUrl=${encodeURIComponent(window.location.pathname)}`)
}
```

### 4. Login Page Updates

**File**: `app/login/page.tsx`

**Changes**:
- Check for `returnUrl` query parameter
- Check session storage for pending answer
- After successful login, redirect to return URL
- If pending answer exists, trigger auto-submission

**Post-Login Flow**:
```typescript
useEffect(() => {
  if (user) {
    const returnUrl = searchParams.get('returnUrl')
    const pendingAnswerData = sessionStorage.getItem('pendingAnswer')
    
    if (pendingAnswerData) {
      const { questionId, answer, isDailyQuestion } = JSON.parse(pendingAnswerData)
      sessionStorage.removeItem('pendingAnswer')
      
      // Redirect to question page with auto-submit flag
      router.push(`/questions/${questionId}?autoSubmit=true&answer=${answer}&type=${isDailyQuestion ? 'daily' : 'regular'}`)
    } else if (returnUrl) {
      router.push(returnUrl)
    } else {
      router.push('/dashboard')
    }
  }
}, [user])
```

### 5. useAuth Hook Enhancement

**File**: `hooks/useAuth.tsx`

**Current State**: Hook exists and provides user authentication state

**Verification**: Ensure hook properly exposes:
- `user`: Current user object or null
- `loading`: Boolean indicating auth state is loading
- `signOut`: Function to log out

**Usage in Components**:
```typescript
const { user, loading } = useAuth()

// Check if user is authenticated
const isAuthenticated = !!user && !loading
```

## Data Models

### Session Storage Schema

**Key**: `pendingAnswer`

**Value**:
```typescript
interface PendingAnswer {
  questionId: string
  answer: OptionKey
  isDailyQuestion: boolean
  timestamp: number // For expiration
}
```

**Expiration**: Clear after 30 minutes or successful submission

### URL Parameters

**Login Return URL**:
- `returnUrl`: Encoded URL to redirect after login
- Example: `/login?returnUrl=%2Fquestions%2F123`

**Auto-Submit Parameters**:
- `autoSubmit`: Boolean flag to trigger auto-submission
- `answer`: The answer to submit (A, B, C, or D)
- `type`: Question type (daily or regular)
- Example: `/questions/123?autoSubmit=true&answer=A&type=regular`

## Error Handling

### Middleware Errors

**Scenario**: Supabase client creation fails
**Handling**: Log error and allow request to proceed to avoid blocking access

**Scenario**: User session is invalid
**Handling**: Treat as unauthenticated and apply public route logic

### API Endpoint Errors

**Scenario**: Unauthenticated user attempts to submit answer
**Response**: 401 Unauthorized with clear error message
```json
{
  "error": "Authentication required to submit answers",
  "code": "AUTH_REQUIRED"
}
```

**Scenario**: Authenticated user submits to already-answered question
**Response**: 400 Bad Request (existing behavior)

### Component Errors

**Scenario**: Session storage is unavailable
**Handling**: Fall back to URL parameters only, show warning toast

**Scenario**: Auto-submit fails after login
**Handling**: Show error toast, allow manual resubmission

**Scenario**: User closes auth modal
**Handling**: Clear pending answer, return to question view with selection preserved

### Network Errors

**Scenario**: Login redirect fails
**Handling**: Show error toast, keep modal open

**Scenario**: Question data fails to load for unauthenticated user
**Handling**: Show error state with retry button

## Testing Strategy

### Unit Tests

**AuthPromptModal Component**:
- Renders with correct content
- Calls onLogin when login button clicked
- Calls onSignup when signup button clicked
- Calls onClose when close button clicked
- Closes on backdrop click
- Closes on escape key press

**Middleware Logic**:
- Correctly identifies public routes
- Correctly identifies protected routes
- Allows unauthenticated access to public routes
- Redirects unauthenticated access to protected routes
- Allows authenticated access to all routes

**IndividualQuestionPage**:
- Shows auth modal for unauthenticated users on submit
- Submits immediately for authenticated users
- Stores pending answer correctly
- Redirects to login with correct parameters

### Integration Tests

**Public Access Flow**:
1. Visit questions page without login
2. Verify questions are displayed
3. Click on a question
4. Verify question details are shown
5. Select an answer
6. Click submit
7. Verify auth modal appears

**Login and Submit Flow**:
1. Start as unauthenticated user
2. Navigate to question
3. Select answer and click submit
4. Click login in modal
5. Complete login
6. Verify redirect back to question
7. Verify answer is auto-submitted
8. Verify result is displayed

**Authenticated User Flow**:
1. Login first
2. Navigate to question
3. Select answer and click submit
4. Verify no modal appears
5. Verify answer submits immediately

**Protected Route Access**:
1. Visit dashboard without login
2. Verify redirect to login page
3. Login successfully
4. Verify redirect to dashboard

### Manual Testing Checklist

- [ ] Browse questions without login
- [ ] View individual question without login
- [ ] View scoreboard without login
- [ ] Attempt to submit answer without login → modal appears
- [ ] Close modal → return to question with selection preserved
- [ ] Click login in modal → redirect to login page
- [ ] Login successfully → redirect back and auto-submit
- [ ] Submit answer as authenticated user → no modal
- [ ] Access dashboard without login → redirect to login
- [ ] Access profile without login → redirect to login
- [ ] Access admin without login → redirect to login
- [ ] Mobile responsive design for auth modal
- [ ] Keyboard navigation in auth modal
- [ ] Session storage persistence across page refreshes
- [ ] Expired pending answer cleanup

### API Testing

**Public Endpoints** (should work without auth):
- GET `/api/questions` → Returns question list
- GET `/api/questions/[id]` → Returns question details
- GET `/api/scoreboard` → Returns leaderboard
- GET `/api/tags` → Returns tag list

**Protected Endpoints** (should require auth):
- POST `/api/questions/[id]/attempt` → 401 without auth
- GET `/api/user/stats` → 401 without auth
- POST `/api/admin/*` → 401 without auth

## Security Considerations

### Data Exposure

**Public Question Data**:
- Question text, options, difficulty, tags are public
- Correct answers and explanations are NOT exposed until after submission
- User-specific data (attempts, progress) only visible to authenticated users

**API Security**:
- Verify all protected endpoints check authentication
- Ensure correct answers are not leaked in public API responses
- Validate user ownership for user-specific data access

### Session Management

**Pending Answer Storage**:
- Use session storage (not local storage) for temporary data
- Clear pending answers after successful submission
- Implement expiration (30 minutes) for pending answers
- Validate pending answer data before submission

**Authentication State**:
- Use Supabase's built-in session management
- Verify user session on server-side for all protected operations
- Handle session expiration gracefully

### CSRF Protection

**Form Submissions**:
- Supabase handles CSRF tokens automatically
- Verify origin headers for API requests
- Use SameSite cookie attributes

## Performance Considerations

### Middleware Optimization

**Route Matching**:
- Use efficient string matching for public routes
- Cache route patterns to avoid repeated regex compilation
- Minimize middleware execution time

**Authentication Checks**:
- Only check authentication for protected routes
- Use Supabase's optimized session retrieval
- Avoid unnecessary database queries

### Component Performance

**AuthPromptModal**:
- Lazy load modal content
- Use React.memo to prevent unnecessary re-renders
- Optimize modal animations for 60fps

**Question Pages**:
- Maintain existing React Query caching
- Don't refetch question data on auth state changes
- Optimize re-renders when showing/hiding modal

### API Performance

**Public Endpoints**:
- Implement caching headers for public data
- Use database indexes for question queries
- Consider CDN caching for static question data

**Rate Limiting**:
- Implement rate limiting for public endpoints
- Prevent abuse of unauthenticated access
- Monitor API usage patterns

## Migration Strategy

### Phase 1: Middleware Updates
1. Update middleware to support public routes
2. Test authentication flow for protected routes
3. Verify no regression for authenticated users

### Phase 2: Component Development
1. Create AuthPromptModal component
2. Add to shared components exports
3. Test modal in isolation

### Phase 3: Question Flow Integration
1. Update IndividualQuestionPage with auth check
2. Implement pending answer storage
3. Test submit flow for both auth states

### Phase 4: Login Flow Updates
1. Add return URL handling to login page
2. Implement auto-submit after login
3. Test end-to-end flow

### Phase 5: API Verification
1. Audit all API endpoints for auth requirements
2. Update endpoints to handle unauthenticated requests
3. Test API responses for both auth states

### Phase 6: Testing and Refinement
1. Complete integration testing
2. Perform security audit
3. Optimize performance
4. User acceptance testing

## Accessibility

### AuthPromptModal

**Keyboard Navigation**:
- Tab order: Close button → Login button → Signup button
- Escape key closes modal
- Focus trap within modal when open
- Return focus to trigger element on close

**Screen Readers**:
- Modal has `role="dialog"` and `aria-modal="true"`
- Modal has `aria-labelledby` pointing to heading
- Modal has `aria-describedby` pointing to description
- Close button has `aria-label="Close dialog"`

**Visual**:
- Sufficient color contrast (WCAG AA)
- Focus indicators on all interactive elements
- Clear visual hierarchy

### Public Pages

**Navigation**:
- Maintain existing keyboard navigation
- Ensure all features work without mouse
- Provide skip links for main content

**Screen Readers**:
- Announce page changes on navigation
- Provide context for unauthenticated state
- Clear labels for all interactive elements

## Design System Integration

### Colors

**Modal**:
- Background: `bg-white`
- Overlay: `bg-black/50`
- Border: `border-bg-peach`

**Buttons**:
- Primary (Login): `bg-primary-green hover:bg-primary-green/90 text-white`
- Secondary (Signup): `bg-primary-orange hover:bg-primary-orange/90 text-white`
- Close: `text-text-muted hover:text-text-primary`

**Text**:
- Heading: `text-text-primary font-bold text-2xl`
- Description: `text-text-secondary text-base`
- Benefits: `text-text-primary text-sm`

### Typography

**Modal Content**:
- Heading: 24px bold
- Description: 16px regular
- Benefits list: 14px regular
- Button text: 16px medium

### Spacing

**Modal**:
- Padding: 32px (desktop), 24px (mobile)
- Gap between elements: 16px
- Button group gap: 12px

### Animations

**Modal Entry**:
- Fade in overlay: 200ms ease-out
- Scale up modal: 200ms ease-out with spring

**Modal Exit**:
- Fade out overlay: 150ms ease-in
- Scale down modal: 150ms ease-in

## Landing Page Design

### Purpose
The landing page serves as the entry point for unauthenticated users, providing an overview of the app and encouraging exploration or signup.

### Layout

**Hero Section**:
- App logo and name
- Tagline: "Practice, Learn, and Level Up Your Knowledge"
- Brief description of the app
- Two CTA buttons: "Browse Questions" (primary) and "Sign Up" (secondary)

**Features Section**:
- Three feature cards highlighting:
  1. "Thousands of Questions" - Browse questions across multiple topics and difficulties
  2. "Track Your Progress" - Level up, earn XP, and maintain streaks
  3. "Compete on Leaderboards" - See how you rank against other users

**Quick Stats Section**:
- Display public statistics:
  - Total questions available
  - Total users (if available)
  - Questions answered today (if available)

**Call to Action**:
- "Ready to get started?" heading
- "Browse Questions" button (primary)
- "Create Account" button (secondary)

### Behavior

**For Unauthenticated Users**:
- Display full landing page
- "Browse Questions" button → `/questions`
- "Sign Up" / "Create Account" button → `/login?mode=signup`
- Header shows "Log In" and "Sign Up" buttons

**For Authenticated Users**:
- Automatically redirect to `/dashboard`
- No landing page content shown

### Design System

**Colors**:
- Background: `bg-bg-peach`
- Cards: `bg-bg-white` with `border-bg-peach`
- Primary CTA: `bg-primary-green`
- Secondary CTA: `bg-primary-orange`

**Typography**:
- Hero heading: 48px bold (mobile: 32px)
- Tagline: 24px regular (mobile: 18px)
- Section headings: 32px bold (mobile: 24px)
- Body text: 16px regular

**Spacing**:
- Hero section: 120px padding top/bottom (mobile: 60px)
- Section spacing: 80px (mobile: 48px)
- Card padding: 32px (mobile: 24px)

**Responsive Design**:
- Desktop: 3-column feature grid
- Tablet: 2-column feature grid
- Mobile: Single column stack

### Implementation Notes

**File**: `app/page.tsx`

**Key Features**:
- Check authentication state on mount
- Redirect authenticated users to dashboard
- Fetch and display public statistics
- Responsive layout with mobile-first approach
- Smooth scroll to sections
- Optimized images and icons

## Future Enhancements

### Social Proof
- Show "X users have answered this question" for unauthenticated users
- Display popular questions or trending topics
- Show leaderboard preview to encourage signup

### Progressive Disclosure
- Allow 3-5 free answers before requiring signup
- Track anonymous attempts in session storage
- Convert anonymous attempts to user account on signup

### Enhanced Onboarding
- Add welcome tour for new users
- Highlight benefits of creating account
- Show personalized recommendations after signup

### Analytics
- Track conversion rate from modal to signup
- Monitor drop-off points in auth flow
- A/B test modal messaging and design

### Landing Page Enhancements
- Add testimonials or user reviews
- Include demo video or interactive tour
- Show featured questions or daily challenge preview
- Add FAQ section
- Implement A/B testing for CTA placement and messaging
