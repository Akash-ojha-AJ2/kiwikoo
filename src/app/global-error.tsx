'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, Home, RefreshCw } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to console
    console.error('Global application error:', error)
  }, [error])

  return (
    <html lang="en">
      <body className="antialiased bg-cream text-charcoal">
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="text-center max-w-md w-full">
            <AlertTriangle className="w-16 h-16 text-peach mx-auto mb-4" />
            <h1 className="text-3xl font-serif font-bold text-charcoal mb-4">
              Application Error
            </h1>
            <p className="text-charcoal/70 mb-8">
              A critical error occurred. Please refresh the page or contact support if the problem persists.
            </p>
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
      </body>
    </html>
  )
}
