/**
 * AUTHORITATIVE ROUTING RULES
 * 
 * This enforces routing based on auth state.
 * Used in layouts and route handlers.
 * 
 * NOTE: These are DEPRECATED. Route-level authorization should be done
 * directly in layouts using getIdentity().
 */

import { redirect } from 'next/navigation'
import { getIdentity, type AuthResult } from './auth-state'

/**
 * @deprecated Use getIdentity() directly in layouts
 * Enforce routing rules for a route
 */
export async function enforceRouting(currentPath: string): Promise<void> {
  const auth = await getIdentity()

  if (!auth.authenticated) {
    redirect('/login')
  }

  // Route-level authorization should be in the layout, not here
}

/**
 * @deprecated Use getIdentity() directly
 * Require authentication - returns auth result or redirects to login
 */
export async function requireAuth(): Promise<Extract<AuthResult, { authenticated: true }> & { identity: NonNullable<Extract<AuthResult, { authenticated: true }>['identity']> }> {
  const auth = await getIdentity()
  if (!auth.authenticated) {
    redirect('/login')
  }
  if (!auth.identity) {
    // If they have a session but NO profile, they must complete onboarding
    redirect('/complete-profile')
  }
  return auth as Extract<AuthResult, { authenticated: true }> & { identity: NonNullable<Extract<AuthResult, { authenticated: true }>['identity']> }
}
