# Project Structure

## Root Directory Organization

```
/
├── app/                    # Next.js App Router pages
├── components/             # React components organized by feature
├── hooks/                  # Custom React hooks
├── lib/                    # Utilities, database, and external services
├── types/                  # TypeScript type definitions
├── prisma/                 # Database schema and migrations
├── public/                 # Static assets
├── docs/                   # Project documentation
└── scripts/                # Build and utility scripts
```

## App Router Structure (`/app`)

- **Route Groups**: `(main)` for main application routes
- **Feature Routes**: Each major feature has its own directory
  - `/admin` - Administrative interface
  - `/auth` - Authentication pages
  - `/dashboard` - User dashboard
  - `/login` - Login/signup pages
  - `/profile` - User profile management
  - `/questions` - Question practice interface
  - `/scoreboard` - Leaderboards and rankings
- **API Routes**: `/api` contains all backend endpoints
- **Special Files**: `layout.tsx`, `page.tsx`, `not-found.tsx`

## Components Architecture (`/components`)

### Feature-Based Organization
- `admin/` - Admin panel components
- `dashboard/` - Dashboard-specific components
- `layout/` - App-wide layout components (Header, etc.)
- `profile/` - User profile components
- `providers/` - React context providers
- `questions/` - Question practice components
- `scoreboard/` - Leaderboard components
- `shared/` - Reusable components across features
- `ui/` - shadcn/ui base components

### Component Naming Conventions
- Use PascalCase for component files: `QuestionCard.tsx`
- Export components as named exports when possible
- Co-locate component-specific types in the same file
- Use descriptive, feature-specific names

## Library Structure (`/lib`)

- `api/` - API client utilities and helpers
- `supabase/` - Supabase client configuration (client.ts, server.ts)
- `utils/` - General utility functions
- `migrations/` - Database migration utilities
- `db.ts` - Prisma client singleton
- `queries.ts` - React Query hooks and data fetching
- `utils.ts` - General utility functions (cn, etc.)

## Database Layer (`/prisma`)

- `schema.prisma` - Database schema definition
- `migrations/` - Prisma migration files
- `seed.ts` - Database seeding script

## Type Definitions (`/types`)

- `index.ts` - Main type definitions
- `api.ts` - API request/response types
- Feature-specific types co-located with components when appropriate

## Key Architectural Patterns

### File Naming
- Use kebab-case for directories: `question-practice/`
- Use PascalCase for React components: `QuestionCard.tsx`
- Use camelCase for utilities: `formatDate.ts`
- Use lowercase for API routes: `route.ts`

### Import Patterns
- Use absolute imports with `@/` alias
- Group imports: external libraries, internal modules, relative imports
- Prefer named exports over default exports for better tree-shaking

### Component Structure
```typescript
// Standard component file structure
import { ComponentProps } from 'react'
import { ExternalLibrary } from 'external-lib'
import { InternalUtility } from '@/lib/utils'
import { LocalComponent } from './LocalComponent'

interface ComponentNameProps {
  // Props definition
}

export function ComponentName({ prop }: ComponentNameProps) {
  // Component implementation
}
```

### API Route Structure
```typescript
// Standard API route structure
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  // Implementation
}

export async function POST(request: NextRequest) {
  // Implementation
}
```

## Environment Configuration

- `.env.example` - Template for environment variables
- `.env.local` - Local development environment (gitignored)
- Environment variables prefixed with `NEXT_PUBLIC_` for client-side access

## Asset Organization

- `/public/logo.png` - Application logo (PNG format)
- `/public/logo.svg` - Application logo (SVG format)
- Static assets served from `/public` directory

## Documentation Structure (`/docs`)

- `DESIGN.md` - Design system and UI guidelines
- `FEATURES.md` - Feature specifications and development roadmap
- `SCHEMA.md` - Database schema documentation
- `OPTIMISTIC_UPDATES.md` - Optimistic update patterns
- `UI-sample.webp` - UI reference images

## Development Workflow

1. **Feature Development**: Create feature branch, implement in appropriate directories
2. **Database Changes**: Update schema, create migration, update types
3. **Component Creation**: Follow feature-based organization, include proper TypeScript types
4. **API Development**: Create route handlers with proper error handling and validation
5. **Testing**: Verify functionality across different screen sizes and user states