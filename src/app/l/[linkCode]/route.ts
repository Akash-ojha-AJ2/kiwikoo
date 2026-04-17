import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/auth'
import { extractClickMetadata } from '@/lib/links/tracker'
import { sanitizeRedirectUrl } from '@/lib/links/utils'

export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ linkCode: string }> }
) {
  try {
    const { linkCode } = await params
    const service = createServiceClient()

    const { data: trackedLink, error } = await service
      .from('tracked_links')
      .select('id, original_url, is_active')
      .eq('link_code', linkCode)
      .single()

    if (error || !trackedLink) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 })
    }

    if (!trackedLink.is_active) {
      return NextResponse.json({ error: 'Link is inactive' }, { status: 410 })
    }

    const clickMetadata = await extractClickMetadata(request)

    const recordPromise = service.from('link_clicks').insert({
      tracked_link_id: trackedLink.id,
      ip_address: clickMetadata.ipAddress,
      user_agent: clickMetadata.userAgent,
      referrer: clickMetadata.referrer,
      device_type: clickMetadata.deviceType,
      country: clickMetadata.country,
    })

    const countPromise = (async () => {
      try {
        const { error: rpcError } = await service.rpc('increment_click_count', { link_id: trackedLink.id })
        return rpcError || null
      } catch (rpcError) {
        return rpcError
      }
    })()

    const [{ error: recordError }, countError] = await Promise.all([recordPromise, countPromise])

    if (recordError) {
      console.warn('Failed to persist link click metadata:', recordError)
    }

    if (countError) {
      console.warn('increment_click_count RPC failed:', countError)
    }

    const redirectUrl = sanitizeRedirectUrl(trackedLink.original_url)
    if (!redirectUrl) {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 500 })
    }

    return NextResponse.redirect(redirectUrl, { status: 301 })
  } catch (error) {
    console.error('Link redirect error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

