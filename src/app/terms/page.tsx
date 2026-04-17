import Link from 'next/link'

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#f8f5ef] text-black">
      <div className="mx-auto max-w-5xl px-6 py-14 sm:px-8 lg:px-10">
        <Link href="/" className="kiwikoo-wordmark text-3xl text-black">
          Kiwikoo
        </Link>

        <div className="mt-8 rounded-[2rem] border-[3px] border-black bg-white px-6 py-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] sm:px-8 sm:py-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.35em] text-black/50">Terms</p>
              <h1 className="mt-3 text-4xl font-black uppercase leading-none tracking-tight sm:text-5xl">
                Terms Of Use
              </h1>
            </div>
            <p className="max-w-xl text-sm font-medium leading-7 text-black/65 sm:text-base">
              These terms govern access to Kiwikoo, including creator tools, brand workflows, AI try-on features,
              messaging, collaborations, and commerce-related links.
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-6">
          <section className="rounded-[2rem] border-[3px] border-black bg-white px-6 py-7 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] sm:px-8">
            <h2 className="text-2xl font-black uppercase tracking-tight">1. Using Kiwikoo</h2>
            <p className="mt-4 text-base leading-8 text-black/70">
              Kiwikoo is a fashion marketplace and creative workflow platform for creators and brands.
              By using the service, you agree to provide accurate account information and to use the platform only for
              lawful business, content, and collaboration purposes.
            </p>
          </section>

          <section className="rounded-[2rem] border-[3px] border-black bg-white px-6 py-7 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] sm:px-8">
            <h2 className="text-2xl font-black uppercase tracking-tight">2. Accounts And Security</h2>
            <p className="mt-4 text-base leading-8 text-black/70">
              You are responsible for maintaining the confidentiality of your login credentials and for all activity
              under your account. If you believe your account has been accessed without permission, contact us
              immediately.
            </p>
          </section>

          <section className="rounded-[2rem] border-[3px] border-black bg-white px-6 py-7 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] sm:px-8">
            <h2 className="text-2xl font-black uppercase tracking-tight">3. Content And AI Outputs</h2>
            <p className="mt-4 text-base leading-8 text-black/70">
              You retain responsibility for the images, brand assets, prompts, product information, and campaign
              material you upload or generate through Kiwikoo. You must have the necessary rights to use that content.
              AI-generated outputs should be reviewed before public or commercial use.
            </p>
          </section>

          <section className="rounded-[2rem] border-[3px] border-black bg-white px-6 py-7 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] sm:px-8">
            <h2 className="text-2xl font-black uppercase tracking-tight">4. Acceptable Use</h2>
            <p className="mt-4 text-base leading-8 text-black/70">
              You may not use Kiwikoo to upload unlawful, infringing, deceptive, abusive, or harmful material, or to
              misuse creator data, impersonate others, scrape the platform, or interfere with service reliability.
            </p>
          </section>

          <section className="rounded-[2rem] border-[3px] border-black bg-white px-6 py-7 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] sm:px-8">
            <h2 className="text-2xl font-black uppercase tracking-tight">5. Collaborations, Links, And Payments</h2>
            <p className="mt-4 text-base leading-8 text-black/70">
              Collaboration requests, tracked product links, analytics, and any payouts or brand arrangements made
              through or around Kiwikoo remain subject to the agreement between the relevant parties. Kiwikoo may
              provide workflow tools, but does not guarantee commercial outcomes.
            </p>
          </section>

          <section className="rounded-[2rem] border-[3px] border-black bg-white px-6 py-7 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] sm:px-8">
            <h2 className="text-2xl font-black uppercase tracking-tight">6. Availability And Changes</h2>
            <p className="mt-4 text-base leading-8 text-black/70">
              We may update, suspend, or improve parts of the service over time, including AI models, quotas, pricing,
              and feature availability. We work to keep Kiwikoo reliable, but uninterrupted availability is not
              guaranteed.
            </p>
          </section>

          <section className="rounded-[2rem] border-[3px] border-black bg-white px-6 py-7 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] sm:px-8">
            <h2 className="text-2xl font-black uppercase tracking-tight">7. Contact</h2>
            <p className="mt-4 text-base leading-8 text-black/70">
              If you have a legal question, support request, or need help with your account, reach out through our
              contact page or email the team directly.
            </p>
            <div className="mt-6 flex flex-wrap gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center rounded-full border-[3px] border-black bg-[#c2fb3d] px-5 py-3 text-sm font-black uppercase tracking-[0.2em] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
              >
                Contact Support
              </Link>
              <a
                href="mailto:team@dridhatechnologies.com"
                className="inline-flex items-center rounded-full border-[3px] border-black bg-white px-5 py-3 text-sm font-black uppercase tracking-[0.2em] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
              >
                team@dridhatechnologies.com
              </a>
            </div>
          </section>
        </div>

        <div className="mt-10">
          <Link href="/privacy" className="font-bold text-black hover:underline">
            Read privacy policy
          </Link>
          <span className="mx-3 text-black/30">/</span>
          <Link href="/contact" className="font-bold text-black hover:underline">
            Contact support
          </Link>
        </div>
      </div>
    </main>
  )
}
