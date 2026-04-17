'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'

const faqs = [
  {
    category: 'Creator Approval',
    question: 'I can’t access creator features',
    answer: 'Creator accounts require admin approval. Check your status at /influencer/pending.',
    link: '/influencer/pending',
  },
  {
    category: 'Account & Profile',
    question: 'I didn’t receive a confirmation email',
    answer: 'Check spam/junk folders. If you still don’t see it, try signing in and you will be prompted to verify.',
  },
  {
    category: 'Try-On Studio',
    question: 'My try-on results are not loading',
    answer: 'Refresh the page and verify your profile images are uploaded. If it persists, contact support.',
  },
  {
    category: 'Collaborations',
    question: 'How do I request a collaboration?',
    answer: 'Brands can request collaborations from the creator profile page in the marketplace.',
  },
  {
    category: 'Payments & Payouts',
    question: 'When do payouts happen?',
    answer: 'Payouts are processed after a collaboration is marked complete. Timing can vary by bank.',
  },
  {
    category: 'Technical Issues',
    question: 'The site is slow or glitchy',
    answer: 'Clear your browser cache and try again. If the problem persists, contact support.',
  },
]

export default function HelpPage() {
  const [query, setQuery] = useState('')
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return faqs
    return faqs.filter(
      (item) =>
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
    )
  }, [query])

  return (
    <main className="min-h-screen bg-cream">
      <div className="container mx-auto px-6 py-16 max-w-4xl">
        <Link href="/" className="kiwikoo-wordmark text-3xl text-charcoal">
          Kiwikoo
        </Link>

        <h1 className="text-5xl font-serif font-bold text-charcoal mt-6">Help & Support</h1>
        <p className="mt-4 text-charcoal/70">
          Search for answers or browse common topics. If you need help, contact our team and we’ll respond.
        </p>

        <div className="mt-8">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search help topics..."
            className="w-full px-4 py-3 rounded-xl border border-charcoal/10 bg-white text-charcoal focus:outline-none focus:ring-2 focus:ring-peach/50"
          />
        </div>

        <div className="mt-10 grid gap-6">
          {filtered.length === 0 ? (
            <div className="bg-white rounded-3xl border border-charcoal/10 p-8 text-charcoal/60">
              No results found. Try a different keyword.
            </div>
          ) : (
            filtered.map((item) => (
              <div key={item.question} className="bg-white rounded-3xl border border-charcoal/10 p-8">
                <div className="text-xs font-semibold uppercase tracking-wide text-charcoal/50">
                  {item.category}
                </div>
                <h2 className="text-xl font-semibold text-charcoal mt-2">{item.question}</h2>
                <p className="text-charcoal/60 mt-2">{item.answer}</p>
                {item.link && (
                  <Link href={item.link} className="text-charcoal font-medium hover:underline mt-3 inline-block">
                    View status
                  </Link>
                )}
              </div>
            ))
          )}

          <div className="bg-white rounded-3xl border border-charcoal/10 p-8">
            <h2 className="text-xl font-semibold text-charcoal">Contact support</h2>
            <p className="text-charcoal/60 mt-2">
              Email us at <span className="font-medium text-charcoal">team@dridhatechnologies.com</span> or use the contact form.
            </p>
            <div className="mt-5">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-7 py-3 rounded-full bg-charcoal text-cream font-medium hover:bg-charcoal/90"
              >
                Contact us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
