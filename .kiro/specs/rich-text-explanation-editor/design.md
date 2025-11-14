# Design Document

## Overview

This design enhances the question explanation input field in the admin panel to support rich text formatting through markdown syntax. The solution leverages the existing `MarkdownText` component for rendering and introduces a new `MarkdownEditor` component that provides a dual-mode interface (edit/preview) for creating formatted explanations.

The design follows a minimal approach by extending the existing markdown rendering capabilities and creating a simple, intuitive editing experience without introducing heavy third-party rich text editor libraries.

## Architecture

### Component Hierarchy

```
QuestionForm
└── MarkdownEditor (new)
    ├── Tabs (existing UI component)
    │   ├── TabsList
    │   │   ├── TabsTrigger (Edit)
    │   │   └── TabsTrigger (Preview)
    │   ├── TabsContent (Edit mode)
    │   │   └── Textarea (enhanced)
    │   └── TabsContent (Preview mode)
    │       └── MarkdownText (existing)
```

### Data Flow

1. Admin enters markdown text in the textarea (edit mode)
2. Text is stored in the form state as plain markdown string
3. When switching to preview mode, the markdown string is passed to `MarkdownText` component
4. On form submission, the markdown string is saved to the database unchanged
5. When displaying to users, the stored markdown is rendered using `MarkdownText` component

## Components and Interfaces

### New Component: MarkdownEditor

**Location:** `components/shared/MarkdownEditor.tsx`

**Purpose:** Provides a dual-mode (edit/preview) interface for entering and previewing markdown-formatted text

**Props Interface:**
```typescript
interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  minHeight?: string
  label?: string
  id?: string
}
```

**Features:**
- Tab-based interface with "Edit" and "Preview" modes
- Enhanced textarea with increased minimum height (150px)
- Real-time preview using existing `MarkdownText` component
- Keyboard shortcut support (Ctrl/Cmd + Enter to switch tabs)
- Maintains cursor position when switching between modes
- Responsive design matching existing form styling

### Enhanced Markdown Rendering

**Location:** `lib/utils/markdown.tsx`

**Current Capabilities:**
- Bold text: `**text**`
- Inline code: `` `code` ``

**Required Enhancements:**
- Line breaks: Convert `\n` to `<br />` or paragraph breaks
- Paragraphs: Double line breaks create new paragraphs
- Bullet lists: Lines starting with `- ` or `* `
- Numbered lists: Lines starting with `1. `, `2. `, etc.
- Italic text: `*text*` or `_text_`

**Updated Function Signature:**
```typescript
export function renderMarkdown(text: string): React.ReactNode
```

**Rendering Strategy:**
1. Split text into blocks (paragraphs, lists)
2. Process each block for inline formatting (bold, italic, code)
3. Return structured React elements with proper spacing

## Data Models

### Database Schema

No changes required. The `explanation` field in the `Question` model already supports text storage:

```prisma
model Question {
  // ... other fields
  explanation      String?
  // ... other fields
}
```

The field will continue to store plain markdown text as a string.

### Form Data Type

**Location:** `lib/utils/question.ts`

The existing `QuestionFormData` interface already includes the explanation field:

```typescript
export interface QuestionFormData {
  // ... other fields
  explanation: string
  // ... other fields
}
```

No changes needed to the type definition.

## Error Handling

### Input Validation

- No strict validation required for markdown syntax
- Invalid markdown will simply render as plain text
- Empty explanations remain optional (nullable field)

### Edge Cases

1. **Very long explanations**: Textarea will scroll vertically
2. **Special characters**: All characters are preserved as-is in the database
3. **Malformed markdown**: Renders as plain text without breaking the UI
4. **Copy-paste formatted text**: Formatting is stripped, only plain text is preserved

### Error States

- No specific error states needed
- Standard form validation applies (field is optional)

## Testing Strategy

### Unit Tests

**Component Tests:**
1. MarkdownEditor component
   - Renders with initial value
   - Calls onChange when text is modified
   - Switches between edit and preview modes
   - Displays preview correctly using MarkdownText

2. Enhanced markdown rendering
   - Converts line breaks correctly
   - Renders paragraphs with proper spacing
   - Formats bullet lists
   - Formats numbered lists
   - Handles mixed inline formatting (bold + italic)

### Integration Tests

1. Question form with MarkdownEditor
   - Saves markdown text correctly
   - Loads existing markdown for editing
   - Preserves formatting through save/load cycle

2. Question display with formatted explanations
   - Renders markdown explanations correctly
   - Displays line breaks and paragraphs
   - Shows lists with proper formatting

### Manual Testing Checklist

- [ ] Create new question with multi-line explanation
- [ ] Edit existing question and modify explanation
- [ ] Verify preview matches final display
- [ ] Test all markdown features (bold, italic, lists, line breaks)
- [ ] Test on mobile devices (responsive design)
- [ ] Verify keyboard shortcuts work
- [ ] Test with very long explanations
- [ ] Test with special characters and edge cases

## Implementation Notes

### Markdown Rendering Approach

We'll use a simple, custom markdown parser rather than a heavy library like `react-markdown` or `marked` because:
1. We only need basic formatting features
2. Keeps bundle size small
3. Full control over rendering and styling
4. Consistent with existing `MarkdownText` implementation

### Styling Considerations

- Preview mode should match the exact styling used in `IndividualQuestionPage`
- Use existing Tailwind classes for consistency
- Maintain the blue background for explanation display
- Ensure proper spacing between paragraphs and list items

### Accessibility

- Proper ARIA labels for tabs
- Keyboard navigation support
- Focus management when switching modes
- Screen reader announcements for mode changes

### Performance

- No performance concerns expected
- Markdown parsing is lightweight
- Preview renders only when tab is active
- No debouncing needed for preview updates

## Migration Considerations

### Existing Data

- Existing explanations in the database are plain text
- They will continue to work without modification
- Line breaks in existing data (if any) will now render correctly
- No data migration required

### Backward Compatibility

- The change is fully backward compatible
- Old explanations without markdown will display unchanged
- New markdown features are opt-in (admins choose to use them)

## UI/UX Design

### Edit Mode

```
┌─────────────────────────────────────────┐
│ Explanation                              │
│ ┌─────────┬─────────┐                   │
│ │  Edit   │ Preview │                   │
│ └─────────┴─────────┘                   │
│ ┌─────────────────────────────────────┐ │
│ │ Enter explanation with markdown...  │ │
│ │                                     │ │
│ │ Use **bold**, *italic*, or lists:  │ │
│ │ - Item 1                            │ │
│ │ - Item 2                            │ │
│ │                                     │ │
│ │                                     │ │
│ └─────────────────────────────────────┘ │
│ Supports markdown formatting            │
└─────────────────────────────────────────┘
```

### Preview Mode

```
┌─────────────────────────────────────────┐
│ Explanation                              │
│ ┌─────────┬─────────┐                   │
│ │  Edit   │ Preview │                   │
│ └─────────┴─────────┘                   │
│ ┌─────────────────────────────────────┐ │
│ │ Enter explanation with markdown...  │ │
│ │                                     │ │
│ │ Use bold, italic, or lists:         │ │
│ │ • Item 1                            │ │
│ │ • Item 2                            │ │
│ │                                     │ │
│ │                                     │ │
│ └─────────────────────────────────────┘ │
│ Preview of formatted text               │
└─────────────────────────────────────────┘
```

### Markdown Syntax Guide

A small help text will be displayed below the editor:

"Supports markdown: **bold**, *italic*, `code`, lists (- or 1.), and line breaks"

## Dependencies

### New Dependencies

None. The solution uses only existing dependencies:
- React (already installed)
- Radix UI Tabs (already installed via shadcn/ui)
- Tailwind CSS (already installed)

### Existing Components Used

- `Textarea` from `components/ui/textarea.tsx`
- `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` from `components/ui/tabs.tsx`
- `Label` from `components/ui/label.tsx`
- `MarkdownText` from `lib/utils/markdown.tsx`
