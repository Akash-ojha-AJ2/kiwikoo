/**
 * ADMIN PROTECTED LAYOUT
 * 
 * Route-level authorization for /admin/(protected)/* routes.
 * Uses getIdentity() which reads from profiles (SOURCE OF TRUTH).
 * 
 * Authorization Rules:
 * - Must be authenticated
 * - Must have role = 'admin'
 * 
 * Admins are identified ONLY by: profiles.role === 'admin'
 * DO NOT check admin_users table (legacy)
 */
import { redirect } from 'next/navigation'
import { getIdentity } from '@/lib/auth-state'

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const auth = await getIdentity()

  // Must be authenticated
  if (!auth.authenticated) {
    redirect('/admin/login')
  }

  if (!auth.identity) {
    redirect('/admin/login?error=not_admin')
  }

  const { identity } = auth

  // Must be admin
  if (identity.role !== 'admin') {
    redirect('/admin/login?error=not_admin')
  }

  return <>{children}</>
}
