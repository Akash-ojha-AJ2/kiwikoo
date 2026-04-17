/**
 * Canonical reference-photo types for presetless influencer try-on.
 */

export type ReferencePhotoSource =
  | 'app_upload'
  | 'migrated_profile'
  | 'migrated_identity'

export type ReferencePhotoStatus = 'pending' | 'approved' | 'rejected'

export interface PhotoAnalysis {
  faceDetectionConfidence: number
  faceCount: number
  faceBbox?: { x: number; y: number; w: number; h: number }
  sharpness: number
  lightingQuality: number
  bodyVisibility: 'full' | 'upper' | 'face_only' | 'none'
  framing: 'portrait' | 'half' | 'full_body' | 'group'
  faceOccluded: boolean
  heavyAccessories: boolean
  garmentSwapSuitability: number
  rejectionNote?: string
}

export interface ReferencePhoto {
  id: string
  user_id: string
  image_url: string
  image_path: string | null
  source: ReferencePhotoSource
  status: ReferencePhotoStatus
  quality_score: number | null
  analysis: PhotoAnalysis | null
  approved_for_tryon: boolean
  rejection_reasons: string[]
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ReferencePhotoClient {
  id: string
  imageUrl: string
  source: ReferencePhotoSource
  status: ReferencePhotoStatus
  qualityScore: number | null
  selectionScore: number | null
  analysis: PhotoAnalysis | null
  approvedForTryOn: boolean
  rejectionReasons: string[]
  createdAt: string
  updatedAt: string
}

export interface PhotoRecommendation {
  selected: ReferencePhotoClient[]
  alternates: ReferencePhotoClient[]
  totalApproved: number
  isReadyForTryOn: boolean
  minRequired: number
  photosNeeded: number
}

export const MIN_LIBRARY_PHOTOS = 5

export function toClient(
  row: ReferencePhoto,
  extras?: { selectionScore?: number | null }
): ReferencePhotoClient {
  return {
    id: row.id,
    imageUrl: row.image_url,
    source: row.source,
    status: row.status,
    qualityScore: row.quality_score,
    selectionScore: extras?.selectionScore ?? null,
    analysis: row.analysis,
    approvedForTryOn: row.approved_for_tryon,
    rejectionReasons: row.rejection_reasons || [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}
