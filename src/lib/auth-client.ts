'use client'

import { createBrowserClient } from '@supabase/ssr'

type BrowserSupabaseClient = ReturnType<typeof createBrowserClient>

function createUnavailableClient(): BrowserSupabaseClient {
  return new Proxy(
    {},
    {
      get() {
        throw new Error('Supabase client is unavailable during server rendering.')
      },
    }
  ) as BrowserSupabaseClient
}

/**
 * Creates a Supabase client for use in client components.
 * This should only be used in 'use client' components.
 */
export function createClient() {
  const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim()
  const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim()

  if (!supabaseUrl || !supabaseAnonKey) {
    if (typeof window === 'undefined') {
      return createUnavailableClient()
    }

    throw new Error('Missing Supabase environment variables')
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
