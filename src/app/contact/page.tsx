'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Mail, Phone, Sparkles } from 'lucide-react'
import { toast } from '@/lib/simple-sonner'

const PF = 'var(--font-plus-jakarta-sans), sans-serif'

export default function ContactPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    userType: '',
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to send message')
      toast.success('Message sent! We will respond shortly.')
      setForm({ name: '', email: '', subject: '', message: '', userType: '' })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to send message')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main
      className="min-h-screen bg-[#f7eee4] px-3 pb-10 pt-[110px] text-[#111111] sm:px-4 lg:px-6 lg:pt-[126px]"
      style={{ fontFamily: PF }}
    >
      <div className="mx-auto max-w-[1320px] overflow-hidden rounded-[34px] border-[3px] border-black bg-[#fbfaf6] shadow-[10px_10px_0_0_rgba(0,0,0,1)]">
        <section className="relative overflow-hidden border-b-[3px] border-black px-5 py-10 sm:px-8 lg:px-10 lg:py-12">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(17,17,17,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(17,17,17,0.05)_1px,transparent_1px)] bg-[size:42px_42px]" />
          <div className="pointer-events-none absolute inset-y-0 left-0 w-[26%] bg-[radial-gradient(circle_at_18%_28%,rgba(255,140,120,0.16),transparent_45%)]" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-[30%] bg-[radial-gradient(circle_at_72%_40%,rgba(203,255,46,0.14),transparent_42%)]" />

          <div className="relative z-10 grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div className="max-w-[520px]">
              <div className="inline-flex items-center gap-2 rounded-full border-[2px] border-black bg-white px-4 py-2 text-[12px] font-black uppercase tracking-[0.08em] text-black shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                <Sparkles className="h-4 w-4" strokeWidth={2.4} />
                Contact
              </div>
              <h1 className="mt-6 text-[clamp(3.1rem,7vw,5.8rem)] font-black uppercase leading-[0.9] tracking-[-0.07em] text-black">
                Contact
                <br />
                Us
              </h1>
              <p className="mt-5 max-w-[500px] text-[18px] leading-8 text-black/65">
                Need help with onboarding, approvals, payments, or your account? Send us a message and we&apos;ll point you to the right team quickly.
              </p>

              <div className="mt-8 space-y-4">
                <InfoCard
                  icon={<Mail className="h-5 w-5" strokeWidth={2.2} />}
                  label="Email"
                  value="team@dridhatechnologies.com"
                  href="mailto:team@dridhatechnologies.com"
                />
                <InfoCard
                  icon={<Phone className="h-5 w-5" strokeWidth={2.2} />}
                  label="Phone"
                  value="+91 89775 33164"
                />
              </div>

              <div className="mt-8">
                <Link
                  href="/marketplace"
                  className="inline-flex items-center justify-center rounded-[16px] border-[3px] border-black bg-[#ffd243] px-6 py-3 text-[15px] font-black text-black shadow-[5px_5px_0_0_rgba(0,0,0,1)] transition hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
                >
                  Back to marketplace
                </Link>
              </div>
            </div>

            <div className="rounded-[28px] border-[3px] border-black bg-white p-5 shadow-[8px_8px_0_0_rgba(0,0,0,1)] sm:p-6 lg:p-7">
              <form onSubmit={handleSubmit} className="grid gap-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <Field
                    label="Name"
                    value={form.name}
                    onChange={(value) => setForm({ ...form, name: value })}
                  />
                  <Field
                    label="Email"
                    type="email"
                    value={form.email}
                    onChange={(value) => setForm({ ...form, email: value })}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Field
                    label="Subject"
                    value={form.subject}
                    onChange={(value) => setForm({ ...form, subject: value })}
                  />
                  <div>
                    <label className="mb-2 block text-[12px] font-black uppercase tracking-[0.08em] text-black/70">
                      User type
                    </label>
                    <select
                      required
                      value={form.userType}
                      onChange={(e) => setForm({ ...form, userType: e.target.value })}
                      className="h-14 w-full rounded-[16px] border-[2px] border-black bg-[#fffdf8] px-4 text-[17px] font-semibold text-black outline-none transition focus:translate-x-[1px] focus:translate-y-[1px] focus:shadow-[3px_3px_0_0_rgba(0,0,0,1)]"
                    >
                      <option value="" disabled>Who are You..</option>
                      <option value="Influencer">Influencer</option>
                      <option value="Brand">Brand</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-[12px] font-black uppercase tracking-[0.08em] text-black/70">
                    Message
                  </label>
                  <textarea
                    required
                    rows={7}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Tell us what you need help with..."
                    className="w-full rounded-[18px] border-[2px] border-black bg-[#fffdf8] px-4 py-4 text-[17px] text-black outline-none transition placeholder:text-black/35 focus:translate-x-[1px] focus:translate-y-[1px] focus:shadow-[3px_3px_0_0_rgba(0,0,0,1)]"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4">
                  <p className="max-w-[340px] text-[14px] leading-6 text-black/55">
                    For the fastest help, include the email tied to your account and a short description of the issue.
                  </p>
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex h-13 items-center justify-center gap-2 rounded-full border-[3px] border-black bg-[#cbff2e] px-7 text-[14px] font-black uppercase tracking-[0.06em] text-black shadow-[5px_5px_0_0_rgba(0,0,0,1)] transition hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {loading ? 'Sending...' : 'Send message'}
                    <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
}) {
  return (
    <div>
      <label className="mb-2 block text-[12px] font-black uppercase tracking-[0.08em] text-black/70">
        {label}
      </label>
      <input
        type={type}
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-14 w-full rounded-[16px] border-[2px] border-black bg-[#fffdf8] px-4 text-[17px] text-black outline-none transition focus:translate-x-[1px] focus:translate-y-[1px] focus:shadow-[3px_3px_0_0_rgba(0,0,0,1)]"
      />
    </div>
  )
}

function InfoCard({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode
  label: string
  value: string
  href?: string
}) {
  const content = href ? (
    <a href={href} className="text-[18px] font-bold text-black underline-offset-4 hover:underline">
      {value}
    </a>
  ) : (
    <span className="text-[18px] font-bold text-black">{value}</span>
  )

  return (
    <div className="flex items-center gap-4 rounded-[20px] border-[3px] border-black bg-white px-4 py-4 shadow-[5px_5px_0_0_rgba(0,0,0,1)]">
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-[14px] border-[2px] border-black bg-[#ff8c78] text-black">
        {icon}
      </span>
      <div>
        <div className="text-[12px] font-black uppercase tracking-[0.08em] text-black/55">{label}</div>
        <div className="mt-1">{content}</div>
      </div>
    </div>
  )
}
