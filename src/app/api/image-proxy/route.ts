import { createServiceClient } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

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

function normalizeHost(value: string): string {
  return value.trim().toLowerCase()
}

function getSupabaseHost(): string | null {
  const raw = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim()
  if (!raw) return null

  try {
    return normalizeHost(new URL(raw).hostname)
  } catch {
    return null
  }
}

function getAllowedHosts(): Set<string> {
  const envHosts = (process.env.IMAGE_PROXY_ALLOWED_HOSTS || '')
    .split(',')
    .map(normalizeHost)
    .filter(Boolean)

  const hosts = new Set<string>(envHosts)
  const supabaseHost = getSupabaseHost()
  if (supabaseHost) {
    hosts.add(supabaseHost)
  }

  return hosts
}

function isPrivateIpv4(hostname: string): boolean {
  const parts = hostname.split('.').map((part) => Number(part))
  if (parts.length !== 4 || parts.some((part) => Number.isNaN(part) || part < 0 || part > 255)) {
    return false
  }

  const [a, b] = parts
  if (a === 10) return true
  if (a === 127) return true
  if (a === 0) return true
  if (a === 169 && b === 254) return true
  if (a === 172 && b >= 16 && b <= 31) return true
  if (a === 192 && b === 168) return true
  return false
}

function isBlockedHost(hostname: string): boolean {
  const host = normalizeHost(hostname)
  return (
    host === 'localhost' ||
    host === '0.0.0.0' ||
    host.endsWith('.local') ||
    host.endsWith('.internal') ||
    host.includes(':') ||
    isPrivateIpv4(host)
  )
}

function isAllowedHost(target: URL, allowedHosts: Set<string>): boolean {
  const host = normalizeHost(target.hostname)
  if (!host || isBlockedHost(host)) return false
  return allowedHosts.has(host)
}

function getAllowedBuckets(): Set<string> {
  const configured = (process.env.IMAGE_PROXY_ALLOWED_BUCKETS || '')
    .split(',')
    .map((bucket) => bucket.trim())
    .filter(Boolean)

  if (configured.length > 0) {
    return new Set(configured)
  }

  return new Set(DEFAULT_ALLOWED_BUCKETS)
}

function parseSupabasePublicObject(target: URL): { bucket: string; objectPath: string } | null {
  const parts = target.pathname.split('/').filter(Boolean)
  if (parts.length < 6) return null
  if (parts[0] !== 'storage' || parts[1] !== 'v1' || parts[2] !== 'object' || parts[3] !== 'public') {
    return null
  }

  const bucket = parts[4]
  const objectPath = parts.slice(5).join('/')
  if (!bucket || !objectPath) return null

  return {
    bucket: decodeURIComponent(bucket),
    objectPath: decodeURIComponent(objectPath),
  }
}

function inferContentTypeFromPath(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase()
  if (ext === 'png') return 'image/png'
  if (ext === 'webp') return 'image/webp'
  if (ext === 'gif') return 'image/gif'
  if (ext === 'avif') return 'image/avif'
  return 'image/jpeg'
}

export async function GET(req: NextRequest) {
  const rawUrl = req.nextUrl.searchParams.get('url')
  if (!rawUrl) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 })
  }

  let target: URL
  try {
    target = new URL(rawUrl)
  } catch {
    return NextResponse.json({ error: 'Invalid url parameter' }, { status: 400 })
  }

  if (!['http:', 'https:'].includes(target.protocol)) {
    return NextResponse.json({ error: 'Unsupported URL protocol' }, { status: 400 })
  }

  const allowedHosts = getAllowedHosts()
  if (!isAllowedHost(target, allowedHosts)) {
    return NextResponse.json({ error: 'URL host is not allowed' }, { status: 400 })
  }

  try {
    const supabaseHost = getSupabaseHost()
    const isSupabaseHost = supabaseHost && normalizeHost(target.hostname) === supabaseHost

    if (isSupabaseHost) {
      const parsed = parseSupabasePublicObject(target)
      if (parsed) {
        const allowedBuckets = getAllowedBuckets()
        if (!allowedBuckets.has(parsed.bucket)) {
          return NextResponse.json({ error: 'Storage bucket is not allowed' }, { status: 400 })
        }

        try {
          const supabase = createServiceClient()
          const { data, error } = await supabase.storage
            .from(parsed.bucket)
            .download(parsed.objectPath)

          if (!error && data) {
            return new NextResponse(data, {
              headers: {
                'Content-Type': inferContentTypeFromPath(parsed.objectPath),
                'Cache-Control': CACHE_CONTROL,
              },
            })
          }
        } catch (error) {
          console.warn('Service download failed, falling back to fetch:', error)
        }
      }
    }

    const response = await fetch(target.toString(), {
      redirect: 'manual',
    })

    if (response.status >= 300 && response.status < 400) {
      return NextResponse.json({ error: 'Upstream redirects are not allowed' }, { status: 400 })
    }

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch image: ${response.status}` },
        { status: response.status }
      )
    }

    const contentType = response.headers.get('content-type') || 'application/octet-stream'
    if (!contentType.toLowerCase().startsWith('image/')) {
      return NextResponse.json({ error: 'Upstream resource is not an image' }, { status: 415 })
    }

    return new NextResponse(response.body, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': CACHE_CONTROL,
      },
    })
  } catch (error) {
    console.error('Image proxy error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
