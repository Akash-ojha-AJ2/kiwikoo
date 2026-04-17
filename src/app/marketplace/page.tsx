import { createClient, createServiceClient } from '@/lib/auth'
import MarketplaceClient from '@/components/marketplace/MarketplaceClient'

// Define types that match MarketplaceClient expectations
interface ProductImage {
  id: string
  imagePath: string
}

interface ClientProduct {
  id: string
  name: string
  description: string | null
  category: string | null
  price: number
  imagePath: string
  brand: {
    id: string
    companyName: string | null
    user: {
      name: string | null
      slug: string | null
    } | null
  }
  images: ProductImage[]
}

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; search?: string }>
}) {
  const resolvedSearchParams = await searchParams

  // Use service client for public marketplace listing to avoid cookie/session overhead on every request.
  let supabase: any
  try {
    supabase = createServiceClient()
  } catch {
    // Fallback for environments where service role key is not configured.
    supabase = await createClient()
  }

  // Build products query - only fetch lightweight columns.
  // IMPORTANT: Do NOT fetch `images` here. That column contains base64 data
  // (multi-MB per product) and is only needed on the product detail page.
  // `cover_image` is kept because most products store a short Supabase URL there.
  let query = supabase
    .from('products')
    .select(`
      id,
      name,
      description,
      category,
      price,
      cover_image,
      tryon_image,
      brand_id,
      brand:brand_id (
        id,
        brand_data
      )
    `)
    .eq('active', true)
    .order('created_at', { ascending: false })
    .limit(50)

  if (resolvedSearchParams.category && resolvedSearchParams.category !== 'all') {
    query = query.ilike('category', resolvedSearchParams.category)
  }

  if (resolvedSearchParams.search) {
    const search = resolvedSearchParams.search
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
  }

  // Just fetch products - NO auth check needed here.
  // /marketplace is already in PUBLIC_PREFIXES (middleware.ts line 40)
  const { data: products, error: productsError } = await query

  if (productsError) {
    console.error('Marketplace fetch error:', productsError)
  }

  const categories = ['All Products', 'Clothing', 'Accessories', 'Footwear', 'Beauty', 'Lifestyle']
  const activeCategory = resolvedSearchParams.category || 'all'

  // Transform to match Client Component interface
  const transformedProducts: ClientProduct[] = (products || []).map((p: any) => {
    const brandData = p.brand?.brand_data as Record<string, any> || {}
    const companyName = brandData.companyName || 'Unknown Brand'

    // Use cover image URL when available, but never inline base64 in listing payloads.
    let mainImage = p.cover_image || p.tryon_image || ''
    // Keep smaller inline images visible; skip only very large data URIs that hurt page speed.
    if (typeof mainImage === 'string' && mainImage.startsWith('data:') && mainImage.length > 2 * 1024 * 1024) {
      mainImage = ''
    }

    return {
      id: p.id,
      name: p.name,
      description: p.description,
      category: p.category,
      price: Number(p.price || 0),
      imagePath: mainImage,
      brand: {
        id: p.brand?.id || 'unknown',
        companyName: companyName,
        user: {
          name: companyName,
          slug: null
        }
      },
      // Don't pass images on listing - they're only needed on detail page
      images: []
    }
  })

  return (
    <MarketplaceClient
      products={transformedProducts}
      categories={categories}
      activeCategory={activeCategory}
    />
  )
}
