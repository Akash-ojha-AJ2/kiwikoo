import { createClient } from '@/lib/auth'

/**
 * Generate a unique short link code (6-8 alphanumeric characters)
 * Uses Supabase to check for collisions.
 */
export async function generateLinkCode(length: number = 7): Promise<string> {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  const maxRetries = 10

  const supabase = await createClient()

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    // Generate random code
    let code = ''
    for (let i = 0; i < length; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }

    // Check if code already exists in tracked_links table
    const { data: existing } = await supabase
      .from('tracked_links')
      .select('id')
      .eq('link_code', code)
      .maybeSingle()

    if (!existing) {
      return code
    }
  }

  // If all retries failed, try with longer code
  return generateLinkCode(length + 1)
}
