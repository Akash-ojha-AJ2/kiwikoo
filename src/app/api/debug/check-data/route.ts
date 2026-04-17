import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/auth'

export async function GET() {
  if (process.env.ENABLE_DEBUG_DATA_ENDPOINTS !== 'true') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  try {
    const supabase = await createClient()
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser()

    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: actorProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', authUser.id)
      .maybeSingle()

    if ((actorProfile?.role || '').toLowerCase() !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const service = createServiceClient()

    const { count: legacyProductCount, error: lpError } = await service
      .from('Product')
      .select('*', { count: 'exact', head: true })

    const { count: legacyImageCount, error: liError } = await service
      .from('ProductImage')
      .select('*', { count: 'exact', head: true })

    const { count: newProductCount, error: npError } = await service
      .from('products')
      .select('*', { count: 'exact', head: true })

    const { data: sampleLegacy } = await service
      .from('Product')
      .select('id, name, brandId')
      .limit(2)

    const legacyDetails: Array<{ product: any; images: any[] | null }> = []
    if (sampleLegacy) {
      for (const p of sampleLegacy) {
        const { data: imgs } = await service
          .from('ProductImage')
          .select('id, imagePath, isTryOnReference, order')
          .eq('productId', p.id)
        legacyDetails.push({ product: p, images: imgs })
      }
    }

    const { data: sampleNew } = await service
      .from('products')
      .select('id, name, images, cover_image')
      .not('images', 'is', null)
      .limit(3)

    return NextResponse.json({
      counts: {
        legacyProducts: legacyProductCount,
        legacyImages: legacyImageCount,
        newProducts: newProductCount,
      },
      errors: {
        legacyProduct: lpError?.message,
        legacyImage: liError?.message,
        newProduct: npError?.message,
      },
      samples: {
        legacy: legacyDetails,
        new: sampleNew,
      },
    })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
