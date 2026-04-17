import { Suspense } from 'react'
import ResetPasswordClient from './reset-password-client'

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-cream">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-peach border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-charcoal/60">Loading...</p>
          </div>
        </div>
      }
    >
      <ResetPasswordClient />
    </Suspense>
  )
}

