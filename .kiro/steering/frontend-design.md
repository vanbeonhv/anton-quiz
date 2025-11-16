---
inclusion: manual
---

# Frontend Design Principles for Anton Questions App

## Core Design Philosophy

Anton Questions App has a warm, approachable educational aesthetic. Avoid generic "AI slop" design patterns (Inter fonts, purple gradients, minimal animations). Instead, embrace our distinctive brand identity with playful yet professional design choices.

## Typography

**Primary Principle**: Use fonts that convey learning, warmth, and approachability.

**Avoid**: Inter, Roboto, Arial, Open Sans, system fonts

**Recommended Choices**:
- **Headlines**: Space Grotesk (geometric, modern), Bricolage Grotesque (playful), or Outfit (friendly)
- **Body Text**: DM Sans, Plus Jakarta Sans, or Manrope (readable, warm)
- **Accent/Numbers**: JetBrains Mono or Fira Code (for stats, XP, scores)

**Implementation**:
- Load from Google Fonts
- Use extreme weight contrasts: 200-300 for body, 700-900 for headlines
- Size jumps of 2.5x+ between hierarchy levels
- Pair geometric sans (headlines) with rounded sans (body) for warmth

## Color & Theme

**Brand Colors** (already defined):
- Primary Green: `#10b981` (success, correct answers)
- Primary Orange: `#f97316` (energy, CTAs)
- Accent Yellow: `#fbbf24` (highlights, achievements)
- BG Peach: `#ffe4e1` (warm background)
- BG Cream: `#fef3e2` (card backgrounds)

**Usage Principles**:
- Use CSS variables for consistency (already implemented)
- Create depth with layered backgrounds, not flat colors
- Green for positive actions, orange for primary CTAs
- Peach/cream for atmospheric warmth
- Add subtle gradients within brand colors (peach → cream transitions)

**Avoid**:
- Purple gradients
- Pure white backgrounds (use cream instead)
- High-contrast black/white (use warm grays)

## Motion & Animation

**Philosophy**: Delight through purposeful micro-interactions that reinforce learning progress.

**Key Moments to Animate**:
1. **Page Load**: Staggered reveals with `animation-delay` (already implemented)
2. **Answer Feedback**: Celebrate correct answers with bounce/scale effects
3. **XP Gains**: Number count-ups with easing
4. **Card Hovers**: Subtle lift and shadow expansion
5. **Button Interactions**: Scale on press, smooth color transitions

**Implementation**:
- Prefer CSS animations for performance
- Use Framer Motion for React components when needed
- Timing: 200-300ms for micro-interactions, 500-800ms for page transitions
- Easing: `ease-out` for entrances, `ease-in-out` for hovers

**Example Patterns**:
```css
/* Card hover lift */
.card {
  transition: transform 200ms ease-out, box-shadow 200ms ease-out;
}
.card:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 12px 24px rgba(0,0,0,0.12);
}

/* Staggered fade-in */
.animate-fade-in {
  animation: fadeIn 600ms ease-out forwards;
}
.animation-delay-100 { animation-delay: 100ms; }
.animation-delay-200 { animation-delay: 200ms; }
```

## Backgrounds

**Avoid**: Solid colors, generic gradients

**Recommended Approaches**:
1. **Layered Gradients**: Subtle peach-to-cream radial gradients
2. **Geometric Patterns**: Subtle dot grids, question mark patterns
3. **Organic Shapes**: Soft blob shapes in brand colors with low opacity
4. **Texture**: Paper-like texture for educational feel

**Implementation Examples**:
```css
/* Warm gradient background */
background: radial-gradient(
  circle at top right,
  #ffe4e1 0%,
  #fef3e2 50%,
  #fff5f0 100%
);

/* Subtle pattern overlay */
background-image: 
  radial-gradient(circle, rgba(16, 185, 129, 0.05) 1px, transparent 1px);
background-size: 24px 24px;
```

## Component-Specific Guidelines

### Hero Section
- Large, bold headline with extreme font weight (800-900)
- Animated screenshot with subtle float effect
- Dual CTA buttons with distinct colors (green + orange)
- Warm gradient background with subtle pattern

### Feature Cards
- Rounded corners (8-12px) for friendliness
- Hover effects: lift + shadow + border color change
- Icon backgrounds with brand color tints
- Generous padding for breathing room

### Stats/Numbers
- Use monospace font for numbers (JetBrains Mono)
- Animate count-ups on scroll into view
- Large size contrast (3x+ bigger than labels)
- Color-code by meaning (green = success, orange = activity)

### Question Demo
- Card-based layout with depth (shadows)
- Immediate visual feedback on interaction
- Smooth transitions between states
- Celebrate correct answers with animation

## Accessibility Requirements

- Maintain WCAG AA contrast ratios (already good with current colors)
- Ensure all interactive elements are min 44x44px touch targets
- Provide focus indicators with brand colors
- Use semantic HTML and ARIA labels
- Test with keyboard navigation

## Anti-Patterns to Avoid

❌ Generic AI aesthetics:
- Inter/Roboto fonts
- Purple gradients on white
- Flat, lifeless layouts
- Minimal or no animations
- Cookie-cutter component patterns

❌ Over-design:
- Too many competing animations
- Excessive color variety
- Cluttered layouts
- Inconsistent spacing

## Implementation Checklist

When creating or updating landing page components:

1. ✅ Use distinctive fonts (not Inter/Roboto)
2. ✅ Apply brand colors with CSS variables
3. ✅ Add purposeful animations (staggered reveals, hovers)
4. ✅ Create depth with gradients/shadows, not flat colors
5. ✅ Ensure 44x44px minimum touch targets
6. ✅ Test hover states and micro-interactions
7. ✅ Verify accessibility (contrast, focus states, ARIA)
8. ✅ Use warm, educational aesthetic throughout

## Design Inspiration

Think of the app as:
- A friendly tutor, not a strict exam
- A game with progression, not a boring test
- A warm study space, not a cold classroom

Visual references:
- Duolingo (gamification, friendly)
- Khan Academy (educational, approachable)
- Notion (clean, warm, purposeful)
