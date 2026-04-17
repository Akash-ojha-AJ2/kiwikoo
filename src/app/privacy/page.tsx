import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-cream">
      <div className="container mx-auto px-6 py-16 max-w-4xl">
        <Link href="/" className="kiwikoo-wordmark text-3xl text-charcoal">
          Kiwikoo
        </Link>
        <h1 className="text-5xl font-serif font-bold text-charcoal mt-6">Privacy Policy</h1>
        <p className="mt-4 text-charcoal/70">
          This is a placeholder privacy policy page for Kiwikoo. Replace this content with your finalized policy before
          launching.
        </p>

        <div className="mt-10 bg-white rounded-3xl border border-charcoal/10 p-8 space-y-4 text-charcoal/70">
          <p>
            <strong className="text-charcoal">Data we collect</strong>: account details, usage analytics, and content you
            upload to use the product.
          </p>
          <p>
            <strong className="text-charcoal">How we use it</strong>: to provide the service, keep accounts secure, and
            improve performance and reliability.
          </p>
          <p>
            <strong className="text-charcoal">Your rights</strong>: you can request access, correction, or deletion of
            your data where applicable.
          </p>
        </div>

        <div className="mt-10">
          <Link href="/contact" className="text-charcoal font-medium hover:underline">
            Contact support
          </Link>
        </div>
      </div>
    </main>
  )
}
