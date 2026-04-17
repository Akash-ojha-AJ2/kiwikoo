'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Admin error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream px-4">
      <div className="text-center max-w-md w-full">
        <AlertTriangle className="w-16 h-16 text-peach mx-auto mb-4" />
        <h1 className="text-2xl font-serif font-bold text-charcoal mb-2">
          Admin error
        </h1>
        <p className="text-charcoal/70 mb-4">
          The admin page could not load. In production, check that these env vars are set in Vercel:
        </p>
        <ul className="text-sm text-charcoal/70 text-left mb-6 list-disc list-inside">
          <li>SUPABASE_SERVICE_ROLE_KEY</li>
          <li>NEXT_PUBLIC_SUPABASE_URL</li>
          <li>NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
        </ul>
        <div className="flex gap-4 justify-center flex-wrap">
          <button type="button"
            onClick={reset}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-charcoal text-cream rounded-full hover:bg-charcoal/90 transition-colors text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
          <Link
            href="/admin/login"
            className="inline-flex items-center gap-2 px-5 py-2.5 border border-charcoal/20 text-charcoal rounded-full hover:bg-charcoal/5 transition-colors text-sm"
          >
            Admin login
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 border border-charcoal/20 text-charcoal rounded-full hover:bg-charcoal/5 transition-colors text-sm"
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  )
}
