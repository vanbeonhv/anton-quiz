# Technology Stack

## Framework & Runtime

- **Next.js 14.2.33** with App Router
- **React 18** with TypeScript (strict mode enabled)
- **Node.js** runtime environment
- Development server runs on port **4000**

## Database & ORM

- **PostgreSQL** via Supabase
- **Prisma 6.16.3** as ORM with client generation
- Database migrations managed through Prisma
- Seed data support with `tsx` runner

## Authentication

- **Supabase Auth** with SSR support
- Email/password and OAuth providers (GitHub)
- Server-side and client-side auth utilities
- Protected routes via middleware

## Styling & UI

- **Tailwind CSS 3.4.1** with custom design system
- **shadcn/ui** component library (Radix UI primitives)
- Custom color palette: primary-green, primary-orange, bg-peach, bg-cream
- **Lucide React** for icons
- Responsive design with mobile-first approach

## State Management & Data Fetching

- **TanStack React Query 5.90.2** for server state
- **Supabase client** for real-time data
- Optimistic updates for better UX

## Development Tools

- **TypeScript 5** with strict configuration
- **ESLint** with Next.js config (build errors ignored)
- **PostCSS** for CSS processing
- **pnpm** as package manager

## Common Commands

### Development
```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Lint code
pnpm lint
```

### Database Operations
```bash
# Generate Prisma client (runs on postinstall)
npx prisma generate

# Create and run migration
npx prisma migrate dev --name <migration_name>

# Seed database
npx prisma db seed

# Open database GUI
npx prisma studio

# Reset database (development only)
npx prisma migrate reset
```

### Project Setup
```bash
# Install dependencies
pnpm install

# Setup environment variables
cp .env.example .env.local
# Edit .env.local with your values

# Initialize database
npx prisma migrate dev --name init
npx prisma db seed
```

## Configuration Notes

- React StrictMode disabled to prevent double API calls
- ESLint errors ignored during builds for faster deployment
- Image optimization configured for GitHub avatars
- Path aliases: `@/*` maps to project root
- Custom Tailwind theme extends default with app-specific colors