import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/auth'
import { generateLinkCode } from '@/lib/links/generator'
import { getMaskedUrl } from '@/lib/links/utils'
import { getPublicSiteUrlFromRequest, joinPublicUrl } from '@/lib/site-url'

export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const supabase = await createClient()
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser()

    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { productId } = await params
    if (!productId) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 })
    }

    const service = createServiceClient()
    const { data: profile } = await service
      .from('profiles')
      .select('role')
      .eq('id', authUser.id)
      .single()

    if ((profile?.role || '').toLowerCase() !== 'influencer') {
      return NextResponse.json({ error: 'Only influencers can generate tracked product links' }, { status: 403 })
    }

    const { data: product, error: productError } = await service
      .from('products')
      .select('id, name, link')
      .eq('id', productId)
      .single()

    if (productError || !product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const siteUrl = getPublicSiteUrlFromRequest(request)
    const fallbackProductUrl = joinPublicUrl(siteUrl, `/marketplace/${productId}`)
    const originalUrl =
      typeof product.link === 'string' && product.link.trim().length > 0 ? product.link.trim() : fallbackProductUrl

    const { data: existingLink, error: existingLinkError } = await service
      .from('tracked_links')
      .select('id, original_url, masked_url, link_code')
      .eq('influencer_id', authUser.id)
      .eq('product_id', productId)
      .maybeSingle()

    if (existingLinkError) {
      throw existingLinkError
    }

    if (existingLink) {
      const linkCode = existingLink.link_code
      const maskedUrl = existingLink.masked_url || getMaskedUrl(linkCode, siteUrl)
      const needsUpdate =
        existingLink.masked_url !== maskedUrl ||
        !existingLink.original_url ||
        existingLink.original_url !== originalUrl

      if (needsUpdate) {
        const { error: updateError } = await service
          .from('tracked_links')
          .update({
            masked_url: maskedUrl,
            original_url: originalUrl,
          })
          .eq('id', existingLink.id)

        if (updateError) {
          console.warn('Failed to sync tracked link metadata:', updateError)
        }
      }

      return NextResponse.json({
        maskedUrl,
        linkCode,
        originalUrl,
        productId,
        productName: product.name ?? null,
      })
    }

    const linkCode = await generateLinkCode()
    const maskedUrl = getMaskedUrl(linkCode, siteUrl)

    const { error: insertError } = await service.from('tracked_links').insert({
      influencer_id: authUser.id,
      product_id: productId,
      original_url: originalUrl,
      masked_url: maskedUrl,
      link_code: linkCode,
      click_count: 0,
      is_active: true,
    })

    if (insertError) {
      throw insertError
    }

    return NextResponse.json({
      maskedUrl,
      linkCode,
      originalUrl,
      productId,
      productName: product.name ?? null,
    })
  } catch (error) {
    console.error('Product link error:', error)
    return NextResponse.json({ error: 'Failed to fetch product link' }, { status: 500 })
  }
}
