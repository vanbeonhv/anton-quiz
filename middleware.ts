import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Define public routes that don't require authentication
const publicRoutes = [
  '/',
  '/landing',
  '/questions',
  '/scoreboard',
  '/login',
  '/auth'
]

// Define public API routes that don't require authentication
const publicApiRoutes = [
  '/api/questions',
  '/api/scoreboard',
  '/api/tags',
  '/api/metrics',
  '/api/metrics-debug',
  '/api/daily-question'
]

// Define protected API route patterns that require authentication
const protectedApiPatterns = [
  /^\/api\/questions\/[^\/]+\/attempt$/,     // /api/questions/[id]/attempt
  /^\/api\/questions\/next-unanswered$/,     // /api/questions/next-unanswered
  /^\/api\/daily-question\/redirect$/,       // /api/daily-question/redirect (requires auth)
  /^\/api\/user\//,                          // /api/user/* (all user endpoints)
  /^\/api\/admin\//,                         // /api/admin/* (all admin endpoints)
  /^\/api\/tags\/[^\/]+\/questions$/,        // /api/tags/[id]/questions
]

// Check if a pathname is a public route
function isPublicRoute(pathname: string): boolean {
  // First check if pathname matches a protected route pattern
  if (protectedApiPatterns.some(pattern => pattern.test(pathname))) {
    return false
  }
  
  // Check exact matches for public routes
  if (publicRoutes.includes(pathname)) {
    return true
  }
  
  // Check if pathname starts with any public route (for dynamic routes)
  if (pathname.startsWith('/questions/')) {
    return true
  }
  
  // Check if pathname starts with auth routes
  if (pathname.startsWith('/auth/')) {
    return true
  }
  
  // Check public API routes
  if (publicApiRoutes.some(route => pathname.startsWith(route))) {
    return true
  }
  
  return false
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Check if this is a public route
  if (isPublicRoute(pathname)) {
    return NextResponse.next()
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // For protected routes, redirect to login if no user
  if (!user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
  // creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object instead of the supabaseResponse object

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}