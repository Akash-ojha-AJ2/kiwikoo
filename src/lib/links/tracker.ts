import { createHash } from 'crypto'

export interface ClickMetadata {
  ipAddress?: string
  userAgent?: string
  referrer?: string
  deviceType?: 'mobile' | 'desktop' | 'tablet'
  country?: string
}

/**
 * Hash IP address for privacy (SHA-256)
 */
export function hashIP(ip: string): string {
  return createHash('sha256').update(ip).digest('hex')
}

/**
 * Detect device type from user agent
 */
export function detectDeviceType(userAgent: string | null): 'mobile' | 'desktop' | 'tablet' | undefined {
  if (!userAgent) return undefined

  const ua = userAgent.toLowerCase()

  // Check for mobile devices
  if (/mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(ua)) {
    // Check if it's a tablet
    if (/tablet|ipad|playbook|silk/i.test(ua)) {
      return 'tablet'
    }
    return 'mobile'
  }

  // Check for tablets
  if (/tablet|ipad|playbook|silk/i.test(ua)) {
    return 'tablet'
  }

  // Default to desktop
  return 'desktop'
}

/**
 * Extract click metadata from request
 */
export async function extractClickMetadata(request: Request): Promise<ClickMetadata> {
  const headers = request.headers

  // Get IP address (check various headers for proxy/load balancer)
  const forwardedFor = headers.get('x-forwarded-for')
  const realIP = headers.get('x-real-ip')
  const ip = forwardedFor?.split(',')[0]?.trim() || realIP || 'unknown'

  // Get user agent
  const userAgent = headers.get('user-agent') || undefined

  // Get referrer
  const referrer = headers.get('referer') || headers.get('referrer') || undefined

  // Detect device type
  const deviceType = detectDeviceType(userAgent || null)

  // Hash IP for privacy
  const hashedIP = ip !== 'unknown' ? hashIP(ip) : undefined

  // TODO: Add country detection using IP geolocation service if needed
  // For now, we'll leave it undefined

  return {
    ipAddress: hashedIP,
    userAgent,
    referrer,
    deviceType,
    country: undefined, // Can be added later with geolocation service
  }
}

