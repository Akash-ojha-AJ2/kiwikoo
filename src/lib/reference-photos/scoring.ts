/**
 * Reference-photo analysis and recommendation scoring.
 */

import 'server-only'

import type {
  PhotoAnalysis,
  PhotoRecommendation,
  ReferencePhoto,
  ReferencePhotoClient,
} from './types'
import { MIN_LIBRARY_PHOTOS, toClient } from './types'

const WEIGHT_FACE_CLARITY = 0.28
const WEIGHT_GARMENT_SUITABILITY = 0.3
const WEIGHT_BODY_VISIBILITY = 0.22
const WEIGHT_SHARPNESS = 0.1
const WEIGHT_LIGHTING = 0.1

const BODY_VISIBILITY_SCORES: Record<PhotoAnalysis['bodyVisibility'], number> = {
  full: 1,
  upper: 0.72,
  face_only: 0.24,
  none: 0,
}

type FramingBucket = PhotoAnalysis['framing']

function clampUnit(value: number): number {
  if (!Number.isFinite(value)) return 0
  return Math.max(0, Math.min(1, value))
}

export function computeSelectionScore(analysis: PhotoAnalysis | null): number {
  if (!analysis) return 0.46

  const faceClarity =
    analysis.faceCount === 1 && !analysis.faceOccluded && !analysis.heavyAccessories
      ? analysis.faceDetectionConfidence
      : analysis.faceDetectionConfidence * 0.3

  return clampUnit(
    faceClarity * WEIGHT_FACE_CLARITY +
      clampUnit(analysis.garmentSwapSuitability) * WEIGHT_GARMENT_SUITABILITY +
      BODY_VISIBILITY_SCORES[analysis.bodyVisibility] * WEIGHT_BODY_VISIBILITY +
      clampUnit(analysis.sharpness) * WEIGHT_SHARPNESS +
      clampUnit(analysis.lightingQuality) * WEIGHT_LIGHTING
  )
}

function getDiversityPenalty(bucket: FramingBucket, usedBuckets: Set<FramingBucket>): number {
  if (!usedBuckets.has(bucket)) return 0
  if (bucket === 'full_body') return 0.04
  if (bucket === 'half') return 0.08
  return 0.12
}

export function rankPhotosForTryOn(
  approvedPhotos: ReferencePhoto[],
  maxPicks = 3,
  maxAlternates = 5
): PhotoRecommendation {
  const candidates = approvedPhotos
    .filter((photo) => photo.is_active && photo.approved_for_tryon && photo.status === 'approved')
    .map((photo) => ({
      photo,
      baseScore: computeSelectionScore(photo.analysis),
      framing: (photo.analysis?.framing || 'half') as FramingBucket,
    }))
    .sort((a, b) => b.baseScore - a.baseScore)

  const selected: Array<(typeof candidates)[number] & { selectionScore: number }> = []
  const alternates: Array<(typeof candidates)[number] & { selectionScore: number }> = []
  const usedBuckets = new Set<FramingBucket>()

  for (const candidate of candidates) {
    const adjustedScore = clampUnit(candidate.baseScore - getDiversityPenalty(candidate.framing, usedBuckets))
    const scoredCandidate = { ...candidate, selectionScore: adjustedScore }

    if (selected.length < maxPicks) {
      selected.push(scoredCandidate)
      usedBuckets.add(candidate.framing)
      continue
    }

    if (alternates.length < maxAlternates) {
      alternates.push(scoredCandidate)
    }
  }

  const selectedClients: ReferencePhotoClient[] = selected
    .sort((a, b) => b.selectionScore - a.selectionScore)
    .map(({ photo, selectionScore }) => toClient(photo, { selectionScore }))

  const alternateClients: ReferencePhotoClient[] = alternates
    .sort((a, b) => b.selectionScore - a.selectionScore)
    .map(({ photo, selectionScore }) => toClient(photo, { selectionScore }))

  const totalApproved = candidates.length
  const isReadyForTryOn = totalApproved >= MIN_LIBRARY_PHOTOS

  return {
    selected: selectedClients,
    alternates: alternateClients,
    totalApproved,
    isReadyForTryOn,
    minRequired: MIN_LIBRARY_PHOTOS,
    photosNeeded: Math.max(0, MIN_LIBRARY_PHOTOS - totalApproved),
  }
}

export async function analyzeReferencePhoto(
  imageBase64: string
): Promise<{
  analysis: PhotoAnalysis
  qualityScore: number
  approved: boolean
  approvedForTryOn: boolean
  rejectionReasons: string[]
}> {
  const rejectionReasons: string[] = []

  let faceDetectionConfidence = 0.58
  let faceCount = 1
  let faceBbox: PhotoAnalysis['faceBbox'] | undefined

  const faceSwapUrl = process.env.FACE_SWAP_SERVICE_URL?.trim()
  if (faceSwapUrl) {
    try {
      const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '')
      const response = await fetch(`${faceSwapUrl}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: cleanBase64 }),
        signal: AbortSignal.timeout(15000),
      })

      if (response.ok) {
        const data = await response.json()
        faceCount = Number(data.face_count ?? 1)
        faceDetectionConfidence = Number(data.confidence ?? faceDetectionConfidence)
        if (data.bbox) {
          faceBbox = {
            x: Number(data.bbox.x ?? 0),
            y: Number(data.bbox.y ?? 0),
            w: Number(data.bbox.w ?? 0),
            h: Number(data.bbox.h ?? 0),
          }
        }
      }
    } catch (error) {
      console.warn('[reference-photos] analyze fallback used:', error)
    }
  }

  const bboxHeight = faceBbox?.h ?? 0.36
  const bodyVisibility: PhotoAnalysis['bodyVisibility'] =
    bboxHeight < 0.24 ? 'full' : bboxHeight < 0.42 ? 'upper' : bboxHeight < 0.72 ? 'face_only' : 'none'
  const framing: PhotoAnalysis['framing'] =
    bodyVisibility === 'full'
      ? 'full_body'
      : bodyVisibility === 'upper'
        ? 'half'
        : faceCount > 1
          ? 'group'
          : 'portrait'

  const faceOccluded = faceDetectionConfidence < 0.35
  const heavyAccessories = false
  const garmentSwapSuitability =
    bodyVisibility === 'full' ? 0.96 : bodyVisibility === 'upper' ? 0.78 : bodyVisibility === 'face_only' ? 0.28 : 0.05
  const sharpness = bodyVisibility === 'none' ? 0.35 : 0.72
  const lightingQuality = bodyVisibility === 'none' ? 0.4 : 0.74

  if (faceCount === 0) rejectionReasons.push('No face detected')
  if (faceCount > 1) rejectionReasons.push('Multiple faces detected')
  if (faceDetectionConfidence < 0.25) rejectionReasons.push('Face is too unclear or heavily occluded')
  if (bodyVisibility === 'none') rejectionReasons.push('Body is not visible enough for clothing swap')

  const analysis: PhotoAnalysis = {
    faceDetectionConfidence: clampUnit(faceDetectionConfidence),
    faceCount,
    faceBbox,
    sharpness: clampUnit(sharpness),
    lightingQuality: clampUnit(lightingQuality),
    bodyVisibility,
    framing,
    faceOccluded,
    heavyAccessories,
    garmentSwapSuitability: clampUnit(garmentSwapSuitability),
    rejectionNote: rejectionReasons[0],
  }

  const qualityScore = computeSelectionScore(analysis)
  const approved = rejectionReasons.length === 0 || rejectionReasons.every((reason) => reason === 'Body is not visible enough for clothing swap')
  const approvedForTryOn = approved && analysis.garmentSwapSuitability >= 0.6

  return {
    analysis,
    qualityScore,
    approved,
    approvedForTryOn,
    rejectionReasons,
  }
}
