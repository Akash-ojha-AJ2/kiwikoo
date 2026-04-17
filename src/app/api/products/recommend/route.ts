import { NextResponse } from 'next/server'
import { createClient } from '@/lib/auth'
import { generateProductRecommendations } from '@/lib/openai'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser()

    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile for personalization
    const { data: profile } = await supabase
      .from('profiles')
      .select('*, influencer_profiles(*)')
      .eq('id', authUser.id)
      .single()

    const role = (profile?.role || '').toLowerCase()

    // Only influencers usually get recommendations, but brands might get similar products
    // Original code restricted to INFLUENCER.
    if (!profile || role !== 'influencer') {
      return NextResponse.json(
        { error: 'Unauthorized - Influencer access required' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')

    if (productId) {
      // Get current product details
      const { data: currentProduct } = await supabase
        .from('products')
        .select('id, category, brand_id, audience')
        .eq('id', productId)
        .single()

      if (!currentProduct) {
        return NextResponse.json([], { headers: { 'Cache-Control': 'public, max-age=600' } })
      }

      // Find similar products
      // OR query in Supabase: category.eq.X,brand_id.eq.Y,audience.eq.Z
      // Not straightforward to do complex OR with exclusions without raw SQL or multiple queries.
      // But we can fetch products matching ANY filter and then sort/filter in code or use .or()

      const { data: similarProducts } = await supabase
        .from('products')
        .select(`
          id, name, description, category, price, link, audience,
          brand_id,
          brand:brand_id(id, full_name, brand_data),
          cover_image, tryon_image
        `)
        .neq('id', productId)
        .or(`category.eq.${currentProduct.category},brand_id.eq.${currentProduct.brand_id}`) // audience might be null
        .limit(8)

      return NextResponse.json(similarProducts || [], {
        headers: { 'Cache-Control': 'public, max-age=600, stale-while-revalidate=1800' }
      })
    }

    // AI Recommendations (User-based)
    // Fetch a batch of products to rank
    const { data: allProducts } = await supabase
      .from('products')
      .select(`
          id, name, description, category, audience,
          brand_id,
          brand:brand_id(id, full_name, brand_data),
          cover_image, tryon_image
      `)
      .limit(100)

    if (!allProducts || allProducts.length === 0) return NextResponse.json([])

    // Use OpenAI to rank
    const recommendations = await generateProductRecommendations(
      {
        bio: profile.influencer_profiles?.bio || undefined,
        niches: profile.influencer_profiles?.niches || [],
      },
      allProducts.map((p: any) => ({
        id: p.id,
        name: p.name,
        description: p.description || undefined,
        category: p.category || undefined,
      }))
    )

    // Sort and return full objects
    const sortedProducts = recommendations
      .sort((a, b) => b.matchScore - a.matchScore)
      .map(rec => allProducts.find(p => p.id === rec.productId))
      .filter(Boolean)
      .slice(0, 10)

    return NextResponse.json(sortedProducts, {
      headers: { 'Cache-Control': 'public, max-age=600, stale-while-revalidate=1800' }
    })

  } catch (error) {
    console.error('Product recommendation error:', error)
    return NextResponse.json([])
  }
}
