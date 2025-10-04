import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const error_description = searchParams.get('error_description')
  const next = searchParams.get('next') ?? '/dashboard'

  console.log('Auth callback:', { code: !!code, error, error_description })

  // If there's an error from the OAuth provider
  if (error) {
    console.error('OAuth error:', error, error_description)
    return NextResponse.redirect(`${origin}/login?message=${encodeURIComponent(error_description || error)}`)
  }

  if (code) {
    try {
      const supabase = await createClient()
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
      
      console.log('Exchange result:', { user: !!data.user, error: exchangeError })
      
      if (!exchangeError && data.user) {
        return NextResponse.redirect(`${origin}${next}`)
      }
      
      if (exchangeError) {
        console.error('Exchange error:', exchangeError)
        return NextResponse.redirect(`${origin}/login?message=${encodeURIComponent(exchangeError.message)}`)
      }
    } catch (err) {
      console.error('Callback error:', err)
      return NextResponse.redirect(`${origin}/login?message=Authentication failed`)
    }
  }

  // No code provided
  return NextResponse.redirect(`${origin}/login?message=No authorization code provided`)
}