/**
 * Garment Asset system – canonical, deduplicated garment storage.
 *
 * Garments are IMMUTABLE: we never overwrite existing records. Deduplication
 * by image_hash is critical for cost control (extract once, reuse across
 * users and influencers). Do not modify generation pipelines; use these
 * helpers only for storage and lookup.
 */

import { createServiceClient } from '@/lib/auth'
import { createHash } from 'crypto'

/** Row shape from public.garments (Supabase). */
export interface GarmentRow {
  id: string
  product_id: string | null
  image_hash: string
  clean_garment_image_url: string
  source_image_url: string
  garment_metadata: Record<string, unknown>
  verified: boolean
  created_at: string
}

/** Payload for creating a garment when it does not already exist. */
export interface CreateGarmentPayload {
  product_id?: string | null
  image_hash: string
  clean_garment_image_url: string
  source_image_url: string
  garment_metadata?: Record<string, unknown> | null
  verified?: boolean
}

/**
 * Compute a deterministic SHA-256 hash of the clothing reference image.
 * Call this BEFORE any Flash/extraction call so the same image always
 * yields the same hash for deduplication.
 *
 * @param imageData - Base64-encoded image string or raw buffer
 * @returns Hex-encoded SHA-256 hash
 */
export function hashImageForGarment(imageData: string | Buffer): string {
  const buffer =
    typeof imageData === 'string'
      ? Buffer.from(imageData, 'base64')
      : imageData
  return createHash('sha256').update(buffer).digest('hex')
}

/**
 * Look up a garment by its image hash. Returns null if not found.
 * Idempotent read-only.
 */
export async function getGarmentByHash(hash: string): Promise<GarmentRow | null> {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('garments')
    .select('*')
    .eq('image_hash', hash)
    .maybeSingle()

  if (error) {
    console.error('[garments] getGarmentByHash error:', error.message)
    return null
  }
  return data as GarmentRow | null
}

/**
 * Create a garment only if no row with the same image_hash exists.
 * Returns the existing row if found; otherwise inserts and returns the new row.
 * Never overwrites existing garments (idempotent, safe for cost control).
 */
export async function createGarmentIfNotExists(
  payload: CreateGarmentPayload
): Promise<{ garment: GarmentRow; created: boolean }> {
  const supabase = createServiceClient()

  const existing = await getGarmentByHash(payload.image_hash)
  if (existing) {
    return { garment: existing, created: false }
  }

  const { data: inserted, error } = await supabase
    .from('garments')
    .insert({
      product_id: payload.product_id ?? null,
      image_hash: payload.image_hash,
      clean_garment_image_url: payload.clean_garment_image_url,
      source_image_url: payload.source_image_url,
      garment_metadata: payload.garment_metadata ?? {},
      verified: payload.verified ?? false,
    })
    .select()
    .single()

  if (error) {
    // Concurrent insert: another request may have created the same hash.
    if (error.code === '23505') {
      const again = await getGarmentByHash(payload.image_hash)
      if (again) return { garment: again, created: false }
    }
    console.error('[garments] createGarmentIfNotExists insert error:', error.message)
    throw new Error(`Failed to create garment: ${error.message}`)
  }

  return { garment: inserted as GarmentRow, created: true }
}

/**
 * Fetch an image from a URL and return as base64 (for feeding pipelines that expect base64).
 * Used when reusing a cached garment's clean_garment_image_url.
 */
export async function fetchImageAsBase64(url: string): Promise<string> {
  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) throw new Error(`Failed to fetch image: ${res.status}`)
  const buf = Buffer.from(await res.arrayBuffer())
  return buf.toString('base64')
}

/**
 * List garments associated with a product. Returns empty array if none or on error.
 * Idempotent read-only.
 */
export async function getGarmentsByProduct(
  product_id: string
): Promise<GarmentRow[]> {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('garments')
    .select('*')
    .eq('product_id', product_id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[garments] getGarmentsByProduct error:', error.message)
    return []
  }
  return (data ?? []) as GarmentRow[]
}
