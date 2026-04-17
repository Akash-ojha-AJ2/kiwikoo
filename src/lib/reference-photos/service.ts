import 'server-only'

import type { PhotoAnalysis, PhotoRecommendation, ReferencePhoto, ReferencePhotoSource } from './types'
import { MIN_LIBRARY_PHOTOS, toClient } from './types'
import { analyzeReferencePhoto, computeSelectionScore, rankPhotosForTryOn } from './scoring'

interface ProfileImageCandidate {
  id?: string
  url?: string
  imageUrl?: string
  isPrimary?: boolean
}

type ServiceClient = ReturnType<typeof import('@/lib/auth').createServiceClient>

function normalizeProfileImages(rawImages: unknown): Array<{ imageUrl: string; isPrimary: boolean }> {
  if (!Array.isArray(rawImages)) return []

  return rawImages
    .map((item, index) => {
      if (typeof item === 'string') {
        return {
          imageUrl: item,
          isPrimary: index === 0,
        }
      }

      const candidate = item as ProfileImageCandidate
      const imageUrl = candidate.url || candidate.imageUrl
      if (!imageUrl) return null

      return {
        imageUrl,
        isPrimary: Boolean(candidate.isPrimary || index === 0),
      }
    })
    .filter((item): item is { imageUrl: string; isPrimary: boolean } => Boolean(item?.imageUrl))
}

function buildMigratedAnalysis(
  source: ReferencePhotoSource,
  legacyType?: string | null
): { analysis: PhotoAnalysis | null; qualityScore: number | null; approvedForTryOn: boolean } {
  if (source === 'migrated_identity') {
    const isBody = typeof legacyType === 'string' && legacyType.startsWith('body_')

    const analysis: PhotoAnalysis = {
      faceDetectionConfidence: isBody ? 0.82 : 0.9,
      faceCount: 1,
      sharpness: 0.72,
      lightingQuality: 0.7,
      bodyVisibility: isBody ? 'full' : 'face_only',
      framing: isBody ? 'full_body' : 'portrait',
      faceOccluded: false,
      heavyAccessories: false,
      garmentSwapSuitability: isBody ? 0.92 : 0.28,
      rejectionNote: isBody ? undefined : 'Legacy face-only reference; not used as a clothing-swap source photo.',
    }

    return {
      analysis,
      qualityScore: computeSelectionScore(analysis),
      approvedForTryOn: false,
    }
  }

  const analysis: PhotoAnalysis = {
    faceDetectionConfidence: 0.72,
    faceCount: 1,
    sharpness: 0.66,
    lightingQuality: 0.68,
    bodyVisibility: 'upper',
    framing: 'half',
    faceOccluded: false,
    heavyAccessories: false,
    garmentSwapSuitability: 0.72,
  }

  return {
    analysis,
    qualityScore: computeSelectionScore(analysis),
    approvedForTryOn: false,
  }
}

export async function listReferencePhotosForUser(
  service: ServiceClient,
  userId: string
): Promise<ReferencePhoto[]> {
  const { data, error } = await service
    .from('reference_photos')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data || []) as ReferencePhoto[]
}

export async function getApprovedReferencePhotoCount(
  service: ServiceClient,
  userId: string
): Promise<number> {
  const { count, error } = await service
    .from('reference_photos')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_active', true)
    .eq('source', 'app_upload')
    .eq('approved_for_tryon', true)
    .eq('status', 'approved')

  if (error) throw error
  return count || 0
}

export async function syncLegacyReferencePhotos(
  service: ServiceClient,
  userId: string
): Promise<{ inserted: number }> {
  const [{ data: existingRows, error: existingError }, { data: profile, error: profileError }] =
    await Promise.all([
      service
        .from('reference_photos')
        .select('image_url')
        .eq('user_id', userId),
      service
        .from('influencer_profiles')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle(),
    ])

  if (existingError) throw existingError
  if (profileError && profileError.code !== 'PGRST116') throw profileError

  const existingUrls = new Set((existingRows || []).map((row: any) => String(row.image_url)))
  const inserts: Array<Record<string, unknown>> = []

  // Skip profile_images since the column doesn't exist in the current DB schema.

  if (profile?.id) {
    const { data: identityRows, error: identityError } = await service
      .from('identity_images')
      .select('image_url, image_path, image_type')
      .eq('influencer_profile_id', profile.id)
      .eq('is_active', true)

    if (identityError) throw identityError

    for (const row of identityRows || []) {
      const imageUrl = String((row as any).image_url || '')
      if (!imageUrl || existingUrls.has(imageUrl)) continue
      const migrated = buildMigratedAnalysis('migrated_identity', (row as any).image_type || null)
      const rejectionReasons = [
        'Migrated legacy reference. Upload fresh in-app source photos before using the presetless try-on pipeline.',
      ]

      inserts.push({
        user_id: userId,
        image_url: imageUrl,
        image_path: (row as any).image_path || null,
        source: 'migrated_identity',
        status: 'approved',
        quality_score: migrated.qualityScore,
        analysis: migrated.analysis,
        approved_for_tryon: migrated.approvedForTryOn,
        rejection_reasons: rejectionReasons,
        is_active: true,
      })
      existingUrls.add(imageUrl)
    }
  }

  if (inserts.length === 0) {
    return { inserted: 0 }
  }

  const { error: insertError } = await service
    .from('reference_photos')
    .upsert(inserts, { onConflict: 'user_id,image_url' })

  if (insertError) throw insertError

  return { inserted: inserts.length }
}

export async function getReferencePhotoLibrary(
  service: ServiceClient,
  userId: string
): Promise<{
  photos: ReturnType<typeof toClient>[]
  approvedCount: number
  totalCount: number
  isReadyForTryOn: boolean
  minRequired: number
  photosNeeded: number
  migratedCount: number
}> {
  const migration = await syncLegacyReferencePhotos(service, userId)
  const rows = await listReferencePhotosForUser(service, userId)
  const photos = rows.map((row) => toClient(row, { selectionScore: computeSelectionScore(row.analysis) }))
  const approvedCount = rows.filter(
    (row) => row.source === 'app_upload' && row.approved_for_tryon && row.status === 'approved'
  ).length

  return {
    photos,
    approvedCount,
    totalCount: rows.length,
    isReadyForTryOn: approvedCount >= MIN_LIBRARY_PHOTOS,
    minRequired: MIN_LIBRARY_PHOTOS,
    photosNeeded: Math.max(0, MIN_LIBRARY_PHOTOS - approvedCount),
    migratedCount: migration.inserted,
  }
}

export async function getReferencePhotoRecommendations(
  service: ServiceClient,
  userId: string
): Promise<PhotoRecommendation> {
  await syncLegacyReferencePhotos(service, userId)
  const rows = await listReferencePhotosForUser(service, userId)
  return rankPhotosForTryOn(rows.filter((row) => row.source === 'app_upload'))
}

export async function getReferencePhotosByIds(
  service: ServiceClient,
  userId: string,
  photoIds: string[]
): Promise<ReferencePhoto[]> {
  if (photoIds.length === 0) return []

  const { data, error } = await service
    .from('reference_photos')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .in('id', photoIds)

  if (error) throw error
  return (data || []) as ReferencePhoto[]
}

export async function fetchReferencePhotoAsBase64(imageUrl: string): Promise<string> {
  const response = await fetch(imageUrl)
  if (!response.ok) {
    throw new Error(`Failed to fetch reference photo (${response.status})`)
  }

  const buffer = Buffer.from(await response.arrayBuffer())
  return buffer.toString('base64')
}

export async function analyzeAndUpdateReferencePhoto(
  service: ServiceClient,
  userId: string,
  photoId: string,
  imageBase64: string
): Promise<void> {
  const { analysis, qualityScore, approved, approvedForTryOn, rejectionReasons } =
    await analyzeReferencePhoto(imageBase64)

  const { error } = await service
    .from('reference_photos')
    .update({
      analysis,
      quality_score: qualityScore,
      status: approved ? 'approved' : 'rejected',
      approved_for_tryon: approvedForTryOn,
      rejection_reasons: rejectionReasons,
      updated_at: new Date().toISOString(),
    })
    .eq('id', photoId)
    .eq('user_id', userId)

  if (error) {
    throw error
  }

  try {
    const { extractIdentityEmbedding } = await import('@/lib/tryon/identity-embedding')
    await extractIdentityEmbedding(userId)
  } catch (embeddingError) {
    console.warn('[reference-photos] identity embedding refresh failed:', embeddingError)
  }
}
