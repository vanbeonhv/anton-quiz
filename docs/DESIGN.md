# Quiz App - Design System

## Color Palette

### Primary Colors

#### Green (Success, Correct, Main Actions)
```css
--primary-green: #2D9F7C           /* Main green */
--primary-green-dark: #238968      /* Hover, active states */
--primary-green-light: #E8F5F1     /* Light backgrounds */
```

**Usage:**
- Daily Quiz cards
- Correct answer highlights
- Success messages
- Primary action buttons
- Progress indicators

#### Orange (Secondary, Warnings, Incorrect)
```css
--primary-orange: #F39C6B          /* Main orange */
--primary-orange-dark: #E88A56     /* Hover states */
--primary-orange-light: #FFF4EE    /* Light backgrounds */
```

**Usage:**
- Ranking badges
- Secondary buttons
- Wrong answer highlights
- Warning messages
- Accent elements

### Background Colors
```css
--bg-peach: #F5E6D3               /* Main app background */
--bg-cream: #FFF9F0               /* Card backgrounds */
--bg-white: #FFFFFF               /* Content areas, modals */
```

### Text Colors
```css
--text-primary: #2C1810           /* Headings, important text */
--text-secondary: #6B5847         /* Body text, descriptions */
--text-muted: #9B8A7A             /* Labels, hints, timestamps */
```

### Accent Colors
```css
--accent-yellow: #FFD166          /* Stars, achievements, highlights */
--accent-red: #E07856             /* Errors, delete actions */
```

### Semantic Colors
```css
--success: #2D9F7C                /* Success states */
--error: #E07856                  /* Error states */
--warning: #F39C6B                /* Warning states */
--info: #6B9BD1                   /* Info messages */
```

## Tailwind Configuration

Add to `tailwind.config.ts`:

```typescript
colors: {
  primary: {
    green: {
      DEFAULT: '#2D9F7C',
      dark: '#238968',
      light: '#E8F5F1',
    },
    orange: {
      DEFAULT: '#F39C6B',
      dark: '#E88A56',
      light: '#FFF4EE',
    },
  },
  background: {
    peach: '#F5E6D3',
    cream: '#FFF9F0',
    white: '#FFFFFF',
  },
  text: {
    primary: '#2C1810',
    secondary: '#6B5847',
    muted: '#9B8A7A',
  },
  accent: {
    yellow: '#FFD166',
    red: '#E07856',
  },
  success: '#2D9F7C',
  error: '#E07856',
  warning: '#F39C6B',
}
```

## Typography

### Font Family
```css
/* Use system fonts for performance */
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 
             'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', 
             sans-serif;
```

### Font Sizes
```css
text-xs     /* 12px - Small labels, timestamps */
text-sm     /* 14px - Secondary text, captions */
text-base   /* 16px - Body text (default) */
text-lg     /* 18px - Large body text */
text-xl     /* 20px - Small headings */
text-2xl    /* 24px - Section headings */
text-3xl    /* 30px - Page headings */
text-4xl    /* 36px - Hero headings */
```

### Font Weights
```css
font-normal   /* 400 - Body text */
font-medium   /* 500 - Emphasized text */
font-semibold /* 600 - Subheadings */
font-bold     /* 700 - Headings */
```

### Line Heights
```css
leading-tight    /* 1.25 - Headings */
leading-normal   /* 1.5 - Body text */
leading-relaxed  /* 1.75 - Long-form content */
```

## Spacing Scale

```css
/* Tailwind default scale */
0    = 0px
1    = 4px      /* Tiny gaps */
2    = 8px      /* Small gaps */
3    = 12px     /* Default gaps */
4    = 16px     /* Standard spacing */
6    = 24px     /* Section spacing */
8    = 32px     /* Large spacing */
12   = 48px     /* XL spacing */
16   = 64px     /* XXL spacing */
```

### Common Spacing Patterns
- **Component padding**: `p-4` or `p-6`
- **Card padding**: `p-6` or `p-8`
- **Section margins**: `my-8` or `my-12`
- **Grid gaps**: `gap-4` or `gap-6`
- **Button padding**: `px-4 py-2` or `px-6 py-3`

## Border Radius

```css
rounded-none    /* 0px - No rounding */
rounded-sm      /* 2px - Subtle */
rounded         /* 4px - Default */
rounded-md      /* 6px - Medium */
rounded-lg      /* 8px - Large (cards) */
rounded-xl      /* 12px - XL (featured cards) */
rounded-2xl     /* 16px - XXL (buttons, answers) */
rounded-full    /* 9999px - Pills, avatars */
```

### Usage
- **Buttons**: `rounded-2xl`
- **Cards**: `rounded-lg` or `rounded-xl`
- **Inputs**: `rounded-md`
- **Badges**: `rounded-full`
- **Answer options**: `rounded-2xl`

## Shadows

```css
shadow-sm       /* Subtle shadow for cards */
shadow          /* Default shadow */
shadow-md       /* Medium shadow for hover states */
shadow-lg       /* Large shadow for modals */
shadow-none     /* No shadow */
```

### Usage
- **Cards at rest**: `shadow-sm`
- **Cards on hover**: `shadow-md`
- **Modals**: `shadow-lg`
- **Floating buttons**: `shadow-lg`

## Component Patterns

### Card
```tsx
<div className="bg-background-cream rounded-lg shadow-sm border border-background-peach p-6 hover:shadow-md transition-shadow">
  {/* Content */}
</div>
```

### Button Primary
```tsx
<button className="bg-primary-green hover:bg-primary-green-dark text-white font-semibold px-6 py-3 rounded-2xl transition-colors">
  Continue
</button>
```

### Button Secondary
```tsx
<button className="bg-primary-orange hover:bg-primary-orange-dark text-white font-semibold px-6 py-3 rounded-2xl transition-colors">
  Skip
</button>
```

### Input Field
```tsx
<input className="w-full px-4 py-3 rounded-md border-2 border-background-peach focus:border-primary-green focus:outline-none transition-colors" />
```

### Answer Option (Unselected)
```tsx
<button className="w-full p-4 rounded-2xl border-2 border-background-peach bg-background-cream text-text-primary hover:border-primary-orange transition-all text-left">
  {/* Option content */}
</button>
```

### Answer Option (Selected)
```tsx
<button className="w-full p-4 rounded-2xl border-2 border-primary-green bg-primary-green text-white transition-all text-left">
  {/* Option content */}
</button>
```

### Answer Option (Correct - After Submit)
```tsx
<button className="w-full p-4 rounded-2xl border-2 border-primary-green bg-primary-green text-white transition-all text-left">
  {/* Option content */}
  <CheckIcon className="w-6 h-6" />
</button>
```

### Answer Option (Wrong - After Submit)
```tsx
<button className="w-full p-4 rounded-2xl border-2 border-primary-orange bg-primary-orange text-white transition-all text-left">
  {/* Option content */}
  <XIcon className="w-6 h-6" />
</button>
```

### Badge
```tsx
<span className="inline-flex items-center px-3 py-1 rounded-full bg-primary-orange text-white text-sm font-medium">
  32 Ranking
</span>
```

### Progress Bar
```tsx
<div className="w-full h-2 bg-primary-orange-light rounded-full overflow-hidden">
  <div className="h-full bg-primary-green rounded-full transition-all duration-300" style={{ width: '60%' }} />
</div>
```

## Layout

### Container
```tsx
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  {/* Content */}
</div>
```

### Page Layout
```tsx
<div className="min-h-screen bg-background-peach">
  <Header />
  <main className="container mx-auto px-4 py-8">
    {/* Page content */}
  </main>
</div>
```

### Grid Layouts
```tsx
{/* Quiz cards - responsive grid */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
  {/* Cards */}
</div>

{/* Answer options - single column */}
<div className="flex flex-col gap-3">
  {/* Options */}
</div>
```

## Responsive Breakpoints

```css
/* Mobile first approach */
sm: 640px   /* Small tablets */
md: 768px   /* Tablets */
lg: 1024px  /* Laptops */
xl: 1280px  /* Desktops */
2xl: 1536px /* Large desktops */
```

### Common Responsive Patterns
```tsx
{/* Stack on mobile, row on desktop */}
<div className="flex flex-col md:flex-row gap-4">

{/* 1 column mobile, 2 tablet, 3 desktop */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

{/* Full width mobile, max-width desktop */}
<div className="w-full lg:max-w-2xl">

{/* Hide on mobile, show on desktop */}
<div className="hidden md:block">

{/* Show on mobile, hide on desktop */}
<div className="block md:hidden">
```

## Animations & Transitions

### Standard Transitions
```css
transition-all      /* All properties */
transition-colors   /* Color changes only */
transition-transform /* Transform only */
transition-shadow   /* Shadow only */

/* Duration */
duration-150   /* 150ms - Quick */
duration-300   /* 300ms - Standard (default) */
duration-500   /* 500ms - Slow */
```

### Common Animations
```tsx
{/* Hover scale */}
<div className="hover:scale-105 transition-transform">

{/* Fade in on load */}
<div className="animate-fadeIn">

{/* Loading spinner */}
<div className="animate-spin">
```

## Accessibility

### Color Contrast
All text must meet WCAG AA standards:
- Normal text: 4.5:1 contrast ratio
- Large text (18px+): 3:1 contrast ratio

### Focus States
```tsx
{/* Always include focus styles */}
<button className="focus:outline-none focus:ring-2 focus:ring-primary-green focus:ring-offset-2">
```

### ARIA Labels
```tsx
<button aria-label="Skip question">
<input aria-describedby="email-error">
<div role="alert" aria-live="polite">
```

## Icons

Use **Lucide React** for icons:
```tsx
import { Check, X, Star, Trophy, Settings } from 'lucide-react'

<Check className="w-5 h-5 text-primary-green" />
```

### Icon Sizes
- Small: `w-4 h-4` (16px)
- Medium: `w-5 h-5` (20px)
- Large: `w-6 h-6` (24px)
- XL: `w-8 h-8` (32px)

## Loading States

### Skeleton
```tsx
<div className="animate-pulse">
  <div className="h-4 bg-background-peach rounded w-3/4 mb-2"></div>
  <div className="h-4 bg-background-peach rounded w-1/2"></div>
</div>
```

### Spinner
```tsx
<div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-green border-t-transparent"></div>
```

## Empty States

```tsx
<div className="text-center py-12">
  <div className="text-6xl mb-4">📝</div>
  <h3 className="text-xl font-semibold text-text-primary mb-2">
    No quizzes yet
  </h3>
  <p className="text-text-secondary mb-6">
    Get started by creating your first quiz
  </p>
  <Button>Create Quiz</Button>
</div>
```

## Error States

```tsx
<div className="bg-error/10 border border-error rounded-lg p-4 text-error">
  <p className="font-medium">Error loading quiz</p>
  <p className="text-sm mt-1">Please try again later</p>
</div>
```

---

**Design Principles:**
1. **Consistency** - Use the same patterns throughout
2. **Simplicity** - Avoid over-styling
3. **Accessibility** - Always consider all users
4. **Responsiveness** - Mobile-first approach
5. **Performance** - Optimize for speed