# Quiz App - Features & Development Roadmap

## Development Phases

Build the app in **7 checkpoints**, each taking 30-90 minutes. Test thoroughly after each checkpoint before moving to the next.

---

## 📦 Checkpoint 1: Project Foundation (30 minutes)

### Tasks
- [ ] Initialize Next.js 14+ with App Router
- [ ] Setup TypeScript (strict mode)
- [ ] Install and configure Tailwind CSS
- [ ] Install shadcn/ui components
- [ ] Setup folder structure
- [ ] Create basic layout component
- [ ] Configure environment variables

### Commands
```bash
# Create Next.js project
npx create-next-app@latest quiz-app --typescript --tailwind --app

# Install shadcn/ui
npx shadcn-ui@latest init

# Install components
npx shadcn-ui@latest add button card input label select table badge

# Install other dependencies
pnpm install @tanstack/react-query
pnpm install @prisma/client
pnpm install prisma --save-dev
pnpm install lucide-react
```

### File Structure
```
/quiz-app
  /app
    /(main)/
      page.tsx              # Dashboard
    /quiz/
      [id]/
        page.tsx            # Quiz page
    /scoreboard/
      page.tsx              # Scoreboard
    /admin/
      page.tsx              # Admin page
    /login/
      page.tsx              # Login page
    /api/                   # API routes (add later)
    layout.tsx              # Root layout
    globals.css             # Global styles
  /components
    /ui/                    # shadcn components
    /quiz/                  # Quiz components (add later)
    /shared/                # Shared components (add later)
    /layout/
      Header.tsx            # App header
  /lib
    /supabase/
      client.ts             # Browser client (add later)
      server.ts             # Server client (add later)
    /utils/
      quiz.ts               # Quiz utilities (add later)
  /types
    index.ts                # TypeScript types
  /prisma
    schema.prisma           # Database schema (add later)
  .cursorrules              # Cursor AI instructions
  DESIGN.md                 # Design system
  SCHEMA.md                 # Database schema docs
  FEATURES.md               # This file
  tailwind.config.ts        # Tailwind config
```

### Test Criteria
- [ ] `pnpm run dev` starts without errors
- [ ] App displays at http://localhost:4000
- [ ] Tailwind CSS working
- [ ] No TypeScript errors
- [ ] Header component renders

### Cursor Prompt
```
Create a Next.js 14 project with App Router and TypeScript.

Setup:
1. Tailwind CSS with custom theme colors from DESIGN.md
2. Install shadcn/ui: button, card, input, label, select, table, badge
3. Install @tanstack/react-query, lucide-react
4. Create folder structure as defined in .cursorrules

Create a basic Header component in /components/layout/Header.tsx:
- Logo text "QuizApp" on the left
- Navigation placeholder on the right
- Use design system colors from DESIGN.md
- Responsive (mobile menu for later)

Update app/layout.tsx to use the Header.
```

---

## 🗄️ Checkpoint 2: Database Setup (30 minutes)

### Tasks
- [ ] Setup Supabase project
- [ ] Install and configure Prisma
- [ ] Create database schema
- [ ] Run migrations
- [ ] Create seed file
- [ ] Seed sample data

### Supabase Setup
1. Go to https://supabase.com
2. Create new project: `quiz-app`
3. Region: Southeast Asia
4. Copy connection string

### Prisma Setup
```bash
# Initialize Prisma
npx prisma init

# Update DATABASE_URL in .env.local
# Run migration
npx prisma migrate dev --name init

# Generate client
npx prisma generate

# Seed database
npx prisma db seed
```

### Test Criteria
- [ ] Prisma migration successful
- [ ] Can open Prisma Studio: `npx prisma studio`
- [ ] See 2 quizzes with questions in database
- [ ] No database connection errors

### Cursor Prompt
```
Setup Prisma with PostgreSQL for the quiz app.

1. Create prisma/schema.prisma with the schema from SCHEMA.md

2. Create lib/db.ts with Prisma client singleton:
```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

3. Create prisma/seed.ts with seed data from SCHEMA.md

4. Add to package.json:
```json
"prisma": {
  "seed": "tsx prisma/seed.ts"
}
```

After creation, I'll run:
- npx prisma migrate dev --name init
- npx prisma db seed
```

---

## 🔐 Checkpoint 3: Authentication Setup (45 minutes)

### Tasks
- [ ] Setup Supabase Auth providers
- [ ] Create Supabase client utilities
- [ ] Create login page
- [ ] Create auth callback route
- [ ] Setup middleware for protected routes
- [ ] Create Header with user info & logout

### Supabase Auth Setup
```
Dashboard > Authentication > Providers

1. Email Provider: Enable
2. GitHub Provider:
   - Create OAuth App at github.com/settings/developers
   - Copy Client ID & Secret
   - Paste in Supabase
```

### Install Dependencies
```bash
pnpm install @supabase/supabase-js @supabase/ssr
```

### Test Criteria
- [ ] Can sign up with email/password
- [ ] Receive verification email
- [ ] Can sign in after verification
- [ ] GitHub OAuth works
- [ ] Can access protected pages when logged in
- [ ] Redirected to login when not logged in
- [ ] Can logout successfully

### Cursor Prompt
```
Setup Supabase Auth for the quiz app.

1. Create lib/supabase/client.ts (browser client)
2. Create lib/supabase/server.ts (server client) 
   Use patterns from Supabase SSR docs

3. Create app/login/page.tsx:
   - Email/password form
   - GitHub OAuth button
   - Toggle between sign in/sign up
   - Use design system from DESIGN.md
   - Use shadcn/ui components

4. Create app/auth/callback/route.ts for OAuth callback

5. Create middleware.ts:
   - Protect all routes except /login
   - Redirect to /login if not authenticated
   - Redirect to / if authenticated user visits /login

6. Update components/layout/Header.tsx:
   - Show user email
   - Add logout button
   - Use Supabase auth state

Use environment variables:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
```

---

## 🎨 Checkpoint 4: Core Components (60 minutes)

### Tasks
- [ ] Create QuizCard component
- [ ] Create QuestionCard component
- [ ] Create AnswerOption component
- [ ] Create ProgressBar component
- [ ] Create LeaderboardTable component
- [ ] Create EmptyState component
- [ ] Create LoadingState component

### Test Criteria
- [ ] All components render correctly
- [ ] Responsive on mobile
- [ ] Match design system
- [ ] TypeScript types correct
- [ ] No console errors

### Cursor Prompt
```
Create quiz components in /components/quiz/ following DESIGN.md.

1. QuizCard.tsx:
```typescript
interface QuizCardProps {
  id: string
  title: string
  description: string | null
  type: 'NORMAL' | 'DAILY'
  questionCount: number
  attemptCount: number
  onClick: () => void
}
```
- Card design from DESIGN.md
- Show daily badge if type is DAILY
- Show question count and attempt count
- Hover effect

2. QuestionCard.tsx:
```typescript
interface QuestionCardProps {
  question: string
  currentIndex: number
  totalQuestions: number
}
```
- Display question number and text
- Progress indicator

3. AnswerOption.tsx:
```typescript
interface AnswerOptionProps {
  label: 'A' | 'B' | 'C' | 'D'
  text: string
  selected: boolean
  showResult?: boolean
  isCorrect?: boolean
  hasExplanation?: boolean
  onClick: () => void
}
```
- Match design from reference image
- States: default, selected, correct, incorrect
- Use design system colors
- Smooth transitions

4. ProgressBar.tsx:
```typescript
interface ProgressBarProps {
  current: number
  total: number
}
```
- Show "X/Y" text
- Filled bar with percentage
- Use primary green color

5. LeaderboardTable.tsx:
```typescript
interface LeaderboardEntry {
  rank: number
  userEmail: string
  quizTitle: string
  score: number
  totalQuestions: number
  completedAt: Date
}

interface LeaderboardTableProps {
  entries: LeaderboardEntry[]
}
```
- Use shadcn/ui Table
- Show rank, user, quiz, score, date
- Highlight top 3 with badges
- Responsive (stack on mobile)

6. Create components/shared/EmptyState.tsx and LoadingState.tsx
```

---

## 📱 Checkpoint 5: Dashboard Page (60 minutes)

### Tasks
- [ ] Create API route for quizzes
- [ ] Create React Query hook
- [ ] Build dashboard page
- [ ] Show available quizzes
- [ ] Show recent scores
- [ ] Handle loading/error states
- [ ] Navigate to quiz page

### Test Criteria
- [ ] Dashboard loads quizzes from database
- [ ] Shows loading skeleton while fetching
- [ ] Shows error state if fetch fails
- [ ] Shows empty state if no quizzes
- [ ] Click quiz navigates to quiz page
- [ ] Responsive layout
- [ ] Daily badge shows for daily quizzes

### Cursor Prompt
```
Build the dashboard page.

1. Create app/api/quizzes/route.ts:
   - GET handler
   - Fetch quizzes with question count and attempt count
   - Return sorted by createdAt DESC
   - Include error handling

2. Create lib/queries.ts with React Query hook:
```typescript
export function useQuizzes() {
  return useQuery({
    queryKey: ['quizzes'],
    queryFn: async () => {
      const res = await fetch('/api/quizzes')
      if (!res.ok) throw new Error('Failed to fetch quizzes')
      return res.json()
    }
  })
}
```

3. Update app/(main)/page.tsx:
   - Use useQuizzes hook
   - Show LoadingState while loading
   - Show error message if error
   - Show EmptyState if no quizzes
   - Render grid of QuizCard components (3 cols desktop, 1 col mobile)
   - Click navigates to /quiz/[id]
   - Below quizzes, show "Recent Scores" section with LeaderboardTable (limit 5)

4. Create app/api/scoreboard/route.ts:
   - GET handler with optional ?limit query param
   - Fetch recent quiz attempts with user and quiz info
   - Sort by completedAt DESC

5. Create React Query Provider in app/layout.tsx
```

---

## 🎮 Checkpoint 6: Quiz Page (90 minutes)

### Tasks
- [ ] Create API route for quiz with questions
- [ ] Create API route for checking daily eligibility
- [ ] Create API route for submitting quiz
- [ ] Build quiz taking interface
- [ ] Handle quiz navigation (next/previous)
- [ ] Submit and show results
- [ ] Handle daily quiz restrictions

### Test Criteria
- [ ] Can load quiz with all questions
- [ ] Can select answers (radio behavior)
- [ ] Can navigate between questions
- [ ] Progress bar updates
- [ ] Can submit quiz
- [ ] Shows correct/incorrect answers after submit
- [ ] Shows explanations if available
- [ ] Shows final score
- [ ] Daily quiz shows "already completed" if taken today
- [ ] Countdown to next daily quiz reset

### Cursor Prompt
```
Build the quiz taking page.

1. Create app/api/quiz/[id]/route.ts:
   - GET: Fetch quiz with ordered questions
   - Don't include correctAnswer in response (security)

2. Create app/api/quiz/[id]/check-daily/route.ts:
   - GET: Check if user can take daily quiz
   - Use canTakeDailyQuiz function from SCHEMA.md
   - Return: { canTake: boolean, nextResetTime?: Date }

3. Create app/api/quiz/[id]/submit/route.ts:
   - POST: Submit quiz answers
   - Validate user is authenticated
   - Check daily quiz eligibility if type is DAILY
   - Calculate score and save attempt using submitQuizAttempt from SCHEMA.md
   - Return attempt with answers and question details

4. Create app/quiz/[id]/page.tsx:
   - Check daily eligibility on load
   - If can't take: show message with countdown to reset
   - Quiz state management:
     ```typescript
     const [currentIndex, setCurrentIndex] = useState(0)
     const [answers, setAnswers] = useState<Record<string, OptionKey>>({})
     const [submitted, setSubmitted] = useState(false)
     const [results, setResults] = useState(null)
     ```
   - Show ProgressBar
   - Show QuestionCard
   - Show 4 AnswerOption components
   - Navigation buttons (Previous/Next)
   - Submit button on last question
   - After submit: show all questions with correct/incorrect highlighting
   - Show explanations
   - Show final score
   - Button to return to dashboard

Use components created in Checkpoint 4.
```

---

## 🏆 Checkpoint 7: Scoreboard & Admin (90 minutes)

### Tasks
- [ ] Build scoreboard page with filters
- [ ] Create admin check utility
- [ ] Build admin page
- [ ] Create quiz/question CRUD operations
- [ ] Add delete confirmations
- [ ] Polish and bug fixes

### Test Criteria
- [ ] Scoreboard shows all attempts
- [ ] Can filter by all-time vs this week
- [ ] Sorted by score descending
- [ ] Admin page only accessible to admin emails
- [ ] Can create new quiz
- [ ] Can add questions to quiz
- [ ] Can edit questions
- [ ] Can delete quiz/questions
- [ ] Confirmation dialogs work

### Cursor Prompt
```
Build scoreboard and admin pages.

## SCOREBOARD

1. Update app/api/scoreboard/route.ts:
   - Add ?filter=all-time|this-week query param
   - Use getAllTimeLeaderboard and getWeeklyLeaderboard from SCHEMA.md

2. Create app/scoreboard/page.tsx:
   - Filter toggle buttons (All Time / This Week)
   - Use LeaderboardTable component
   - Show rank, user, quiz, score, completion time
   - Highlight top 3 with special badges
   - Loading and empty states

## ADMIN

3. Create lib/utils/admin.ts:
```typescript
export function isAdmin(email: string): boolean {
  const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',').map(e => e.trim()) || []
  return adminEmails.includes(email)
}
```

4. Create app/admin/page.tsx:
   - Check if user is admin (redirect if not)
   - Tabs: "Quizzes" and "Create New"
   - Quizzes tab:
     * List all quizzes
     * Edit button (expand to show/edit questions)
     * Delete button (with confirmation)
   - Create New tab:
     * Form for quiz title, description, type
     * Dynamic question fields (add/remove)
     * Each question: text, 4 options, correct answer, explanation
     * Submit to create quiz with all questions

5. Create admin API routes:
   - POST /api/admin/quiz - Create quiz
   - PATCH /api/admin/quiz/[id] - Update quiz
   - DELETE /api/admin/quiz/[id] - Delete quiz
   - POST /api/admin/question - Create question
   - PATCH /api/admin/question/[id] - Update question
   - DELETE /api/admin/question/[id] - Delete question
   
   All routes must check isAdmin() before processing.

6. Use shadcn/ui Dialog for delete confirmations
```

---

## 🚀 Final Polish (Optional)

### Nice-to-Have Features
- [ ] Add quiz categories/tags
- [ ] User profile page
- [ ] Quiz search/filter
- [ ] Dark mode toggle
- [ ] Share quiz results
- [ ] Quiz timer (optional per quiz)
- [ ] Achievements/badges
- [ ] Quiz analytics for admin

### Performance Optimizations
- [ ] Add React Query cache configuration
- [ ] Optimize images
- [ ] Add loading.tsx for routes
- [ ] Implement error boundaries
- [ ] Add meta tags for SEO

### Testing
- [ ] Test all user flows end-to-end
- [ ] Test on different screen sizes
- [ ] Test error scenarios
- [ ] Test daily quiz timing edge cases
- [ ] Check console for errors/warnings

---

## 📝 Environment Variables Checklist

```bash
# .env.local (DO NOT COMMIT)

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
DATABASE_URL=postgresql://postgres:...

# Admin
NEXT_PUBLIC_ADMIN_EMAILS=admin@example.com,admin2@example.com

# GitHub OAuth (from GitHub Developer Settings)
GITHUB_CLIENT_ID=xxxxx
GITHUB_CLIENT_SECRET=xxxxx
```

---

## 🎯 Definition of Done

A checkpoint is complete when:
1. ✅ All tasks in the checkpoint are done
2. ✅ Code runs without errors
3. ✅ All test criteria pass
4. ✅ No TypeScript errors
5. ✅ No console warnings