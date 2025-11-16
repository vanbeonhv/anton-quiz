# Steering Rules for Anton Questions App

This directory contains steering rules that guide AI assistance for the Anton Questions App project.

## Available Rules

### 1. `tech.md` - Technology Stack
- Framework and runtime information (Next.js, React, Node.js)
- Database and ORM setup (PostgreSQL, Prisma)
- Authentication (Supabase Auth)
- Styling and UI (Tailwind CSS, shadcn/ui)
- Common commands for development

**Inclusion**: Always included

### 2. `structure.md` - Project Structure
- Directory organization and file naming conventions
- Component architecture patterns
- Import patterns and best practices
- API route structure

**Inclusion**: Always included

### 3. `product.md` - Product Overview
- Core features and user experience
- Target users and key differentiators
- Product vision and goals

**Inclusion**: Always included

### 4. `frontend-design.md` - Frontend Design Principles
- Typography guidelines (avoid Inter/Roboto, use Space Grotesk/DM Sans)
- Color and theme usage (warm peach/cream aesthetic)
- Motion and animation patterns
- Background design principles
- Component-specific guidelines
- Accessibility requirements

**Inclusion**: Manual (use `#frontend-design` in chat to activate)

## How to Use

### For Always-Included Rules
These rules (tech.md, structure.md, product.md) are automatically included in all AI interactions. No action needed.

### For Manual Rules
To use the frontend design skill, mention it in your chat:
- "Use #frontend-design to improve the landing page"
- "Apply frontend design principles to this component"
- "Following #frontend-design, create a new hero section"

## Creating New Rules

To add a new steering rule:

1. Create a new `.md` file in this directory
2. Add front-matter to control inclusion:
   ```markdown
   ---
   inclusion: manual
   ---
   ```
   Options: `always` (default), `manual`, or `fileMatch`

3. Write clear, actionable guidelines
4. Update this README with the new rule

## Design Philosophy

The frontend-design skill was created based on Anthropic's blog post about improving AI-generated frontend design. Key principles:

- **Avoid "AI slop"**: Generic Inter fonts, purple gradients, minimal animations
- **Embrace brand identity**: Warm educational aesthetic with distinctive typography
- **Purposeful motion**: Delight through micro-interactions
- **Atmospheric backgrounds**: Depth through gradients and patterns, not flat colors
- **Accessibility first**: WCAG AA compliance, keyboard navigation, focus indicators

## References

- [Anthropic: Improving Frontend Design Through Skills](https://www.anthropic.com/blog/improving-frontend-design-through-skills)
- [Anton Questions Design System](../docs/DESIGN.md)
