import { NextResponse } from 'next/server'
import { createClient } from '@/lib/auth'
import { productSchema } from '@/lib/validation'
import { z } from 'zod'

const createProductSchema = productSchema
  .extend({
    category: z.string().trim().min(1).max(80),
    audience: z.string().trim().min(1).max(40),
    price: z.union([z.number(), z.string().trim()]).optional(),
  })
  .strict()

function toPublicBrand(brand: { id?: string | null; full_name?: string | null; brand_data?: Record<string, unknown> | null } | null | undefined) {
  const companyName =
    (brand?.brand_data?.companyName as string | undefined) ||
    brand?.full_name ||
    'Unknown Brand'

  return {
    id: brand?.id || null,
    full_name: brand?.full_name || null,
    brand_data: {
      companyName,
    },
  }
}

// POST Handler
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()

    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', authUser.id)
      .single()

    const role = (profile?.role || '').toLowerCase()
    if (!profile || role !== 'brand') {
      return NextResponse.json({ error: 'Unauthorized - Brand access required' }, { status: 403 })
    }

    const body = await request.json().catch(() => null)
    const parsed = createProductSchema.parse(body)
    const { name, description, category, link, tags, audience, images } = parsed

    let priceValue = parsed.price
    if (typeof priceValue === 'string') {
      priceValue = priceValue.trim() === '' ? 0 : Number(priceValue)
    }

    const coverImg = images?.find((img: any) => img.isCoverImage)
    const coverImage = coverImg?.imagePath || images?.[0]?.imagePath || ''
    const productImages = images?.map((i: any) => i.imagePath) || []

    const { data: product, error } = await supabase
      .from('products')
      .insert({
        brand_id: profile.id,
        name,
        description,
        category,
        price: priceValue,
        link,
        tags: tags ? (Array.isArray(tags) ? tags : [tags]) : [],
        audience,
        cover_image: coverImage,
        images: productImages,
        active: true
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error('Product creation error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET Handler - Returns LEGACY SHAPE with images array
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()

    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('id')

    // Single Product
    if (productId) {
      const { data: product, error } = await supabase
        .from('products')
        .select(`
            *,
            brand:brand_id (
                id, full_name, brand_data
            )
        `)
        .eq('id', productId)
        .single()

      if (error || !product) {
        // Fallback: Check Legacy 'Product' Table
        const { data: legacyProduct, error: legacyError } = await supabase
          .from('Product')
          .select(`
            id, name, description, category, link, audience, price, active, tags, "brandId", "createdAt", "updatedAt"
          `)
          .eq('id', productId)
          .single()

        if (legacyError || !legacyProduct) {
          return NextResponse.json({ error: 'Product not found' }, { status: 404 })
        }

        // Fetch Legacy ProductImage data
        const { data: legacyImages } = await supabase
          .from('ProductImage')
          .select('id, imagePath, order, isTryOnReference, isCoverImage')
          .eq('productId', productId)
          .order('order', { ascending: true })

        return NextResponse.json({
          ...legacyProduct,
          brand: { id: legacyProduct.brandId },
          images: legacyImages || []
        })
      }

      // Found in NEW table - try to find legacy images
      // 1. First try direct ID match (for non-migrated or correctly migrated items)
      let { data: legacyImages } = await supabase
        .from('ProductImage')
        .select('id, imagePath, order, isTryOnReference, isCoverImage')
        .eq('productId', productId)
        .order('order', { ascending: true })

      // 2. If no images found, it might be a migrated product with a mismatched ID (UUID vs CUID)
      // Try to find the legacy product by NAME to get its Legacy ID
      if (!legacyImages || legacyImages.length === 0) {
        const { data: legacyMatch } = await supabase
          .from('Product')
          .select('id')
          .eq('name', product.name) // Match by Name
          .single()

        if (legacyMatch) {
          const { data: foundImages } = await supabase
            .from('ProductImage')
            .select('id, imagePath, order, isTryOnReference, isCoverImage')
            .eq('productId', legacyMatch.id) // Use Legacy ID
            .order('order', { ascending: true })

          if (foundImages && foundImages.length > 0) {
            legacyImages = foundImages
          }
        }
      }

      let finalImages = []
      if (legacyImages && legacyImages.length > 0) {
        finalImages = legacyImages
      } else {
        // 3. Fallback: Synthesize from array if no legacy images found anywhere
        finalImages = (product.images || []).map((url: string, idx: number) => ({
          id: `img-${idx}`,
          imagePath: url,
          order: idx,
          isTryOnReference: idx === 0,
          isCoverImage: url === product.cover_image
        }))
      }

      return NextResponse.json({
        id: product.id,
        name: product.name,
        description: product.description,
        category: product.category,
        price: product.price,
        link: product.link,
        tags: product.tags,
        audience: product.audience,
        imagePath: product.cover_image,
        createdAt: product.created_at,
        updatedAt: product.updated_at,
        brand: {
          id: product.brand?.id,
          companyName: product.brand?.full_name || product.brand?.brand_data?.companyName || 'Unknown Brand'
        },
        images: finalImages
      }, {
        headers: { 'Cache-Control': 'public, max-age=300, stale-while-revalidate=600' }
      })
    }

    // List Products
    const search = searchParams.get('search')
    const category = searchParams.get('category')
    const brandId = searchParams.get('brandId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const from = (page - 1) * limit
    const to = from + limit - 1

    let query = supabase
      .from('products')
      .select(`*, brand:brand_id (id, full_name, brand_data)`, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to)

    if (search) query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    if (category) query = query.eq('category', category)
    if (brandId && brandId !== 'current') query = query.eq('brand_id', brandId)
    if (brandId === 'current' && authUser) query = query.eq('brand_id', authUser.id)

    const { data: products, count, error } = await query
    if (error) throw error

    const sanitizedProducts = (products || []).map((product) => ({
      ...product,
      brand: toPublicBrand(product.brand),
    }))

    return NextResponse.json({
      data: sanitizedProducts,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      }
    })
  } catch (error) {
    console.error('Product fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH Handler
export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()

    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json().catch(() => null)
    const { id, ...updateData } = body

    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

    const { data: existing } = await supabase
      .from('products')
      .select('brand_id')
      .eq('id', id)
      .single()

    if (!existing || existing.brand_id !== authUser.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { data: updated, error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
}

// DELETE Handler
export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()

    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

    const { data, error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)
      .eq('brand_id', authUser.id)
      .select('id')

    if (error) throw error

    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'Not found or unauthorized' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
}
