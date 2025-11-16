# Design Document

## Overview

This design implements a mandatory display name setup flow for email-authenticated users who lack a display name in their Supabase Auth metadata. The solution uses a non-dismissible modal dialog that appears on the dashboard page after login, requiring users to set a display name before they can interact with the application. The modal pre-fills a default value using the pattern "User-{uuid}" (first 8 characters of the user's UUID) and updates the Supabase Auth `full_name` field upon submission.

## Architecture

### Data Flow

```
User Login (Email Auth)
    ↓
Dashboard Page Loads
    ↓
Check Display Name (Client-side Hook)
    ↓
Display Name Missing? → YES
    ↓
Show Mandatory Modal
    ↓
User Submits Display Name
    ↓
Update Supabase Auth Metadata (full_name)
    ↓
Refresh User Session
    ↓
Close Modal & Enable Dashboard Access
```

### Component Hierarchy

```
Dashboard Page
  └─ DisplayNameSetupModal (conditionally rendered)
      ├─ Dialog (Radix UI - non-dismissible)
      ├─ Form (display name input)
      └─ Submit Button (with loading state)

useDisplayNameCheck Hook
  └─ Returns: { needsDisplayName, isLoading, user }
```

## Components and Interfaces

### 1. Display Name Check Hook

**File:** `hooks/useDisplayNameCheck.tsx`

**Purpose:** Reusable hook to check if the current user needs to set a display name

**Implementation:**

```typescript
import { useAuth } from '@/hooks/useAuth'

interface UseDisplayNameCheckReturn {
  needsDisplayName: boolean
  isLoading: boolean
  user: SupabaseUser | null
}

export function useDisplayNameCheck(): UseDisplayNameCheckReturn {
  const { user, isLoading } = useAuth()

  const needsDisplayName = user ? !hasDisplayName(user) : false

  return {
    needsDisplayName,
    isLoading,
    user
  }
}

function hasDisplayName(user: SupabaseUser): boolean {
  const metadata = user.user_metadata
  
  // Check all possible display name fields
  const fullName = metadata?.full_name
  const preferredUsername = metadata?.preferred_username
  const userName = metadata?.user_name
  
  // Return true if any field has a non-empty value
  return !!(
    (fullName && fullName.trim()) ||
    (preferredUsername && preferredUsername.trim()) ||
    (userName && userName.trim())
  )
}
```

**Key Features:**
- Leverages existing `useAuth` hook for user data
- Checks all relevant metadata fields (full_name, preferred_username, user_name)
- Handles null, undefined, and empty string values
- Returns loading state for proper UI handling

### 2. Display Name Setup Modal Component

**File:** `components/dashboard/DisplayNameSetupModal.tsx`

**Purpose:** Non-dismissible modal for setting display name

**Props:**

```typescript
interface DisplayNameSetupModalProps {
  isOpen: boolean
  userId: string
  defaultDisplayName: string
  onSuccess: () => void
}
```

**Implementation Structure:**

```typescript
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

export function DisplayNameSetupModal({
  isOpen,
  userId,
  defaultDisplayName,
  onSuccess
}: DisplayNameSetupModalProps) {
  const [displayName, setDisplayName] = useState(defaultDisplayName)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!displayName.trim()) {
      setError('Display name cannot be empty')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      // Update Supabase Auth user metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: { full_name: displayName.trim() }
      })

      if (updateError) throw updateError

      // Refresh session to get updated metadata
      await supabase.auth.refreshSession()

      // Call success callback
      onSuccess()
    } catch (err) {
      console.error('Failed to update display name:', err)
      setError(err instanceof Error ? err.message : 'Failed to update display name')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-md"
        onEscapeKeyDown={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        {/* Remove close button by not rendering DialogClose */}
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-text-primary">
            Set Your Display Name
          </DialogTitle>
          <DialogDescription className="text-text-secondary">
            Please choose a display name. This will be visible to other users on leaderboards and throughout the app.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter your display name"
              required
              maxLength={50}
              disabled={isSubmitting}
              autoFocus
            />
          </div>

          {error && (
            <div className="p-3 rounded-md text-sm bg-accent-red/10 text-accent-red">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-primary-green hover:bg-primary-green-dark"
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? 'Setting Display Name...' : 'Set Display Name'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
```

**Key Features:**
- Uses Radix UI Dialog with non-dismissible configuration
- Pre-fills input with default "User-{uuid}" value
- Prevents closing via Escape key, outside clicks, or close button
- Shows loading state during submission
- Displays error messages inline
- Updates Supabase Auth metadata and refreshes session
- Calls success callback to trigger modal close

### 3. Dashboard Page Integration

**File:** `app/dashboard/page.tsx`

**Enhanced Implementation:**

```typescript
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useDisplayNameCheck } from '@/hooks/useDisplayNameCheck'
import { DisplayNameSetupModal } from '@/components/dashboard/DisplayNameSetupModal'
// ... other imports

export default function DashboardPage() {
  const router = useRouter()
  const { needsDisplayName, isLoading: checkingDisplayName, user } = useDisplayNameCheck()
  const [showModal, setShowModal] = useState(false)
  
  // Show modal when display name is needed
  useEffect(() => {
    if (!checkingDisplayName && needsDisplayName) {
      setShowModal(true)
    }
  }, [checkingDisplayName, needsDisplayName])

  // Generate default display name from user ID
  const defaultDisplayName = user?.id 
    ? `User-${user.id.substring(0, 8)}` 
    : 'User'

  const handleDisplayNameSuccess = () => {
    setShowModal(false)
    // Optionally refresh page or invalidate queries
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-bg-peach">
      {/* Existing dashboard content */}
      
      {/* Display Name Setup Modal */}
      {user && (
        <DisplayNameSetupModal
          isOpen={showModal}
          userId={user.id}
          defaultDisplayName={defaultDisplayName}
          onSuccess={handleDisplayNameSuccess}
        />
      )}
    </div>
  )
}
```

**Key Features:**
- Integrates `useDisplayNameCheck` hook
- Conditionally renders modal based on `needsDisplayName` flag
- Generates default display name from user UUID (first 8 chars)
- Handles success callback to close modal and refresh page

### 4. Modified Dialog Component

**File:** `components/ui/dialog.tsx`

**Modification:** Create a variant that doesn't render the close button

**Approach:** The existing `DialogContent` component always renders a close button. For the mandatory modal, we'll prevent the default close behavior using event handlers:

- `onEscapeKeyDown={(e) => e.preventDefault()}`
- `onPointerDownOutside={(e) => e.preventDefault()}`
- `onInteractOutside={(e) => e.preventDefault()}`

We can also hide the close button with CSS or by creating a custom variant. The simplest approach is to use CSS to hide it:

```typescript
<DialogContent
  className="sm:max-w-md [&>button]:hidden"
  // ... event handlers
>
```

**Alternative:** Create a new component `MandatoryDialogContent` that extends `DialogContent` without the close button.

## Data Models

### Supabase Auth User Metadata

```typescript
// User metadata structure in auth.users table
interface UserMetadata {
  full_name?: string          // Target field for email users
  preferred_username?: string // GitHub preferred username
  user_name?: string          // GitHub username
  avatar_url?: string         // User avatar URL
  email?: string              // User email
  // ... other fields
}

// Update payload
{
  data: {
    full_name: string  // New display name
  }
}
```

### Component State

```typescript
// DisplayNameSetupModal state
interface ModalState {
  displayName: string      // Current input value
  isSubmitting: boolean    // Loading state
  error: string            // Error message
}

// useDisplayNameCheck return
interface DisplayNameCheckState {
  needsDisplayName: boolean  // Whether modal should show
  isLoading: boolean         // Auth loading state
  user: SupabaseUser | null  // Current user
}
```

## Error Handling

### 1. Supabase Auth Update Failures

**Scenario:** Network error, permission issue, or Supabase service error

**Handling:**
```typescript
try {
  const { error } = await supabase.auth.updateUser({ data: { full_name } })
  if (error) throw error
} catch (err) {
  console.error('Failed to update display name:', err)
  setError('Failed to update display name. Please try again.')
  // Keep modal open, allow retry
}
```

### 2. Empty Display Name Submission

**Scenario:** User tries to submit empty or whitespace-only name

**Handling:**
```typescript
if (!displayName.trim()) {
  setError('Display name cannot be empty')
  return
}
```

### 3. Session Refresh Failures

**Scenario:** Session refresh fails after metadata update

**Handling:**
```typescript
try {
  await supabase.auth.refreshSession()
} catch (err) {
  console.warn('Session refresh failed:', err)
  // Continue anyway - next page load will get updated data
}
```

### 4. Missing User Data

**Scenario:** User object is null when modal should render

**Handling:**
```typescript
{user && (
  <DisplayNameSetupModal
    isOpen={showModal}
    userId={user.id}
    defaultDisplayName={defaultDisplayName}
    onSuccess={handleDisplayNameSuccess}
  />
)}
```

## Testing Strategy

### Unit Testing

1. **useDisplayNameCheck Hook**
   - Test with user having full_name → returns needsDisplayName: false
   - Test with user having preferred_username → returns needsDisplayName: false
   - Test with user having user_name → returns needsDisplayName: false
   - Test with user having no display name fields → returns needsDisplayName: true
   - Test with null user → returns needsDisplayName: false
   - Test with empty string values → returns needsDisplayName: true

2. **DisplayNameSetupModal Component**
   - Test default value pre-fill
   - Test input change handling
   - Test empty submission validation
   - Test successful submission flow
   - Test error display
   - Test loading state
   - Test non-dismissible behavior (Escape key, outside click)

3. **hasDisplayName Function**
   - Test with various metadata combinations
   - Test with null/undefined/empty values
   - Test with whitespace-only values

### Integration Testing

1. **End-to-End Flow**
   - Email user signs up → redirects to dashboard → modal appears
   - User enters display name → submits → modal closes → dashboard accessible
   - User refreshes page → modal does not reappear
   - GitHub user signs in → modal does not appear

2. **Error Scenarios**
   - Network failure during update → error message shown → retry works
   - Empty submission → validation error shown → can correct and submit

### Manual Testing Checklist

- [ ] Email login user without display name sees modal on dashboard
- [ ] Modal shows default "User-{uuid}" value
- [ ] User can edit the default value
- [ ] Cannot close modal with Escape key
- [ ] Cannot close modal by clicking outside
- [ ] No close button visible on modal
- [ ] Empty submission shows validation error
- [ ] Successful submission closes modal and updates display name
- [ ] Display name appears in header after update
- [ ] Display name appears in leaderboards after update
- [ ] GitHub OAuth user does not see modal
- [ ] Email user with existing display name does not see modal
- [ ] Modal reappears on next login if update failed
- [ ] Error messages are user-friendly

## Implementation Notes

### Default Display Name Pattern

The default display name uses the pattern `User-{uuid}` where `{uuid}` is the first 8 characters of the user's UUID:

```typescript
const defaultDisplayName = user?.id 
  ? `User-${user.id.substring(0, 8)}` 
  : 'User'

// Example: User-a1b2c3d4
```

This ensures:
- Uniqueness (UUIDs are unique)
- Brevity (8 chars is readable)
- Recognizability (clear it's a default value)
- User can easily modify it

### Non-Dismissible Modal Implementation

The modal is made non-dismissible by:

1. **Preventing Escape key:** `onEscapeKeyDown={(e) => e.preventDefault()}`
2. **Preventing outside clicks:** `onPointerDownOutside={(e) => e.preventDefault()}`
3. **Preventing interactions:** `onInteractOutside={(e) => e.preventDefault()}`
4. **Hiding close button:** CSS class `[&>button]:hidden` or not rendering `DialogClose`
5. **Controlled open state:** `onOpenChange={() => {}}` (no-op function)

### Supabase Auth Metadata Update

We update the `full_name` field in user metadata:

```typescript
await supabase.auth.updateUser({
  data: { full_name: displayName.trim() }
})
```

This field is chosen because:
- It's the primary display name field for email users
- It's checked first in the existing `getDisplayName` function
- It's consistent with the display name integration spec
- It's a standard Supabase Auth field

### Session Refresh

After updating metadata, we refresh the session to ensure the updated data is immediately available:

```typescript
await supabase.auth.refreshSession()
```

This ensures:
- Header component shows updated name immediately
- No need to reload the page
- React Query cache is updated via auth state change listener

### Performance Considerations

- Display name check happens client-side using existing auth data (no extra API calls)
- Modal only renders when needed (conditional rendering)
- Single Supabase Auth update call
- Session refresh is async and doesn't block UI

### Security Considerations

- Display name length limited to 50 characters (prevents abuse)
- Input is trimmed before submission (prevents whitespace-only names)
- Supabase Auth handles sanitization and storage
- No XSS risk (React escapes content automatically)
- User can only update their own display name (Supabase Auth enforces this)

### Accessibility Considerations

- Modal has proper ARIA labels (DialogTitle, DialogDescription)
- Input field has associated Label
- Focus automatically moves to input field (autoFocus)
- Error messages are announced to screen readers
- Keyboard navigation works correctly
- Loading state is indicated visually and semantically

### Backward Compatibility

- Existing users with display names are unaffected
- GitHub OAuth users are unaffected
- Existing display name logic continues to work
- No database schema changes required
- No breaking changes to existing components
