import { createServiceClient } from '@/lib/auth'
import { getIdentity } from '@/lib/auth-state'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { Camera, ExternalLink, ArrowLeft } from 'lucide-react'
import ImageCarousel from '@/components/product/ImageCarousel'
import ProductRecommendations from '@/components/product/ProductRecommendations'
import RequestCollaborationButton from '@/components/collaborations/RequestCollaborationButton'
import FavoriteButton from '@/components/product/FavoriteButton'
import ProductShareButton from '@/components/product/ProductShareButton'

export default async function ProductDetailPage({ params }: { params: Promise<{ productId: string }> }) {
  const { productId } = await params

  const authPromise = getIdentity()

  let service: ReturnType<typeof createServiceClient> | null = null
  try {
    service = createServiceClient()
  } catch {
    service = null
  }

  if (!service) {
    notFound()
  }

  const productPromise = service
    .from('products')
    .select(`
      id,
      name,
      description,
      category,
      price,
      link,
      audience,
      tags,
      cover_image,
      tryon_image,
      brand_id,
      brand:brand_id (
        id,
        full_name,
        brand_data
      )
    `)
    .eq('id', productId)
    .single()

  const [auth, productRes] = await Promise.all([authPromise, productPromise])

  if (!auth.authenticated) {
    redirect('/login')
  }

  if (!auth.identity) {
    redirect('/complete-profile')
  }

  if (auth.identity.role !== 'influencer') {
    redirect('/')
  }

  const { data: product, error } = productRes

  if (error || !product) {
    console.error('Database error fetching product:', error)
    notFound()
  }

  const images = Array.from(new Set([product.cover_image, product.tryon_image].filter((img): img is string => {
    if (typeof img !== 'string' || !img) return false
    if (!img.startsWith('data:')) return true
    return img.length <= 300 * 1024
  })))

  const brandFn = product.brand
  const brandObj = Array.isArray(brandFn) ? brandFn[0] : brandFn
  const brandData = (brandObj?.brand_data || {}) as Record<string, any>
  const brandName = brandData.companyName || brandObj?.full_name || 'Brand'

  const tagsArray = Array.isArray(product.tags) ? product.tags : []

  return (
    <div className="min-h-screen bg-cream pt-24">
      <div className="container mx-auto px-4 sm:px-6 py-8">
        <Link
          href="/marketplace"
          className="inline-flex items-center gap-2 text-sm text-charcoal/60 hover:text-charcoal mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Marketplace
        </Link>

        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 mb-16">
          <div className="bg-white rounded-xl border-[3px] border-black overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <ImageCarousel images={images} />
          </div>

          <div className="space-y-6">
            <div>
              <span className="inline-block px-3 py-1 text-xs font-semibold bg-peach/20 text-orange-700 rounded-full mb-3">
                {product.category?.toUpperCase() || 'CLOTHING'}
              </span>
              <p className="text-sm text-charcoal/60 mb-2">
                by {brandName}
              </p>
            </div>

            <div className="bg-white border-[3px] border-black p-5 sm:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-8 relative">
              <div className="inline-block sm:absolute sm:-top-3 sm:-left-3 mb-3 sm:mb-0 bg-[#FFD93D] px-4 py-1 border-[3px] border-black text-xs font-bold uppercase tracking-widest shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                {brandName}
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-charcoal mb-4 uppercase leading-[0.9] mt-2">{product.name}</h1>
              {product.price && (
                <div className="inline-block bg-black text-white px-4 py-2 text-2xl font-bold font-mono">
                  Rs. {Number(product.price).toLocaleString()}
                </div>
              )}
            </div>

            <div className="space-y-3 pt-4">
              <Link
                href={`/influencer/try-on?productId=${product.id}`}
                className="w-full py-3 sm:py-3.5 bg-[#FFD93D] text-black font-bold text-base sm:text-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-2 hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
              >
                <Camera className="w-5 h-5" />
                Try-On in Studio
              </Link>

              <RequestCollaborationButton
                productId={product.id}
                productName={product.name}
                brandName={brandName}
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {product.link && (
                  <a
                    href={product.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full min-h-[60px] px-3 py-2.5 bg-white border-[3px] border-black text-charcoal font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-2 hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all text-sm uppercase tracking-wider text-center"
                  >
                    <ExternalLink className="w-4 h-4 flex-shrink-0" />
                    <span>View Original</span>
                  </a>
                )}
                <FavoriteButton productId={product.id} />
                <ProductShareButton productName={product.name} />
              </div>
            </div>

            <div className="mt-12 border-[3px] border-black p-8 bg-white relative">
              <div className="inline-block sm:absolute sm:-top-4 sm:left-8 mb-4 sm:mb-0 bg-white px-4 border-[3px] border-black text-sm font-bold uppercase tracking-widest">
                Specification
              </div>

              <h2 className="text-xl font-black uppercase mb-4 text-charcoal">About the Product</h2>
              <p className="text-charcoal/80 leading-relaxed text-lg font-medium">
                {product.description || 'No description available.'}
              </p>

              {tagsArray.length > 0 && (
                <div className="mt-8 pt-8 border-t-[3px] border-black/10">
                  <h2 className="text-sm font-bold uppercase mb-4 text-charcoal/50 tracking-wider">Tags</h2>
                  <div className="flex flex-wrap gap-2">
                    {tagsArray.map((tag: string, index: number) => (
                      <span
                        key={index}
                        className="px-3 py-1 text-xs font-bold bg-white border-[2px] border-black text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all cursor-default"
                      >
                        #{tag.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8 pt-8 border-t-[3px] border-black/10">
                {product.audience && (
                  <div>
                    <p className="text-xs font-bold text-charcoal/40 uppercase mb-2 tracking-widest">Target Audience</p>
                    <p className="text-charcoal font-bold text-lg">{product.audience}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs font-bold text-charcoal/40 uppercase mb-2 tracking-widest">Category</p>
                  <p className="text-charcoal font-bold text-lg">{product.category || 'Uncategorized'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <ProductRecommendations productId={product.id} />
      </div>
    </div>
  )
}
