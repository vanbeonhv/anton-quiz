# Design Document

## Overview

This design fixes the critical column alignment issues in the existing question table layout. The current implementation has misaligned columns between the header and data rows due to inconsistent CSS grid definitions, padding mismatches, and responsive breakpoint conflicts. This design provides a comprehensive solution to ensure perfect column alignment across all screen sizes.

## Architecture

### Root Cause Analysis

The current alignment issues stem from:

1. **Inconsistent Grid Definitions**: Header and row grids use different CSS classes with potential conflicts
2. **Padding Mismatches**: Different padding values between header cells and data cells
3. **Responsive Breakpoint Issues**: Grid column changes don't synchronize properly across components
4. **CSS Specificity Problems**: Conflicting styles from different CSS layers

### Solution Strategy

- **Unified Grid System**: Single CSS grid definition shared between header and rows
- **Standardized Spacing**: Consistent padding/margin system across all components
- **Synchronized Responsive**: Coordinated breakpoint handling with CSS custom properties
- **Clean CSS Architecture**: Simplified CSS with clear hierarchy and no conflicts

## Components and Interfaces

### Unified Grid System

**CSS Grid Definition**:
```css
.question-table-grid {
  display: grid;
  grid-template-columns: 
    var(--col-status, 40px)
    var(--col-number, 80px) 
    var(--col-title, 1fr)
    var(--col-difficulty, 100px)
    var(--col-success, 120px)
    var(--col-tags, 200px);
  align-items: center;
  gap: 0;
}
```

**CSS Custom Properties for Responsive**:
```css
:root {
  /* Desktop (≥1024px) */
  --col-status: 40px;
  --col-number: 80px;
  --col-title: 1fr;
  --col-difficulty: 100px;
  --col-success: 120px;
  --col-tags: 200px;
}

@media (max-width: 1023px) {
  :root {
    /* Tablet - hide success rate */
    --col-success: 0px;
  }
}

@media (max-width: 767px) {
  :root {
    /* Mobile - only status and stacked content */
    --col-number: 0px;
    --col-difficulty: 0px;
    --col-tags: 0px;
  }
}
```

**Standardized Cell Padding**:
```css
.question-cell {
  padding: 12px 8px;
  display: flex;
  align-items: center;
  min-height: 60px;
}

.question-cell--center {
  justify-content: center;
}

.question-cell--start {
  justify-content: flex-start;
}
```

### Component Structure Fixes

**QuestionTable Header**:
```tsx
<div className="question-table-grid question-table-header">
  <div className="question-cell question-cell--center">Status</div>
  <div className="question-cell question-cell--start">Number</div>
  <div className="question-cell question-cell--start">Question</div>
  <div className="question-cell question-cell--center">Difficulty</div>
  <div className="question-cell question-cell--center">Success Rate</div>
  <div className="question-cell question-cell--start">Tags</div>
</div>
```

**QuestionRow Data**:
```tsx
<div className="question-table-grid question-table-row">
  <div className="question-cell question-cell--center">{statusIcon}</div>
  <div className="question-cell question-cell--start">#{number}</div>
  <div className="question-cell question-cell--start">{title}</div>
  <div className="question-cell question-cell--center">{difficulty}</div>
  <div className="question-cell question-cell--center">{successRate}</div>
  <div className="question-cell question-cell--start">{tags}</div>
</div>
```

**Mobile Responsive Strategy**:
- Use CSS `display: none` on hidden columns instead of changing grid structure
- Maintain same grid definition but hide content with CSS
- Use absolute positioning for mobile stacked layout overlay

### Mobile Layout Strategy

**Problem**: Current mobile layout changes grid structure, breaking alignment

**Solution**: Overlay approach that maintains grid structure

```css
@media (max-width: 767px) {
  .question-table-row {
    position: relative;
  }
  
  .question-table-row .mobile-overlay {
    position: absolute;
    top: 0;
    left: 40px; /* After status column */
    right: 0;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 8px 12px;
    background: inherit;
  }
  
  /* Hide desktop columns on mobile */
  .question-table-row .question-cell:nth-child(n+2) {
    opacity: 0;
    pointer-events: none;
  }
}
```

This approach:
- Keeps the same grid structure for perfect alignment
- Uses overlay for mobile content without breaking grid
- Maintains consistent spacing and behavior

## Implementation Details

### CSS Architecture

**File Structure**:
```
app/globals.css
├── Base styles
├── Component layer
│   ├── .question-table-grid (unified grid)
│   ├── .question-cell (standardized cells)
│   └── .question-table-* (specific variants)
└── Responsive layer
    ├── Tablet breakpoint (1023px)
    └── Mobile breakpoint (767px)
```

**CSS Custom Properties Benefits**:
- Single source of truth for column widths
- Easy responsive adjustments
- Runtime debugging capability
- Future-proof for dynamic column sizing

### Component Refactoring

**QuestionTable.tsx Changes**:
1. Remove inconsistent padding from wrapper divs
2. Apply unified `question-table-grid` class to header
3. Standardize cell structure with `question-cell` classes
4. Remove responsive grid changes in favor of CSS-only approach

**QuestionRow.tsx Changes**:
1. Apply same `question-table-grid` class structure
2. Use consistent `question-cell` wrapper for all content
3. Implement mobile overlay without changing grid structure
4. Remove manual responsive logic in favor of CSS

## Testing Strategy

### Visual Alignment Tests

**Grid Alignment Verification**:
```typescript
// Test that header and row grids have identical column boundaries
const headerCells = document.querySelectorAll('.question-table-header .question-cell')
const firstRowCells = document.querySelectorAll('.question-table-row:first-child .question-cell')

headerCells.forEach((headerCell, index) => {
  const rowCell = firstRowCells[index]
  expect(headerCell.getBoundingClientRect().left).toBe(rowCell.getBoundingClientRect().left)
  expect(headerCell.getBoundingClientRect().width).toBe(rowCell.getBoundingClientRect().width)
})
```

**Responsive Breakpoint Tests**:
- Test column visibility at each breakpoint
- Verify alignment maintained during resize
- Check mobile overlay positioning

### Cross-Browser Testing

**Grid Support Verification**:
- Test CSS Grid behavior in Safari, Chrome, Firefox
- Verify CSS custom properties support
- Test responsive behavior on actual devices

## Migration Plan

### Phase 1: CSS Foundation
1. Update `app/globals.css` with unified grid system
2. Add CSS custom properties for responsive behavior
3. Create standardized cell classes
4. Test grid alignment in isolation

### Phase 2: Component Updates
1. Refactor `QuestionTable.tsx` to use unified grid
2. Update `QuestionRow.tsx` with consistent cell structure
3. Implement mobile overlay approach
4. Remove old responsive logic

### Phase 3: Testing & Validation
1. Visual regression testing across breakpoints
2. Cross-browser compatibility testing
3. Performance impact assessment
4. User acceptance testing

### Phase 4: Cleanup
1. Remove unused CSS classes
2. Update documentation
3. Add maintenance guidelines
4. Monitor for any edge cases

## Key Benefits

### Immediate Improvements
- **Perfect Column Alignment**: Header and data columns will align exactly
- **Consistent Spacing**: Standardized padding across all components
- **Robust Responsive**: No more alignment breaks during screen resize
- **Maintainable Code**: Clean CSS architecture prevents future issues

### Long-term Benefits
- **Scalable System**: CSS custom properties allow easy column adjustments
- **Performance**: Simplified CSS reduces layout recalculations
- **Developer Experience**: Clear structure makes debugging and modifications easier
- **Future-proof**: Architecture supports additional columns or layout changes

### Risk Mitigation
- **Backward Compatibility**: Changes are primarily CSS-based with minimal component logic changes
- **Incremental Rollout**: Can be tested thoroughly before full deployment
- **Rollback Plan**: Original CSS can be quickly restored if issues arise
- **Cross-browser Support**: Uses well-supported CSS Grid and custom properties

This design provides a comprehensive solution to the column alignment issues while establishing a solid foundation for future table layout improvements.