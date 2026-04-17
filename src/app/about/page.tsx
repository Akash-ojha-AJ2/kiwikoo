import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-cream">
      <div className="container mx-auto px-6 py-16 max-w-4xl">
        <Link href="/" className="kiwikoo-wordmark text-3xl text-charcoal">
          Kiwikoo
        </Link>
        <h1 className="text-5xl font-serif font-bold text-charcoal mt-6">About Kiwikoo</h1>
        <p className="mt-4 text-lg text-charcoal/70">
          Kiwikoo is an AI-powered fashion try-on marketplace that connects creators and brands. We help influencers
          create high-quality try-ons, and help brands launch campaigns with measurable performance.
        </p>

        <div className="mt-10 grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl border border-charcoal/10 p-7">
            <h2 className="text-xl font-semibold text-charcoal">For influencers</h2>
            <p className="text-charcoal/60 mt-2">
              Build a portfolio, create try-ons faster, and collaborate with brands.
            </p>
          </div>
          <div className="bg-white rounded-3xl border border-charcoal/10 p-7">
            <h2 className="text-xl font-semibold text-charcoal">For brands</h2>
            <p className="text-charcoal/60 mt-2">
              Find creators, generate assets, and track performance in one place.
            </p>
          </div>
        </div>

        <div className="mt-10">
          <Link
            href="/register"
            className="inline-flex items-center justify-center px-7 py-3 rounded-full bg-charcoal text-cream font-medium hover:bg-charcoal/90"
          >
            Create an account
          </Link>
        </div>
      </div>
    </main>
  )
}
