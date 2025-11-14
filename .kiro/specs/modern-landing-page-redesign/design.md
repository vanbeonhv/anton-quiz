# Design Document

## Overview

This document outlines the design for a modern, visually appealing landing page for the Anton Questions App. The design is inspired by contemporary SaaS landing pages (specifically Namviek) and features gradient backgrounds, product screenshots, smooth animations, and an interactive demo. The redesign maintains the existing warm color palette while creating a more engaging and professional first impression.

## Architecture

### Component Structure

```
app/page.tsx (Landing Page)
├── HeroSection
│   ├── Logo
│   ├── Headline & Subheadline
│   ├── CTA Buttons
│   └── Hero Image/Screenshot
├── ProductShowcaseSection
│   ├── Screenshot Display (Question Interface)
│   └── Feature Highlights
├── FeaturesSection
│   ├── FeatureCard (Practice Questions)
│   ├── FeatureCard (Track Progress)
│   └── FeatureCard (Leaderboards)
├── InteractiveDemoSection
│   └── DemoQuestionCard
├── StatsSection
│   ├── StatCard (Total Questions)
│   ├── StatCard (Active Users)
│   └── StatCard (Questions Answered Today)
├── CTASection
│   └── Final Call-to-Action
└── Footer
```

### New Components to Create

1. **`components/landing/HeroSection.tsx`** - Hero section with gradient background
2. **`components/landing/ProductShowcase.tsx`** - Product screenshot display with annotations
3. **`components/landing/FeatureCard.tsx`** - Reusable feature card component
4. **`components/landing/DemoQuestion.tsx`** - Interactive demo question component
5. **`components/landing/StatCard.tsx`** - Animated statistics card
6. **`components/landing/GradientBackground.tsx`** - Reusable gradient background component

## Components and Interfaces

### 1. HeroSection Component

**Purpose**: Create an impactful first impression with clear value proposition and visual appeal

**Design**:
```typescript
interface HeroSectionProps {
  onTryDemo: () => void
}
```

**Visual Design**:
- Gradient background: Radial gradient from peach to cream with subtle orange/green accents
- Layout: Centered content with text on left, screenshot on right (desktop) or stacked (mobile)
- Typography: 
  - Headline: 4xl-6xl font size, bold, text-primary
  - Subheadline: xl-2xl font size, text-secondary
- CTA Buttons:
  - Primary: "Try a Question" (green, larger)
  - Secondary: "Sign Up Free" (orange, outlined)
- Hero Image: Screenshot of the question-answering interface with subtle shadow and border radius

**Interactions**:
- Hover effects on CTA buttons (scale 1.05, shadow increase)
- Smooth scroll to demo section when "Try a Question" is clicked
- Fade-in animation on page load

### 2. ProductShowcase Component

**Purpose**: Display the core question-answering interface in an attractive way

**Design**:
```typescript
interface ProductShowcaseProps {
  title: string
  description: string
  imageSrc: string
  imageAlt: string
  reverse?: boolean
}
```

**Visual Design**:
- Two-column layout with screenshot and description
- Screenshot: 
  - Actual question interface screenshot
  - Subtle shadow and border
  - Slight tilt/perspective effect (optional)
- Background: Gradient from cream to peach
- Annotations: Small badges/labels pointing to key features

**Content**:
- Screenshot 1: Question with multiple choice options
- Screenshot 2: Result screen with explanation and XP gain
- Highlight features: Difficulty levels, tags, instant feedback, XP system

### 3. FeatureCard Component

**Purpose**: Showcase individual features in an attractive card format

**Design**:
```typescript
interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
  accentColor: 'green' | 'orange' | 'yellow'
}
```

**Visual Design**:
- Card: White background, subtle border, hover effect (border color change, shadow)
- Icon: Circular background with accent color, centered at top
- Typography:
  - Title: xl-2xl, bold, text-primary
  - Description: base, text-secondary
- Spacing: Generous padding (6-8)
- Hover: Border changes to accent color, slight scale (1.02)

### 4. DemoQuestion Component

**Purpose**: Allow users to try a sample question without authentication

**Design**:
```typescript
interface DemoQuestionProps {
  question: {
    text: string
    options: { label: 'A' | 'B' | 'C' | 'D'; text: string }[]
    correctAnswer: 'A' | 'B' | 'C' | 'D'
    explanation: string
  }
}
```

**Visual Design**:
- Styled exactly like the real question interface
- Uses existing AnswerOption component
- Shows result inline after selection
- CTA to sign up appears after answering

**Interactions**:
- Click option to select
- Auto-submit after selection (no submit button needed for demo)
- Show result with explanation
- Display "Sign up to continue" prompt with CTA button

**Sample Question**:
```typescript
const DEMO_QUESTION = {
  text: "What is the time complexity of binary search?",
  options: [
    { label: 'A', text: 'O(n)' },
    { label: 'B', text: 'O(log n)' },
    { label: 'C', text: 'O(n²)' },
    { label: 'D', text: 'O(1)' }
  ],
  correctAnswer: 'B',
  explanation: "Binary search has O(log n) time complexity because it divides the search space in half with each iteration."
}
```

### 5. StatCard Component

**Purpose**: Display statistics in an engaging, animated way

**Design**:
```typescript
interface StatCardProps {
  icon: React.ReactNode
  value: number
  label: string
  color: 'green' | 'orange' | 'yellow'
  suffix?: string
}
```

**Visual Design**:
- Card: White background, border, rounded corners
- Icon: Colored icon at top
- Value: Large (4xl-5xl), bold, colored text
- Label: Smaller, text-secondary
- Animation: Count-up animation when card enters viewport

**Implementation**:
- Use Intersection Observer to trigger animation
- Count-up animation using requestAnimationFrame
- Duration: 1.5 seconds

### 6. GradientBackground Component

**Purpose**: Reusable gradient background with consistent styling

**Design**:
```typescript
interface GradientBackgroundProps {
  variant: 'hero' | 'feature' | 'cta'
  children: React.ReactNode
}
```

**Gradient Variants**:
- **Hero**: Radial gradient from center
  - `radial-gradient(circle at 50% 50%, #FFF5F0 0%, #FFF9F5 50%, #FFFBF7 100%)`
  - Overlay: Subtle noise texture (optional)
  
- **Feature**: Linear gradient diagonal
  - `linear-gradient(135deg, #FFFBF7 0%, #FFF5F0 100%)`
  
- **CTA**: Vibrant gradient with accent colors
  - `linear-gradient(135deg, #E8F5E9 0%, #FFF3E0 100%)`

## Data Models

### Landing Page Statistics

```typescript
interface LandingPageStats {
  totalQuestions: number
  totalUsers: number
  questionsAnsweredToday: number
}
```

**Data Source**: 
- API endpoint: `/api/public/stats`
- Cached for 5 minutes
- Fallback values if API fails

### Demo Question State

```typescript
interface DemoQuestionState {
  selectedAnswer: 'A' | 'B' | 'C' | 'D' | null
  showResult: boolean
  showAuthPrompt: boolean
}
```

## Styling and Design System

### Color Palette

**Existing Colors** (from Tailwind config):
- `bg-peach`: #FFF5F0
- `bg-cream`: #FFFBF7
- `primary-green`: #4CAF50
- `primary-orange`: #FF9800
- `accent-yellow`: #FFC107

**New Gradient Combinations**:
```css
/* Hero gradient */
.hero-gradient {
  background: radial-gradient(
    circle at 30% 20%,
    rgba(255, 245, 240, 1) 0%,
    rgba(255, 251, 247, 1) 50%,
    rgba(255, 255, 255, 0.8) 100%
  );
}

/* Feature gradient */
.feature-gradient {
  background: linear-gradient(
    135deg,
    rgba(255, 251, 247, 1) 0%,
    rgba(255, 245, 240, 1) 100%
  );
}

/* CTA gradient */
.cta-gradient {
  background: linear-gradient(
    135deg,
    rgba(232, 245, 233, 0.3) 0%,
    rgba(255, 243, 224, 0.3) 100%
  );
}
```

### Typography Scale

- **Hero Headline**: 
  - Mobile: text-4xl (36px)
  - Tablet: text-5xl (48px)
  - Desktop: text-6xl (60px)
  
- **Section Headings**: 
  - Mobile: text-3xl (30px)
  - Desktop: text-4xl (36px)
  
- **Feature Titles**: text-xl to text-2xl (20-24px)
- **Body Text**: text-base to text-lg (16-18px)

### Spacing System

- **Section Padding**: 
  - Mobile: py-12 (48px)
  - Desktop: py-20 (80px)
  
- **Container Max Width**: max-w-6xl (1152px)
- **Card Padding**: p-6 to p-8 (24-32px)
- **Element Gaps**: gap-4 to gap-8 (16-32px)

### Animation Specifications

**Fade In**:
```css
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

**Scale on Hover**:
```css
.hover-scale {
  transition: transform 200ms ease-in-out;
}
.hover-scale:hover {
  transform: scale(1.02);
}
```

**Count Up Animation**:
- Use `react-countup` library or custom implementation
- Duration: 1.5s
- Easing: ease-out
- Trigger: When element enters viewport

## Layout Structure

### Desktop Layout (≥1024px)

```
┌─────────────────────────────────────────┐
│           Hero Section                   │
│  ┌──────────────┐  ┌──────────────┐    │
│  │   Content    │  │  Screenshot  │    │
│  │   + CTAs     │  │              │    │
│  └──────────────┘  └──────────────┘    │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│      Product Showcase Section            │
│  ┌──────────────┐  ┌──────────────┐    │
│  │  Screenshot  │  │  Description │    │
│  └──────────────┘  └──────────────┘    │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│         Features Section                 │
│  ┌────┐  ┌────┐  ┌────┐                │
│  │ F1 │  │ F2 │  │ F3 │                │
│  └────┘  └────┘  └────┘                │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│      Interactive Demo Section            │
│         ┌──────────────┐                 │
│         │ Demo Question│                 │
│         └──────────────┘                 │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│          Stats Section                   │
│  ┌────┐  ┌────┐  ┌────┐                │
│  │ S1 │  │ S2 │  │ S3 │                │
│  └────┘  └────┘  └────┘                │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│           CTA Section                    │
│         Headline + CTAs                  │
└─────────────────────────────────────────┘
```

### Mobile Layout (<768px)

- All sections stack vertically
- Hero: Content above screenshot
- Product Showcase: Screenshot above description
- Features: Single column
- Demo: Full width
- Stats: Single column or 2-column grid
- CTA: Full width buttons

## Error Handling

### Statistics Loading Failure

**Scenario**: API call to fetch statistics fails

**Handling**:
1. Use fallback static values
2. Log error to console (development only)
3. No error message shown to user
4. Retry on next page load

**Fallback Values**:
```typescript
const FALLBACK_STATS = {
  totalQuestions: 500,
  totalUsers: 1200,
  questionsAnsweredToday: 350
}
```

### Image Loading Failure

**Scenario**: Product screenshots fail to load

**Handling**:
1. Show placeholder with gradient background
2. Display icon or illustration instead
3. Ensure layout doesn't break

### Demo Question Interaction

**Scenario**: User tries to interact with demo after answering

**Handling**:
1. Disable further interactions
2. Show "Sign up to continue" prompt
3. Highlight CTA button

## Testing Strategy

### Visual Testing

1. **Responsive Design**:
   - Test on viewports: 320px, 768px, 1024px, 1440px, 1920px
   - Verify all sections adapt correctly
   - Check image scaling and text readability

2. **Cross-Browser**:
   - Chrome, Firefox, Safari, Edge
   - Verify gradient rendering
   - Check animation performance

3. **Accessibility**:
   - Color contrast ratios (WCAG AA minimum)
   - Keyboard navigation for all interactive elements
   - Screen reader compatibility
   - Focus indicators visible

### Functional Testing

1. **Navigation**:
   - CTA buttons navigate to correct pages
   - Smooth scroll to demo section works
   - Back button returns to previous page

2. **Demo Question**:
   - Answer selection works
   - Result displays correctly
   - Auth prompt appears after answering
   - Can't change answer after submission

3. **Statistics**:
   - Numbers display correctly
   - Count-up animation triggers
   - Fallback values work when API fails

4. **Performance**:
   - Page loads in <3 seconds
   - Images are optimized
   - Animations don't cause jank
   - Lighthouse score >90

### User Testing

1. **First Impression**:
   - Users understand app purpose within 5 seconds
   - Value proposition is clear
   - CTA buttons are obvious

2. **Engagement**:
   - Users try the demo question
   - Users scroll through features
   - Users click CTA buttons

3. **Mobile Experience**:
   - Layout is comfortable on mobile
   - Buttons are easy to tap
   - Text is readable without zooming

## Implementation Notes

### Phase 1: Structure and Layout
1. Create new landing component files
2. Set up gradient backgrounds
3. Implement responsive grid layouts
4. Add placeholder content

### Phase 2: Content and Styling
1. Add real content and copy
2. Implement color scheme and typography
3. Add icons and visual elements
4. Style all components

### Phase 3: Interactivity
1. Implement demo question functionality
2. Add hover effects and transitions
3. Implement smooth scrolling
4. Add count-up animations for stats

### Phase 4: Polish and Optimization
1. Optimize images and assets
2. Add loading states
3. Implement error handling
4. Test across devices and browsers
5. Accessibility audit and fixes

### Dependencies

**New Dependencies** (if needed):
- `react-intersection-observer` - For scroll animations
- `framer-motion` - For advanced animations (optional)

**Existing Dependencies**:
- `lucide-react` - Icons
- `next/image` - Image optimization
- Tailwind CSS - Styling
- shadcn/ui components - UI primitives

### Asset Requirements

**Available Screenshots** (from `/assets/` folder):
1. `question.png` - Question interface with options (PRIMARY - use in hero/showcase)
2. `question-list.png` - Question browser/list view
3. `dashboard.png` - Dashboard with progress tracking
4. `scoreboard.png` - Leaderboard view
5. Updated versions: `*-31.10.25.png` files

**Implementation Plan**:
- Copy relevant screenshots from `/assets/` to `/public/screenshots/`
- Use `question.png` as primary hero/showcase image
- Use `dashboard.png` for progress tracking feature
- Use `scoreboard.png` for leaderboard feature
- Optimize images for web (Next.js Image component will handle this)

**Screenshot Specifications**:
- Format: PNG (existing)
- Use Next.js Image component for automatic optimization
- Lazy load images below the fold
- Preload hero image for performance

### SEO Considerations

1. **Meta Tags**:
   - Title: "Anton Questions - Practice, Learn, and Level Up"
   - Description: "Master your knowledge with thousands of questions across multiple topics and difficulty levels. Track your progress, earn XP, and compete on leaderboards."
   - OG Image: Hero screenshot

2. **Structured Data**:
   - WebApplication schema
   - Organization schema
   - AggregateRating (if we add reviews)

3. **Performance**:
   - Lazy load images below fold
   - Preload hero image
   - Minimize JavaScript bundle
   - Use Next.js Image optimization

## Accessibility Requirements

1. **Semantic HTML**:
   - Proper heading hierarchy (h1 → h2 → h3)
   - Landmark regions (header, main, footer, nav)
   - Lists for feature cards

2. **ARIA Labels**:
   - Descriptive labels for all buttons
   - Alt text for all images
   - aria-label for icon-only buttons

3. **Keyboard Navigation**:
   - All interactive elements focusable
   - Logical tab order
   - Visible focus indicators
   - Skip to main content link

4. **Color Contrast**:
   - Text on backgrounds: minimum 4.5:1
   - Large text: minimum 3:1
   - Interactive elements: minimum 3:1

5. **Motion**:
   - Respect `prefers-reduced-motion`
   - Disable animations if user prefers
   - Ensure content accessible without animations

## Future Enhancements

1. **Video Demo**: Replace static screenshots with video walkthrough
2. **Testimonials**: Add user testimonials section
3. **FAQ Section**: Add frequently asked questions
4. **Comparison Table**: Compare with other quiz platforms
5. **Live Activity Feed**: Show real-time question attempts
6. **Gamification Preview**: Show level progression visualization
7. **Topic Showcase**: Highlight popular question topics
8. **Mobile App Links**: Add app store badges (if mobile apps exist)
