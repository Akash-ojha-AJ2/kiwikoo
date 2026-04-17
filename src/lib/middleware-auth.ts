import { NextRequest, NextResponse } from 'next/server'
import { getIdentity, type UserIdentity } from '@/lib/auth-state'

export interface AuthContext {
  authUser: { id: string; email: string }
  dbUser: UserIdentity
}

/**
 * Get authentication context for API routes.
 * Returns null if unauthorized, or AuthContext if authorized.
 */
export async function getAuthContext(_request: NextRequest): Promise<AuthContext | null> {
  try {
    const auth = await getIdentity()

    if (!auth.authenticated || !auth.identity) {
      return null
    }

    return {
      authUser: {
        id: auth.identity.id,
        email: auth.identity.email,
      },
      dbUser: auth.identity,
    }
  } catch (error) {
    console.error('Auth middleware error:', error)
    return null
  }
}

/**
 * Middleware helper to require authentication
 */
export function requireAuth(handler: (request: NextRequest, context: AuthContext) => Promise<NextResponse>) {
  return async (request: NextRequest) => {
    const context = await getAuthContext(request)
    if (!context) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return handler(request, context)
  }
}

/**
 * Middleware helper to require specific role
 */
export function requireRole(
  role: 'influencer' | 'brand' | 'admin',
  handler: (request: NextRequest, context: AuthContext) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    const context = await getAuthContext(request)
    if (!context) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (context.dbUser.role !== role) {
      return NextResponse.json({ error: `Unauthorized - ${role} access required` }, { status: 403 })
    }
    return handler(request, context)
  }
}
