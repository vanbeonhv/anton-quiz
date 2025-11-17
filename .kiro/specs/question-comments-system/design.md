# Design Document

## Overview

The Question Comments System enables users to engage in discussions about individual questions after answering them. The system provides a threaded comment interface that displays below the question content, allowing authenticated users to create, edit, and delete their own comments while enabling all users (authenticated and unauthenticated) to view the discussion.

The design integrates seamlessly with the existing question practice flow, leveraging the current authentication system (Supabase Auth), database infrastructure (Prisma + PostgreSQL), and UI component library (shadcn/ui with Tailwind CSS).

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                    Question Page (Client)                    │
│  ┌────────────────────────────────────────────────────────┐ │
│  │         IndividualQuestionPage Component               │ │
│  │  ┌──────────────────────────────────────────────────┐  │ │
│  │  │         Question Content & Answer UI             │  │ │
│  │  └──────────────────────────────────────────────────┘  │ │
│  │  ┌──────────────────────────────────────────────────┐  │ │
│  │  │         QuestionComments Component               │  │ │
│  │  │  ┌────────────────────────────────────────────┐  │  │ │
│  │  │  │  CommentList (displays all comments)       │  │  │ │
│  │  │  │  - CommentItem (individual comment)        │  │  │ │
│  │  │  │  - CommentForm (create/edit)               │  │  │ │
│  │  │  └────────────────────────────────────────────┘  │  │ │
│  │  └──────────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Layer (Server)                        │
│  /api/questions/[id]/comments                                │
│  - GET: Fetch comments for a question                        │
│  - POST: Create new comment (auth required)                  │
│                                                               │
│  /api/comments/[id]                                          │
│  - PATCH: Update comment (auth + ownership required)         │
│  - DELETE: Delete comment (auth + ownership required)        │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  Database Layer (Prisma)                     │
│  QuestionComment Model                                       │
│  - id, questionId, userId, content, createdAt, updatedAt     │
│  - Relations: Question, User (via Supabase Auth)             │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

**Viewing Comments (Unauthenticated & Authenticated)**
1. User navigates to question page
2. Client fetches comments via GET `/api/questions/[id]/comments`
3. Server queries database with user metadata (avatar, display name) from Supabase Auth
4. Comments rendered with author info, timestamps, and edit indicators

**Creating Comment (Authenticated Only)**
1. User types comment in input field (1-500 char validation)
2. Client submits POST to `/api/questions/[id]/comments`
3. Server validates authentication, content length, and question existence
4. Database creates comment record with userId, questionId, content, timestamp
5. Client optimistically updates UI and refetches to confirm

**Editing Comment (Author Only)**
1. User clicks edit button on their comment
2. Comment switches to edit mode with pre-filled content
3. User modifies and submits PATCH to `/api/comments/[id]`
4. Server validates ownership, authentication, and content length
5. Database updates content and updatedAt timestamp
6. Client displays updated comment with "edited" indicator

**Deleting Comment (Author Only)**
1. User clicks delete button on their comment
2. Confirmation dialog appears
3. User confirms, client sends DELETE to `/api/comments/[id]`
4. Server validates ownership and authentication
5. Database soft-deletes or hard-deletes comment
6. Client removes comment from UI

## Components and Interfaces

### Database Schema

```prisma
model QuestionComment {
  id         String   @id @default(cuid())
  questionId String
  userId     String
  userEmail  String
  content    String   @db.Text
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  
  question   Question @relation(fields: [questionId], references: [id], onDelete: Cascade)
  
  @@index([questionId])
  @@index([userId])
  @@index([createdAt])
}

// Update Question model to include comments relation
model Question {
  // ... existing fields
  comments QuestionComment[]
}
```

### TypeScript Types

```typescript
// types/index.ts additions

export interface QuestionComment {
  id: string
  questionId: string
  userId: string
  userEmail: string
  content: string
  createdAt: Date
  updatedAt: Date
}

export interface QuestionCommentWithAuthor extends QuestionComment {
  author: {
    displayName: string | null
    avatarUrl: string | null
  }
  isEdited: boolean // computed: updatedAt > createdAt + 1 minute
}

export interface CreateCommentData {
  content: string
}

export interface UpdateCommentData {
  content: string
}

export interface CommentValidationResult {
  isValid: boolean
  error?: string
}
```

### React Components

#### QuestionComments (Container)
```typescript
interface QuestionCommentsProps {
  questionId: string
  isAuthenticated: boolean
  currentUserId?: string
}

// Responsibilities:
// - Fetch and display all comments for a question
// - Manage comment creation form visibility
// - Handle optimistic updates
// - Coordinate between CommentList and CommentForm
```

#### CommentList
```typescript
interface CommentListProps {
  comments: QuestionCommentWithAuthor[]
  currentUserId?: string
  onEdit: (commentId: string) => void
  onDelete: (commentId: string) => void
}

// Responsibilities:
// - Render list of CommentItem components
// - Display empty state when no comments exist
// - Handle loading and error states
```

#### CommentItem
```typescript
interface CommentItemProps {
  comment: QuestionCommentWithAuthor
  isAuthor: boolean
  onEdit: () => void
  onDelete: () => void
}

// Responsibilities:
// - Display comment content with markdown support
// - Show author avatar, display name, and timestamp
// - Display "edited" indicator when applicable
// - Show edit/delete buttons for comment author
// - Handle edit mode toggle
```

#### CommentForm
```typescript
interface CommentFormProps {
  questionId: string
  mode: 'create' | 'edit'
  initialContent?: string
  commentId?: string
  onSuccess: () => void
  onCancel?: () => void
}

// Responsibilities:
// - Textarea input with character counter
// - Real-time validation (1-500 chars)
// - Submit button with loading state
// - Error message display
// - Cancel button for edit mode
```

### API Endpoints

#### GET `/api/questions/[id]/comments`
```typescript
// Query Parameters: none
// Authentication: Optional (public endpoint)
// Response: QuestionCommentWithAuthor[]

// Logic:
// 1. Validate question ID exists
// 2. Query comments with userId
// 3. Fetch user metadata from Supabase Auth (displayName, avatarUrl)
// 4. Calculate isEdited flag
// 5. Sort by createdAt ascending (oldest first)
// 6. Return comments array
```

#### POST `/api/questions/[id]/comments`
```typescript
// Body: { content: string }
// Authentication: Required
// Response: QuestionCommentWithAuthor

// Logic:
// 1. Validate authentication
// 2. Validate content length (1-500 chars)
// 3. Validate question exists
// 4. Create comment in database
// 5. Fetch user metadata
// 6. Return created comment with author info
```

#### PATCH `/api/comments/[id]`
```typescript
// Body: { content: string }
// Authentication: Required
// Response: QuestionCommentWithAuthor

// Logic:
// 1. Validate authentication
// 2. Validate comment exists
// 3. Validate user is comment author
// 4. Validate content length (1-500 chars)
// 5. Update comment content and updatedAt
// 6. Return updated comment with author info
```

#### DELETE `/api/comments/[id]`
```typescript
// Body: none
// Authentication: Required
// Response: { success: boolean }

// Logic:
// 1. Validate authentication
// 2. Validate comment exists
// 3. Validate user is comment author
// 4. Delete comment from database
// 5. Return success response
```

## Data Models

### Comment Storage

Comments are stored in the `QuestionComment` table with the following characteristics:

- **Primary Key**: `id` (cuid)
- **Foreign Keys**: 
  - `questionId` → `Question.id` (CASCADE delete)
  - `userId` → Supabase Auth user (no FK constraint, validated at app level)
- **Indexes**:
  - `questionId` for efficient comment fetching per question
  - `userId` for user comment history queries
  - `createdAt` for chronological sorting
- **Text Storage**: `content` uses `@db.Text` for unlimited length (enforced at app level to 500 chars)

### User Metadata Integration

User display information is fetched from Supabase Auth metadata:
- `user_metadata.preferred_username` → displayName (primary)
- `user_metadata.full_name` → displayName (fallback)
- `user_metadata.avatar_url` → avatarUrl
- `email` → userEmail (stored in comment for reference)

This follows the existing pattern used in `UserWithAvatar` component.

### Comment Timestamps

- `createdAt`: Set on comment creation, never modified
- `updatedAt`: Automatically updated by Prisma on any modification
- `isEdited`: Computed field = `updatedAt > createdAt + 60 seconds` (1-minute grace period)

## Error Handling

### Client-Side Validation

```typescript
function validateCommentContent(content: string): CommentValidationResult {
  const trimmed = content.trim()
  const length = trimmed.length
  
  if (length === 0) {
    return { isValid: false, error: 'Comment cannot be empty' }
  }
  
  if (length > 500) {
    return { 
      isValid: false, 
      error: `Comment must not exceed 500 characters (currently ${length})` 
    }
  }
  
  return { isValid: true }
}
```

### Server-Side Error Responses

```typescript
// 400 Bad Request - Validation errors
{
  error: 'Comment must be between 1 and 500 characters',
  details: { length: 550, min: 1, max: 500 }
}

// 401 Unauthorized - Authentication required
{
  error: 'Authentication required to post comments'
}

// 403 Forbidden - Authorization failure
{
  error: 'You can only edit or delete your own comments'
}

// 404 Not Found - Resource not found
{
  error: 'Comment not found'
}

// 500 Internal Server Error - Server errors
{
  error: 'Failed to create comment',
  message: 'Database connection error'
}
```

### Error Display

- **Toast Notifications**: Use existing `sonner` toast for transient errors
- **Inline Errors**: Display validation errors below comment form
- **Retry Logic**: Implement automatic retry for network failures (max 2 attempts)
- **Fallback UI**: Show error state in comment list if fetch fails

## Testing Strategy

### Unit Tests

**Comment Validation**
- Test character count validation (0 chars, 1-500 chars, > 500 chars)
- Test empty content handling
- Test whitespace trimming

**Timestamp Utilities**
- Test relative time formatting ("2 hours ago", "3 days ago")
- Test "edited" indicator logic (updatedAt vs createdAt)

**Privacy Filtering**
- Test email filtering for non-current users
- Test email preservation for current user

### Integration Tests

**Comment CRUD Operations**
- Create comment with valid content
- Create comment with invalid content (expect 400)
- Edit own comment successfully
- Attempt to edit another user's comment (expect 403)
- Delete own comment successfully
- Attempt to delete another user's comment (expect 403)

**Authentication Flow**
- Unauthenticated user views comments (success)
- Unauthenticated user attempts to create comment (expect 401)
- Authenticated user creates comment (success)

**Database Cascade**
- Delete question with comments (verify comments deleted)

### Component Tests

**CommentForm**
- Character counter updates in real-time
- Submit button disabled when content is empty or exceeds 500 characters
- Error messages display correctly
- Form clears after successful submission

**CommentItem**
- Edit/delete buttons only visible to author
- "Edited" indicator shows when applicable
- Avatar and display name render correctly
- Relative timestamps update

**CommentList**
- Empty state displays when no comments
- Comments sorted chronologically
- Loading state displays during fetch
- Error state displays on fetch failure

### End-to-End Tests

**Complete Comment Flow**
1. Navigate to question page (unauthenticated)
2. Verify comments visible but form hidden
3. Log in
4. Verify comment form appears
5. Type comment (> 500 chars) → verify error and disabled submit
6. Type valid comment (1-500 chars) → submit
7. Verify comment appears in list
8. Edit comment → verify "edited" indicator
9. Delete comment → verify removal from list

## UI/UX Considerations

### Character Counter Design

```
┌─────────────────────────────────────────────────────────┐
│  Write your comment...                                  │
│                                                          │
│  [Textarea with comment content]                        │
│                                                          │
└─────────────────────────────────────────────────────────┘
  Characters: 250 / 500 ✓
  [Submit Comment]
```

States:
- **0 chars**: Gray counter, submit disabled
- **1-500 chars**: Green counter, checkmark icon, submit enabled
- **> 500 chars**: Red counter, error icon, submit disabled

### Comment Display Layout

```
┌─────────────────────────────────────────────────────────┐
│  [Avatar] John Doe · 2 hours ago · edited               │
│                                                          │
│  This is the comment content with proper formatting     │
│  and support for line breaks.                           │
│                                                          │
│  [Edit] [Delete]  (only visible to author)              │
└─────────────────────────────────────────────────────────┘
```

### Responsive Design

- **Desktop**: Comments display in single column, max-width 800px
- **Tablet**: Same layout, adjusted padding
- **Mobile**: Stacked layout, smaller avatars, condensed metadata

### Accessibility

- **Keyboard Navigation**: Tab through comments, edit/delete buttons
- **Screen Readers**: Proper ARIA labels for actions and timestamps
- **Focus Management**: Focus textarea when entering edit mode
- **Color Contrast**: WCAG AA compliance for all text and indicators

### Animation & Feedback

- **Comment Creation**: Fade-in animation for new comments
- **Comment Deletion**: Fade-out animation before removal
- **Edit Mode**: Smooth transition between display and edit states
- **Loading States**: Skeleton loaders for comment list
- **Optimistic Updates**: Immediate UI update with rollback on error

## Integration Points

### Existing Components

- **IndividualQuestionPage**: Add `<QuestionComments>` below result display
- **UserWithAvatar**: Reuse for comment author display
- **MarkdownText**: Use for comment content rendering (if markdown support desired)
- **LoadingOverlay**: Use for comment submission loading state
- **AuthPromptModal**: Trigger when unauthenticated user attempts to comment

### Existing Utilities

- **useAuth**: Access current user info
- **createClient (Supabase)**: Fetch user metadata
- **prisma**: Database operations
- **toast (sonner)**: Error and success notifications
- **dayjs**: Relative time formatting

### Existing Patterns

- **React Query**: Use for comment fetching, mutations, and cache management
- **Optimistic Updates**: Follow pattern from question attempts
- **Error Handling**: Consistent with existing API error responses
- **Privacy Filtering**: Apply email privacy rules from `lib/utils/privacy.ts`

## Performance Considerations

### Query Optimization

- **Pagination**: Implement cursor-based pagination for questions with many comments (future enhancement)
- **Indexing**: Database indexes on `questionId`, `userId`, `createdAt`
- **Batch Fetching**: Fetch user metadata in single Supabase query when possible

### Caching Strategy

- **React Query Cache**: Cache comments per question with 5-minute stale time
- **Optimistic Updates**: Immediate UI update on create/edit/delete
- **Cache Invalidation**: Invalidate on successful mutation

### Bundle Size

- **Code Splitting**: Comment components lazy-loaded (not critical for initial page load)
- **Shared Components**: Reuse existing UI components (no new dependencies)

## Security Considerations

### Authentication & Authorization

- **Read Access**: Public (no authentication required)
- **Write Access**: Authenticated users only
- **Edit/Delete Access**: Comment author only (verified server-side)

### Input Validation

- **Content Length**: Enforced both client and server-side (1-500 chars)
- **XSS Prevention**: Sanitize content before rendering (use existing markdown renderer)
- **SQL Injection**: Prevented by Prisma parameterized queries

### Rate Limiting

- **Comment Creation**: Max 10 comments per user per question (future enhancement)
- **Edit Frequency**: Max 5 edits per comment (future enhancement)
- **API Rate Limiting**: Leverage existing middleware if available

### Data Privacy

- **Email Filtering**: Apply privacy rules to hide other users' emails
- **User Metadata**: Only expose displayName and avatarUrl (no sensitive data)
- **Soft Delete**: Consider soft-delete for moderation purposes (future enhancement)

## Future Enhancements

### Phase 2 Features (Not in Initial Implementation)

- **Comment Reactions**: Like/upvote system
- **Comment Replies**: Nested comment threads
- **Mention System**: @username mentions with notifications
- **Rich Text Editor**: Markdown toolbar for formatting
- **Comment Moderation**: Admin tools for flagging/removing comments
- **Comment Sorting**: Sort by newest, oldest, most liked
- **Comment Search**: Search within question comments
- **Comment Notifications**: Notify users of replies to their comments

### Performance Optimizations

- **Virtual Scrolling**: For questions with 100+ comments
- **Lazy Loading**: Load comments on scroll or button click
- **WebSocket Updates**: Real-time comment updates for active discussions

### Analytics

- **Comment Metrics**: Track comment count per question
- **Engagement Metrics**: Measure user participation in discussions
- **Quality Metrics**: Analyze comment length and edit frequency
