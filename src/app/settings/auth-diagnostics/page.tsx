'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowLeft, Loader2, RefreshCcw } from 'lucide-react'
import { toast } from '@/lib/simple-sonner'

type DiagnosticsResponse = {
  actor?: {
    email: string | null
    role: string | null
  }
  mail?: {
    smtp: {
      configured: boolean
      host: string | null
      port: string | null
      userConfigured: boolean
      secure: boolean
    }
    resend: {
      configured: boolean
    }
    fallback: {
      supabaseAuthEmailsAvailable: boolean
    }
    fromEmail: string | null
  }
  authUser?: {
    exists: boolean
    id?: string
    emailConfirmed?: boolean
    lastSignIn?: string | null
  }
  profile?: {
    exists: boolean
    id?: string
    role?: string | null
    onboardingCompleted?: boolean
    approvalStatus?: string | null
  }
  error?: string
}

function StatusPill({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span className={`inline-flex items-center border-[2px] border-black px-3 py-1 text-xs font-black uppercase ${ok ? 'bg-[#B4F056]' : 'bg-[#FFD7D7]'}`}>
      {label}
    </span>
  )
}

export default function AuthDiagnosticsPage() {
  const [data, setData] = useState<DiagnosticsResponse | null>(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/auth/diagnose', {
        credentials: 'include',
        cache: 'no-store',
      })
      const payload = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(payload?.error || 'Failed to load diagnostics')
      }
      setData(payload)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load diagnostics')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  return (
    <div className="min-h-screen bg-[#FDFBF7] pt-28 pb-20">
      <div className="container mx-auto max-w-4xl px-4 sm:px-6">
        <div className="mb-10 flex items-center justify-between gap-4">
          <div>
            <Link href="/settings" className="mb-5 inline-flex items-center gap-2 font-bold uppercase tracking-wide text-black hover:translate-x-[-4px] transition-transform">
              <ArrowLeft className="h-5 w-5" />
              Back to settings
            </Link>
            <h1 className="text-4xl font-black uppercase">Auth Diagnostics</h1>
            <p className="mt-3 max-w-2xl border-l-[4px] border-[#FFD93D] pl-4 text-sm font-bold text-black/60 sm:text-base">
              Check whether password reset and confirmation emails will use SMTP, Resend, or Supabase auth fallback.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void load()}
            className="inline-flex items-center gap-2 border-[3px] border-black bg-white px-4 py-3 font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          >
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="flex min-h-[240px] items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin" />
          </div>
        ) : !data ? (
          <div className="border-[3px] border-black bg-white p-6 font-bold shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            Diagnostics unavailable.
          </div>
        ) : (
          <div className="space-y-6">
            <div className="border-[3px] border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <p className="text-xs font-black uppercase tracking-[0.3em] text-black/50">Mail Transport</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <StatusPill ok={Boolean(data.mail?.smtp.configured)} label={data.mail?.smtp.configured ? 'SMTP Ready' : 'SMTP Missing'} />
                <StatusPill ok={Boolean(data.mail?.resend.configured)} label={data.mail?.resend.configured ? 'Resend Ready' : 'Resend Missing'} />
                <StatusPill ok={Boolean(data.mail?.fallback?.supabaseAuthEmailsAvailable)} label="Supabase Fallback" />
              </div>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="border-[2px] border-black bg-[#F6F6F0] p-4 text-sm font-bold">
                  <p>SMTP host: {data.mail?.smtp.host || 'Not set'}</p>
                  <p>SMTP port: {data.mail?.smtp.port || 'Not set'}</p>
                  <p>SMTP user configured: {data.mail?.smtp.userConfigured ? 'Yes' : 'No'}</p>
                  <p>Secure: {data.mail?.smtp.secure ? 'Yes' : 'No'}</p>
                </div>
                <div className="border-[2px] border-black bg-[#F6F6F0] p-4 text-sm font-bold">
                  <p>From email: {data.mail?.fromEmail || 'Not set'}</p>
                  <p>Actor email: {data.actor?.email || 'Unknown'}</p>
                  <p>Actor role: {data.actor?.role || 'Unknown'}</p>
                </div>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="border-[3px] border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <p className="text-xs font-black uppercase tracking-[0.3em] text-black/50">Auth User</p>
                <div className="mt-4 space-y-2 text-sm font-bold">
                  <p>Exists: {data.authUser?.exists ? 'Yes' : 'No'}</p>
                  <p>Email confirmed: {data.authUser?.emailConfirmed ? 'Yes' : 'No'}</p>
                  <p>Last sign-in: {data.authUser?.lastSignIn || 'Never / unavailable'}</p>
                </div>
              </div>

              <div className="border-[3px] border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <p className="text-xs font-black uppercase tracking-[0.3em] text-black/50">Profile</p>
                <div className="mt-4 space-y-2 text-sm font-bold">
                  <p>Exists: {data.profile?.exists ? 'Yes' : 'No'}</p>
                  <p>Role: {data.profile?.role || 'Unknown'}</p>
                  <p>Onboarding complete: {data.profile?.onboardingCompleted ? 'Yes' : 'No'}</p>
                  <p>Approval: {data.profile?.approvalStatus || 'Unknown'}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
