# Implementation Plan

- [x] 1. Enhance markdown rendering utilities
  - [x] 1.1 Extend markdown parser to support line breaks and paragraphs
    - Update `renderSimpleMarkdown` function in `lib/utils/markdown.tsx` to handle newlines
    - Convert single newlines to `<br />` tags
    - Convert double newlines to paragraph breaks
    - _Requirements: 1.1, 1.3_

  - [x] 1.2 Add support for italic text formatting
    - Implement parsing for `*text*` and `_text_` patterns
    - Add appropriate styling classes for italic text
    - _Requirements: 2.2, 2.4_

  - [x] 1.3 Add support for bullet lists
    - Detect lines starting with `- ` or `* `
    - Render as `<ul>` and `<li>` elements with proper styling
    - _Requirements: 2.2, 2.5_

  - [x] 1.4 Add support for numbered lists
    - Detect lines starting with number patterns like `1. `, `2. `
    - Render as `<ol>` and `<li>` elements with proper styling
    - _Requirements: 2.2, 2.6_

- [x] 2. Create MarkdownEditor component
  - [x] 2.1 Implement base component structure with tabs
    - Create new file `components/shared/MarkdownEditor.tsx`
    - Set up Tabs component with Edit and Preview modes
    - Define component props interface
    - _Requirements: 4.1, 4.2_

  - [x] 2.2 Implement edit mode with enhanced textarea
    - Add textarea with minimum height of 150px
    - Configure proper styling and placeholder text
    - Handle onChange events to update parent state
    - _Requirements: 1.1, 3.1, 3.2, 3.4_

  - [x] 2.3 Implement preview mode with markdown rendering
    - Integrate MarkdownText component for preview display
    - Apply consistent styling matching question display
    - _Requirements: 4.2, 4.4_

  - [x] 2.4 Add keyboard shortcuts and accessibility features
    - Implement Ctrl/Cmd + Enter to switch between tabs
    - Add proper ARIA labels for screen readers
    - Ensure keyboard navigation works correctly
    - _Requirements: 4.3_

- [x] 3. Integrate MarkdownEditor into QuestionForm
  - [x] 3.1 Replace Textarea with MarkdownEditor in QuestionForm
    - Update `components/admin/QuestionForm.tsx`
    - Replace the explanation Textarea with MarkdownEditor component
    - Pass formData.explanation and update handler as props
    - _Requirements: 1.1, 1.2, 2.1_

  - [x] 3.2 Update form styling and layout
    - Ensure MarkdownEditor fits well within the form layout
    - Maintain consistent spacing with other form fields
    - Add help text about markdown support
    - _Requirements: 3.3, 3.4_

- [x] 4. Verify explanation rendering in question display
  - [x] 4.1 Test markdown rendering in IndividualQuestionPage
    - Verify that enhanced MarkdownText renders all new features correctly
    - Ensure line breaks, paragraphs, and lists display properly
    - Check styling consistency with design specifications
    - _Requirements: 1.3, 2.3_

  - [x] 4.2 Update explanation display styling if needed
    - Adjust spacing between paragraphs and list items
    - Ensure proper text wrapping and overflow handling
    - Verify responsive design on mobile devices
    - _Requirements: 1.3, 2.3_

- [x] 5. Handle edge cases and data preservation
  - [x] 5.1 Test with existing plain text explanations
    - Verify backward compatibility with existing data
    - Ensure plain text explanations still display correctly
    - _Requirements: 1.2, 1.4_

  - [x] 5.2 Test save and load cycle with markdown
    - Create question with markdown explanation
    - Save to database
    - Load for editing and verify markdown is preserved
    - _Requirements: 1.2, 1.4, 2.1_

  - [x] 5.3 Test special characters and edge cases
    - Test with very long explanations
    - Test with special characters and symbols
    - Test with malformed markdown syntax
    - _Requirements: 1.1, 1.2_
