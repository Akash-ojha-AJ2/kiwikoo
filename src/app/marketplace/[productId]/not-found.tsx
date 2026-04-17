import Link from 'next/link'
import { ArrowLeft, Search } from 'lucide-react'

export default function ProductNotFound() {
  return (
    <div className="min-h-screen bg-cream pt-24 flex items-center justify-center">
      <div className="text-center px-6">
        <div className="w-20 h-20 bg-peach/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Search className="w-10 h-10 text-peach" />
        </div>
        <h1 className="text-3xl font-serif text-charcoal mb-3">Product Not Found</h1>
        <p className="text-charcoal/60 max-w-md mx-auto mb-8">
          The product you&apos;re looking for may have been removed or doesn&apos;t exist. 
          Browse our marketplace to discover other great products.
        </p>
        <Link
          href="/marketplace"
          className="inline-flex items-center gap-2 px-6 py-3 bg-charcoal text-cream rounded-full font-medium hover:bg-charcoal/90 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Marketplace
        </Link>
      </div>
    </div>
  )
}

