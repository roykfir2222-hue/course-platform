import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session — MUST call getUser() to keep session alive
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // ── Dashboard protection ────────────────────────────────────────────────────
  if (pathname.startsWith('/dashboard')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Verify the user has paid — check has_access in the profiles table
    const { data: profile } = await supabase
      .from('profiles')
      .select('has_access')
      .eq('id', user.id)
      .single()

    if (!profile?.has_access) {
      // Block URL-sharing: even if someone shares a dashboard URL, they land on /payment
      return NextResponse.redirect(new URL('/payment', request.url))
    }
  }

  // ── Payment page: must be registered (have a session) ──────────────────────
  if (pathname === '/payment') {
    if (!user) {
      return NextResponse.redirect(new URL('/register', request.url))
    }
  }

  // ── Auth pages: redirect users who already have access ────────────────────
  if (pathname === '/login' || pathname === '/register') {
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('has_access')
        .eq('id', user.id)
        .single()

      if (profile?.has_access) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }

      // Registered but not paid: redirect to payment
      if (pathname === '/register') {
        return NextResponse.redirect(new URL('/payment', request.url))
      }
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public assets
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
