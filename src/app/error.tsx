'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, Home, RefreshCw } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Application error:', error)
    }
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream px-4">
      <div className="text-center max-w-md w-full">
        <AlertTriangle className="w-16 h-16 text-peach mx-auto mb-4" />
        <h1 className="text-3xl font-serif font-bold text-charcoal mb-4">
          Something went wrong
        </h1>
        <p className="text-charcoal/70 mb-8">
          We encountered an unexpected error. Please try again or return to the homepage.
        </p>
        {process.env.NODE_ENV === 'development' && error.message && (
          <div className="mb-6 p-4 bg-charcoal/5 rounded-lg text-left">
            <p className="text-sm font-mono text-charcoal/60 break-all">
              {error.message}
            </p>
          </div>
        )}
        <div className="flex gap-4 justify-center">
          <button type="button"
            onClick={reset}
            className="inline-flex items-center gap-2 px-6 py-3 bg-charcoal text-cream rounded-full hover:bg-charcoal/90 transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
            Try Again
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 border border-charcoal/20 text-charcoal rounded-full hover:bg-charcoal/5 transition-colors"
          >
            <Home className="w-5 h-5" />
            Go Home
          </Link>
        </div>
      </div>
    </div>
  )
}
