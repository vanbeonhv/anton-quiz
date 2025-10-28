# Design Document

## Overview

The bulk question import feature enables administrators to efficiently add multiple questions to the system through a JSON-based import workflow. The feature consists of three main components: a trigger button in the admin UI, a JSON input modal for pasting question data, and a review/edit modal for validating and modifying parsed questions before submission. This design follows the existing admin UI patterns and leverages the current component architecture.

## Architecture

### Component Structure

```
QuestionManagement (existing)
├── BulkQuestionImport (new)
    ├── JsonInputModal (new)
    └── QuestionReviewModal (new)
```

### Data Flow

1. User clicks "Bulk Import" button → Opens JsonInputModal
2. User pastes JSON array → Validates and parses on client side
3. Parse success → Closes JsonInputModal, opens QuestionReviewModal with parsed data
4. User reviews/edits questions → Updates local state
5. User submits → Calls bulk insert API endpoint
6. API success → Closes modal, refreshes question list, shows success toast

### State Management

- Local component state for modal visibility
- Local state for JSON input text
- Local state for parsed questions array
- React Query mutation for bulk insert API call
- Toast notifications for user feedback

## Components and Interfaces

### BulkQuestionImport Component

**Location:** `components/admin/BulkQuestionImport.tsx`

**Props:**
```typescript
interface BulkQuestionImportProps {
  tags: Tag[]
  onComplete?: () => void
}
```

**State:**
```typescript
const [isJsonInputOpen, setIsJsonInputOpen] = useState(false)
const [isReviewOpen, setIsReviewOpen] = useState(false)
const [jsonInput, setJsonInput] = useState('')
const [parsedQuestions, setParsedQuestions] = useState<ParsedQuestion[]>([])
const [parseError, setParseError] = useState<string | null>(null)
```

**Key Methods:**
- `handleParseJson()` - Validates and parses JSON input
- `handleQuestionEdit(index, field, value)` - Updates specific question field
- `handleBulkSubmit()` - Submits all questions to API

### JsonInputModal

**Rendered within BulkQuestionImport**

**UI Elements:**
- Large textarea for JSON input (minimum 10 rows)
- Helper text explaining expected JSON format
- Template JSON structure displayed prominently with copy button
- Parse button (primary action)
- Cancel button
- Error message display area

**Template Display:**
The modal will show a copyable JSON template that users can use as a starting point:
```json
[
  {
    "text": "Your question text here?",
    "optionA": "First option",
    "optionB": "Second option",
    "optionC": "Third option",
    "optionD": "Fourth option",
    "correctAnswer": "A",
    "explanation": "Optional explanation",
    "difficulty": "MEDIUM"
  }
]
```

**Validation:**
- Check if input is valid JSON
- Check if parsed result is an array
- Check if array is not empty
- Validate each question has required fields

### QuestionReviewModal

**Rendered within BulkQuestionImport**

**UI Elements:**
- Question counter (e.g., "Question 1 of 5")
- Navigation buttons (Previous/Next) if multiple questions
- Editable form fields for current question:
  - Question text (textarea)
  - Option A, B, C, D (text inputs)
  - Correct answer (radio group)
  - Difficulty (select dropdown)
  - Explanation (textarea, optional)
  - Tags (checkbox list)
- Question list sidebar showing all questions with validation status
- Submit all button (primary action)
- Cancel button

**Features:**
- Real-time validation of required fields
- Visual indicators for incomplete questions
- Ability to navigate between questions
- Preserve edits when navigating

## Data Models

### ParsedQuestion Interface

```typescript
interface ParsedQuestion {
  text: string
  optionA: string
  optionB: string
  optionC: string
  optionD: string
  correctAnswer: OptionKey // 'A' | 'B' | 'C' | 'D'
  explanation?: string
  difficulty: Difficulty // 'EASY' | 'MEDIUM' | 'HARD'
  tagIds: string[] // Selected in review modal, not from JSON
  // Validation state
  isValid?: boolean
  validationErrors?: string[]
}
```

### Expected JSON Format

Tags are not included in the JSON format. Users will select tags in the review modal after parsing.

```json
[
  {
    "text": "What is the capital of France?",
    "optionA": "London",
    "optionB": "Paris",
    "optionC": "Berlin",
    "optionD": "Madrid",
    "correctAnswer": "B",
    "explanation": "Paris is the capital and largest city of France.",
    "difficulty": "EASY"
  }
]
```

**Note:** The `explanation` field is optional. All other fields are required.

### Bulk Insert API Request

```typescript
interface BulkInsertRequest {
  questions: Array<{
    text: string
    optionA: string
    optionB: string
    optionC: string
    optionD: string
    correctAnswer: OptionKey
    explanation?: string
    difficulty: Difficulty
    tagIds?: string[]
  }>
}
```

### Bulk Insert API Response

```typescript
interface BulkInsertResponse {
  success: boolean
  created: number
  questions: QuestionWithTags[]
  errors?: Array<{
    index: number
    error: string
  }>
}
```

## Error Handling

### JSON Parsing Errors

- **Invalid JSON syntax:** Display error message with position if available
- **Not an array:** "Expected a JSON array of questions"
- **Empty array:** "Please provide at least one question"
- **Invalid question structure:** List missing required fields

### Validation Errors

Each question is validated for:
- `text`: Required, non-empty string
- `optionA`, `optionB`, `optionC`, `optionD`: Required, non-empty strings
- `correctAnswer`: Required, must be 'A', 'B', 'C', or 'D'
- `difficulty`: Required, must be 'EASY', 'MEDIUM', or 'HARD'
- `explanation`: Optional string
- `tagIds`: Selected in review modal, not validated during JSON parsing

### API Errors

- **Network error:** "Failed to connect to server. Please try again."
- **Validation error:** Display specific field errors from API
- **Partial success:** Show count of successful vs failed insertions
- **Complete failure:** "Failed to import questions. Please check your data and try again."

### Error Display Strategy

- Parse errors: Show in JsonInputModal below textarea
- Validation errors: Show in QuestionReviewModal next to affected fields
- API errors: Show as toast notification
- Partial failures: Show detailed modal with success/failure breakdown

## Testing Strategy

### Unit Tests

- JSON parser function with various input formats
- Validation logic for individual questions
- Tag name to ID resolution
- Error message generation

### Integration Tests

- Complete workflow from JSON input to API submission
- Modal state transitions
- Form field updates and persistence
- API error handling

### Manual Testing Scenarios

1. **Happy path:** Import 3 valid questions with all fields
2. **Invalid JSON:** Paste malformed JSON and verify error message
3. **Missing fields:** Import questions with missing required fields
4. **Copy template:** Click copy button and verify template is copied
5. **Tag selection:** Parse questions, select tags in review modal
6. **Edit before submit:** Parse questions, edit fields, verify changes persist
7. **Navigation:** Parse multiple questions, navigate between them
8. **Cancel operations:** Test cancel at each modal stage
9. **API failure:** Simulate API error and verify error handling
10. **Large batch:** Import 50+ questions to test performance

## UI/UX Considerations

### Button Placement

The "Bulk Import" button will be placed next to the existing "Create Question" button in the QuestionManagement component header, maintaining visual hierarchy.

### Modal Sizing

- JsonInputModal: Medium width (max-w-2xl), auto height
- QuestionReviewModal: Large width (max-w-4xl), 90vh max height with scroll

### Loading States

- Parse button shows "Parsing..." during validation
- Submit button shows "Importing..." during API call
- Disable all form interactions during submission

### Success Feedback

- Toast notification: "Successfully imported X questions"
- Auto-close modal on success
- Refresh question list to show new questions
- Scroll to top of question list

### Accessibility

- Proper ARIA labels for all form fields
- Keyboard navigation support in modals
- Focus management when opening/closing modals
- Error messages associated with form fields
- Screen reader announcements for validation errors

## Integration Points

### Existing Components

- **QuestionManagement:** Add BulkQuestionImport button next to Create Question
- **Dialog components:** Reuse existing shadcn/ui Dialog components
- **Form components:** Reuse Input, Textarea, Select, Checkbox, RadioGroup
- **Toast notifications:** Use existing sonner toast system

### API Endpoints

**New endpoint:** `POST /api/admin/questions/bulk`

**Request body:**
```typescript
{
  questions: ParsedQuestion[]
}
```

**Response:**
```typescript
{
  success: boolean
  created: number
  questions: QuestionWithTags[]
  errors?: Array<{ index: number, error: string }>
}
```

**Error responses:**
- 400: Validation error with details
- 401: Unauthorized
- 403: Admin access required
- 500: Server error

### React Query Integration

```typescript
const useBulkInsertQuestions = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (questions: ParsedQuestion[]) => {
      const response = await fetch('/api/admin/questions/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questions })
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to import questions')
      }
      
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-questions'] })
    }
  })
}
```

## Performance Considerations

### Client-Side

- Parse JSON synchronously (acceptable for reasonable batch sizes < 1000)
- Debounce form field updates in review modal
- Virtualize question list if > 50 questions
- Lazy load question review (only render current question)

### Server-Side

- Use Prisma transaction for bulk insert
- Batch tag associations
- Limit maximum questions per request (e.g., 100)
- Return early on validation errors before database operations

### Optimization Strategies

- Validate all questions before starting database transaction
- Use `createMany` for bulk insert when possible
- Create tag associations in batches
- Consider background job for very large imports (future enhancement)

## Security Considerations

- Admin authentication required (existing middleware)
- Input sanitization for all text fields
- SQL injection prevention via Prisma ORM
- Rate limiting on bulk import endpoint
- Maximum payload size limit
- Validate tag IDs exist before insertion

## Future Enhancements

1. **Import from file:** Support uploading JSON/CSV files
2. **Template download:** Provide downloadable JSON template
3. **Duplicate detection:** Warn about similar existing questions
4. **Batch validation:** Pre-validate without importing
5. **Import history:** Track bulk import operations
6. **Undo functionality:** Ability to rollback bulk imports
7. **Progress indicator:** Show progress for large batches
8. **Dry run mode:** Preview what would be imported
9. **Import from URL:** Fetch questions from external source
10. **Export functionality:** Export questions to JSON format
