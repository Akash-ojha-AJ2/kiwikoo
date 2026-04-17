import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { applyApiRateLimit } from '@/lib/security/rate-limit-middleware'

/**
 * MIDDLEWARE: SESSION CHECK ONLY
 * 
 * This middleware handles:
 * 1. Session refresh (cookie management)
 * 2. Rate limiting
 * 3. Redirect to /login for protected routes (session existence only)
 * 
 * This middleware does NOT:
 * - Read profiles
 * - Check roles
 * - Check approval_status
 * - Perform any authorization logic
 * 
 * Authorization is handled at the ROUTE/LAYOUT level.
 */

const PUBLIC_PATHS = new Set([
    '/',
    '/login',
    '/register',
    '/admin/login',
    '/admin/register',
    '/forgot-password',
    '/reset-password',
    '/help',
    '/contact',
    '/about',
    '/privacy',
    '/terms',
    '/complete-profile',
])

// Public path prefixes
const PUBLIC_PREFIXES = [
    '/auth',
    '/api/auth',
    '/marketplace',
    '/signup',
]

const API_CSRF_EXEMPT_PATHS = new Set([
    '/api/billing/webhook',
])

function isPublicPath(pathname: string): boolean {
    if (PUBLIC_PATHS.has(pathname)) return true
    return PUBLIC_PREFIXES.some(prefix => pathname.startsWith(prefix))
}

function isApiPath(pathname: string): boolean {
    return pathname.startsWith('/api/')
}

function isWriteMethod(method: string): boolean {
    return method !== 'GET' && method !== 'HEAD' && method !== 'OPTIONS'
}

function getAllowedOrigins(request: NextRequest): Set<string> {
    const allowed = new Set<string>([request.nextUrl.origin])
    const configured = [
        process.env.NEXT_PUBLIC_APP_URL,
        process.env.CSRF_ALLOWED_ORIGINS,
    ]

    for (const value of configured) {
        if (!value) continue
        for (const item of value.split(',')) {
            const candidate = item.trim()
            if (!candidate) continue
            try {
                allowed.add(new URL(candidate).origin)
            } catch {
                // Ignore invalid origin entries.
            }
        }
    }

    return allowed
}

function getRequestOrigin(request: NextRequest): string | null {
    const originHeader = request.headers.get('origin')
    if (originHeader) {
        try {
            return new URL(originHeader).origin
        } catch {
            return null
        }
    }

    const refererHeader = request.headers.get('referer')
    if (refererHeader) {
        try {
            return new URL(refererHeader).origin
        } catch {
            return null
        }
    }

    return null
}

function validateApiOrigin(request: NextRequest): NextResponse | null {
    const pathname = request.nextUrl.pathname
    if (!isApiPath(pathname) || !isWriteMethod(request.method) || API_CSRF_EXEMPT_PATHS.has(pathname)) {
        return null
    }

    const requestOrigin = getRequestOrigin(request)
    const allowedOrigins = getAllowedOrigins(request)
    if (requestOrigin && allowedOrigins.has(requestOrigin)) {
        return null
    }

    const response = NextResponse.json({ error: 'Invalid request origin' }, { status: 403 })
    response.headers.set('Cache-Control', 'no-store')
    return response
}

function applySecurityHeaders(response: NextResponse) {
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
    return response
}

export async function updateSession(request: NextRequest) {
    const pathname = request.nextUrl.pathname
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-pathname', pathname)

    const createNextResponse = () =>
        NextResponse.next({
            request: {
                headers: requestHeaders,
            },
        })

    let supabaseResponse = createNextResponse()

    // Check env vars
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        console.warn('Supabase env vars missing, skipping session update')
        return supabaseResponse
    }

    // Create Supabase client with cookie handling
    const supabase = createServerClient(
        (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim(),
        (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim(),
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    )
                    supabaseResponse = createNextResponse()
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // Get user session (handles token refresh automatically)
    let user = null
    try {
        const { data: { user: authUser }, error } = await supabase.auth.getUser()

        if (error) {
            // Handle refresh token errors gracefully
            if (error.message?.includes('refresh_token') || error.message?.includes('Refresh Token')) {
                // Invalid/expired refresh token - clear the local session to stop infinite retry loops
                await supabase.auth.signOut({ scope: 'local' })
            } else if (!error.message?.includes('Auth session missing')) {
                // Log non-trivial errors
                console.warn('Auth error:', error.message)
            }
        } else {
            user = authUser
        }
    } catch (error) {
        console.warn('⚠️  Auth check failed:', error instanceof Error ? error.message : String(error))
    }

    // Rate limiting (after session check for user-based limiting)
    const rateLimited = await applyApiRateLimit(request, user?.id ?? null)
    if (rateLimited) {
        return applySecurityHeaders(rateLimited)
    }

    if (user) {
        const invalidOrigin = validateApiOrigin(request)
        if (invalidOrigin) {
            return applySecurityHeaders(invalidOrigin)
        }
    }

    // API routes should return their own JSON auth errors instead of HTML login redirects.
    if (isApiPath(pathname)) {
        return applySecurityHeaders(supabaseResponse)
    }

    // SESSION CHECK ONLY: Redirect to /login if not authenticated and accessing protected route
    if (!user && !isPublicPath(pathname)) {
        const url = request.nextUrl.clone()
        url.pathname = pathname.startsWith('/admin') ? '/admin/login' : '/login'
        url.searchParams.set('redirect', pathname)
        const redirectResponse = NextResponse.redirect(url)

        // Preserve cookies!
        supabaseResponse.cookies.getAll().forEach(cookie => {
            redirectResponse.cookies.set(cookie.name, cookie.value, cookie as any)
        })
        return applySecurityHeaders(redirectResponse)
    }

    // Authenticated users on root -> redirect to the public marketplace
    // so signed-in users do not bounce through dashboard/pending routing
    // when they open the main domain.
    return applySecurityHeaders(supabaseResponse)
}

