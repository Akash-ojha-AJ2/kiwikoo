/**
 * IMAGE PROXY API
 *
 * Proxies images from Supabase Storage and enforces strict host/bucket allowlists.
 * GET /api/images/proxy?url=<encoded_url>
 */
import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/auth'

const CACHE_CONTROL = 'public, max-age=31536000, immutable'
const DEFAULT_ALLOWED_BUCKETS = [
  'ads',
  'identity-images',
  'portfolios',
  'products',
  'profile-images',
  'try-ons',
  'uploads',
]

function getSupabaseHost(): string | null {
  const raw = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim()
  if (!raw) return null

  try {
    return new URL(raw).hostname.toLowerCase()
  } catch {
    return null
  }
}

function getAllowedBuckets(): Set<string> {
  const fromEnv = (process.env.IMAGE_PROXY_ALLOWED_BUCKETS || '')
    .split(',')
    .map((bucket) => bucket.trim())
    .filter(Boolean)

  if (fromEnv.length > 0) {
    return new Set(fromEnv)
  }

  return new Set(DEFAULT_ALLOWED_BUCKETS)
}

function parseSupabasePublicPath(url: URL): { bucket: string; objectPath: string } | null {
  const segments = url.pathname.split('/').filter(Boolean)
  if (segments.length < 6) return null
  if (segments[0] !== 'storage' || segments[1] !== 'v1' || segments[2] !== 'object' || segments[3] !== 'public') {
    return null
  }

  const bucket = decodeURIComponent(segments[4])
  const objectPath = decodeURIComponent(segments.slice(5).join('/'))

  if (!bucket || !objectPath) return null
  return { bucket, objectPath }
}

function inferContentType(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase()
  if (ext === 'png') return 'image/png'
  if (ext === 'webp') return 'image/webp'
  if (ext === 'gif') return 'image/gif'
  if (ext === 'avif') return 'image/avif'
  return 'image/jpeg'
}

export async function GET(request: NextRequest) {
  try {
    const rawUrl = request.nextUrl.searchParams.get('url')

    if (!rawUrl) {
      return NextResponse.json({ error: 'URL parameter required' }, { status: 400 })
    }

    let imageUrl: URL
    try {
      imageUrl = new URL(rawUrl)
    } catch {
      return NextResponse.json({ error: 'Invalid URL parameter' }, { status: 400 })
    }

    const supabaseHost = getSupabaseHost()
    if (!supabaseHost || imageUrl.hostname.toLowerCase() !== supabaseHost) {
      return NextResponse.json({ error: 'Only configured Supabase host is allowed' }, { status: 403 })
    }

    const parsed = parseSupabasePublicPath(imageUrl)
    if (!parsed) {
      return NextResponse.json({ error: 'Only public Supabase storage object URLs are allowed' }, { status: 403 })
    }

    const allowedBuckets = getAllowedBuckets()
    if (!allowedBuckets.has(parsed.bucket)) {
      return NextResponse.json({ error: 'Storage bucket is not allowed' }, { status: 403 })
    }

    try {
      const service = createServiceClient()
      const { data, error } = await service.storage.from(parsed.bucket).download(parsed.objectPath)

      if (!error && data) {
        return new NextResponse(data, {
          status: 200,
          headers: {
            'Content-Type': inferContentType(parsed.objectPath),
            'Cache-Control': CACHE_CONTROL,
          },
        })
      }
    } catch (error) {
      console.warn('[Image Proxy] service download fallback to fetch:', error)
    }

    const response = await fetch(imageUrl.toString(), {
      headers: {
        Accept: 'image/*',
      },
    })

    if (!response.ok) {
      return NextResponse.json(
        {
          error: `Failed to fetch image: ${response.status}`,
          status: response.status,
          statusText: response.statusText,
        },
        { status: response.status }
      )
    }

    const contentType = response.headers.get('content-type') || 'application/octet-stream'
    if (!contentType.toLowerCase().startsWith('image/')) {
      return NextResponse.json({ error: 'Upstream resource is not an image' }, { status: 415 })
    }

    const imageBuffer = await response.arrayBuffer()

    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': CACHE_CONTROL,
      },
    })
  } catch (error) {
    console.error('[Image Proxy] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Proxy failed' },
      { status: 500 }
    )
  }
}
