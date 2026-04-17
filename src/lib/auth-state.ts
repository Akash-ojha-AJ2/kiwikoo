/**
 * PURE STATE RESOLVER
 * 
 * This module provides identity state ONLY.
 * It does NOT redirect, infer routes, or enforce permissions.
 * 
 * Database Truth (Supabase):
 * - auth.users -> authentication ONLY
 * - profiles -> role, onboarding, approval (SOURCE OF TRUTH)
 * 
 * Usage:
 *   const auth = await getIdentity()
 *   if (!auth.authenticated) redirect('/login')
 *   if (auth.identity.role !== 'brand') redirect('/dashboard')
 */

import { createClient, createServiceClient } from '@/lib/auth'

export type UserRole = 'admin' | 'brand' | 'influencer'
export type ApprovalStatus = 'none' | 'pending' | 'approved' | 'rejected'

export interface UserIdentity {
  id: string
  email: string
  role: UserRole
  onboarding_completed: boolean
  approval_status: ApprovalStatus
}

export type AuthResult =
  | { authenticated: false }
  | { authenticated: true; identity: UserIdentity | null }

/**
 * Fetch profile from Supabase profiles table.
 * Returns null if not found.
 */
async function fetchProfile(supabase: Awaited<ReturnType<typeof createClient>>, userId: string): Promise<UserIdentity | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, role, onboarding_completed, approval_status')
    .eq('id', userId)
    .single()

  if (error || !data) {
    console.error('fetchProfile error:', error?.message || 'No profile found')
    return null
  }

  // Normalize to lowercase (defensive, DB should already be lowercase)
  let role = ((data.role || 'influencer') as string).toLowerCase() as UserRole
  const approval_status = ((data.approval_status || 'none') as string).toLowerCase() as ApprovalStatus

  // Legacy admin accounts may still be marked in admin_users even if profiles.role was not backfilled.
  if (role !== 'admin') {
    try {
      const service = createServiceClient()
      const { data: adminRow, error: adminLookupError } = await service
        .from('admin_users')
        .select('user_id')
        .eq('user_id', userId)
        .maybeSingle()

      if (!adminLookupError && adminRow) {
        role = 'admin'
      }
    } catch (adminCheckError) {
      console.warn('fetchProfile admin_users fallback skipped:', adminCheckError)
    }
  }

  return {
    id: data.id,
    email: data.email || '',
    role,
    onboarding_completed: Boolean(data.onboarding_completed),
    approval_status,
  }
}

/**
 * SINGLE SOURCE: Get user identity.
 * 
 * Returns authenticated: false if not logged in.
 * Returns authenticated: true with identity if logged in.
 * 
 * This function does NOT redirect or do any authorization logic.
 * Authorization is the caller's responsibility.
 */
export async function getIdentity(): Promise<AuthResult> {
  try {
    const supabase = await createClient()

    // SECURITY: Use getUser() NOT getSession()
    // getSession() reads from cookies (can be tampered)
    // getUser() validates with Supabase Auth server (secure)
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      return { authenticated: false }
    }

    const identity = await fetchProfile(supabase, user.id)

    if (!identity) {
      // User exists in auth but no profile -> edge case
      // E.g. Google Sign in without ?role
      console.warn('getIdentity: User has auth but no profile:', user.id)
      return { authenticated: true, identity: null }
    }

    return { authenticated: true, identity }
  } catch (error) {
    console.error('getIdentity error:', error)
    return { authenticated: false }
  }
}

/** @deprecated Use getIdentity() instead */
export async function getAuthState() {
  const result = await getIdentity()

  if (!result.authenticated || !result.identity) {
    return { type: 'unauthenticated' as const }
  }

  const { identity } = result

  // Map to legacy state types for backward compatibility
  if (identity.role === 'admin') {
    return { type: 'admin' as const, profile: identity }
  }

  if (identity.role === 'brand') {
    if (!identity.onboarding_completed) {
      return { type: 'brand_draft' as const, profile: identity }
    }
    return { type: 'brand_active' as const, profile: identity }
  }

  if (identity.role === 'influencer') {
    if (!identity.onboarding_completed) {
      return { type: 'influencer_draft' as const, profile: identity }
    }
    if (identity.approval_status !== 'approved') {
      return { type: 'influencer_pending' as const, profile: identity }
    }
    return { type: 'influencer_approved' as const, profile: identity }
  }

  return { type: 'unauthenticated' as const }
}

/** @deprecated Authorization should be done at route level */
export function getRedirectPath(state: { type: string }, currentPath: string): string | null {
    switch (state.type) {
    case 'unauthenticated':
      return '/login'
    case 'influencer_draft':
      return currentPath === '/onboarding/influencer' ? null : '/onboarding/influencer'
    case 'influencer_pending':
      if (currentPath === '/influencer/pending' || currentPath.startsWith('/marketplace')) return null
      return '/influencer/pending'
    case 'brand_draft':
      return currentPath === '/onboarding/brand' ? null : '/onboarding/brand'
    default:
      return null
  }
}

/** @deprecated Use route-level checks */
export function canAccessRoute(state: { type: string }, route: string): boolean {
  return getRedirectPath(state, route) === null
}

