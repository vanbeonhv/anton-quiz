# Markdown Support in Questions

The application now supports basic markdown formatting in question text and explanation fields.

## Supported Formatting

### Bold Text
Use `**text**` to make text bold:
- Input: `What is **React**?`
- Output: What is **React**?

### Code Text
Use `` `text` `` to format text as code:
- Input: `Use the \`useState\` hook`
- Output: Use the `useState` hook

### Combined Formatting
You can combine both formats:
- Input: `The **useState** hook uses \`const [state, setState] = useState()\` syntax`
- Output: The **useState** hook uses `const [state, setState] = useState()` syntax

## Implementation

The markdown rendering is handled by the `renderSimpleMarkdown` function in `lib/utils/markdown.tsx`. It:

1. Splits text by markdown patterns while preserving delimiters
2. Converts `**text**` to `<strong>` elements with `font-semibold` class
3. Converts `` `text` `` to `<code>` elements with appropriate styling
4. Leaves regular text unchanged

## Components Updated

The following components now support markdown rendering:

- `IndividualQuestionPage` - Question text, explanation, and answer options
- `AnswerOption` - Individual answer option text
- `QuestionCard` - Question preview text
- `QuestionRow` - Question text in table view
- `RecentActivityTimeline` - Question text in activity feed
- `QuestionManagement` - Question text and answer options in admin panel
- `BulkTagAssignment` - Question text in bulk operations
- `BulkQuestionImport` - Question text preview

## Usage

Simply wrap text content with the `MarkdownText` component:

```tsx
import { MarkdownText } from '@/lib/utils/markdown'

function MyComponent({ questionText }: { questionText: string }) {
  return (
    <p className="text-lg">
      <MarkdownText>{questionText}</MarkdownText>
    </p>
  )
}
```

Or use the `renderSimpleMarkdown` function directly for more control:

```tsx
import { renderSimpleMarkdown } from '@/lib/utils/markdown'

function MyComponent({ text }: { text: string }) {
  return <span>{renderSimpleMarkdown(text)}</span>
}
```