'use client'

import { useState, useEffect, useCallback, useTransition, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { AppImage } from '@/components/ui/AppImage'
import { toast } from '@/lib/simple-sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowRight, Loader2, Upload, Trash2, ImagePlus, RefreshCw } from 'lucide-react'

// Neo-Brutal Components
import { OnboardingCard } from '@/components/brutal/onboarding/OnboardingCard'
import { ChoiceChip } from '@/components/brutal/onboarding/ChoiceChip'
import { BrutalInput, BrutalTextarea } from '@/components/brutal/onboarding/BrutalInput'
import { DecorativeShapes } from '@/components/brutal/onboarding/DecorativeShapes'
import { getGenerationTagFromDob, normalizeDateOfBirth } from '@/lib/profile-demographics'

const CATEGORY_OPTIONS = ['Casual', 'Formal', 'Streetwear', 'Vintage', 'Sustainable', 'Luxury', 'Athleisure']
const TOTAL_STEPS = 5

type ReferencePhotoSource = 'app_upload' | 'migrated_profile' | 'migrated_identity'
type ReferencePhotoStatus = 'pending' | 'approved' | 'rejected'
type IdentityImageType = 'face_front' | 'face_left' | 'face_right' | 'face_smile' | 'body_front' | 'body_left' | 'body_right'

interface ReferencePhotoAnalysis {
  faceDetectionConfidence: number
  faceCount: number
  sharpness: number
  lightingQuality: number
  bodyVisibility: 'full' | 'upper' | 'face_only' | 'none'
  framing: 'portrait' | 'half' | 'full_body' | 'group'
  faceOccluded: boolean
  heavyAccessories: boolean
  garmentSwapSuitability: number
  rejectionNote?: string
}

interface ReferencePhoto {
  id: string
  imageUrl: string
  source: ReferencePhotoSource
  status: ReferencePhotoStatus
  qualityScore: number | null
  analysis: ReferencePhotoAnalysis | null
  approvedForTryOn: boolean
  rejectionReasons: string[]
  createdAt: string
}

interface ReferencePhotosResponse {
  photos: ReferencePhoto[]
  totalCount: number
  approvedCount: number
  isReadyForTryOn: boolean
  minRequired: number
  photosNeeded: number
}

export default function InfluencerOnboardingPage() {
  const router = useRouter()
  const [isResubmissionMode, setIsResubmissionMode] = useState(false)
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [dataLoaded, setDataLoaded] = useState(false)
  const [redirectChecking, setRedirectChecking] = useState(true)

  // Identity images state
  const [identityImages, setIdentityImages] = useState<Record<IdentityImageType, { file?: File; url?: string; uploading?: boolean }>>({
    face_front: {},
    face_left: {},
    face_right: {},
    face_smile: {},
    body_front: {},
    body_left: {},
    body_right: {},
  })
  const [identityProgress, setIdentityProgress] = useState(0)
  const [referencePhotos, setReferencePhotos] = useState<ReferencePhoto[]>([])
  const [referencePhotosLoading, setReferencePhotosLoading] = useState(false)
  const [referencePhotosReady, setReferencePhotosReady] = useState(false)
  const [referenceMinRequired, setReferenceMinRequired] = useState(5)
  const [referenceApprovedCount, setReferenceApprovedCount] = useState(0)
  const [referencePhotosNeeded, setReferencePhotosNeeded] = useState(5)
  const [referenceUploadProgress, setReferenceUploadProgress] = useState(0)
  const [referenceUploading, setReferenceUploading] = useState(false)
  const [referenceDeletingId, setReferenceDeletingId] = useState<string | null>(null)
  const referenceInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    email: '',
    gender: '',
    niches: [] as string[],
    audienceType: [] as string[],
    preferredCategories: [] as string[],
    socials: {
      instagram: '',
      youtube: '',
      snapchat: '',
      facebook: '',
    },
    bio: '',
  })

  const [emailConfirmed, setEmailConfirmed] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    setIsResubmissionMode(params.get('mode') === 'resubmit')
  }, [])

  useEffect(() => {
    let cancelled = false

    const loadData = async () => {
      try {
        const res = await fetch('/api/onboarding/influencer')
        const data = await res.json().catch(() => ({}))
        if (cancelled) return

        const approvalStatus = String(data?.approvalStatus || 'none').toLowerCase()
        const allowResubmission = approvalStatus === 'rejected' || isResubmissionMode
        const existingFullName = String(data?.fullName || '').trim()
        const [firstName = '', ...lastNameParts] = existingFullName.split(/\s+/).filter(Boolean)
        const lastName = lastNameParts.join(' ')

        if (data.onboardingCompleted && !allowResubmission) {
          setRedirectChecking(false)
          if (approvalStatus === 'approved') {
            router.replace('/marketplace')
          } else {
            router.replace('/influencer/pending')
          }
          return
        }

        if (data.profile) {
          const existingSocials = (data.profile.socials as Record<string, string>) || {}
          setFormData({
            firstName,
            lastName,
            dateOfBirth: String(data?.dateOfBirth || ''),
            email: String(data?.email || ''),
            gender: data.profile.gender || '',
            niches: (data.profile.niches as string[]) || [],
            audienceType: (data.profile.audienceType as string[]) || [],
            preferredCategories: (data.profile.preferredCategories as string[]) || [],
            socials: {
              instagram: existingSocials.instagram || '',
              youtube: existingSocials.youtube || '',
              snapchat: existingSocials.snapchat || '',
              facebook: existingSocials.facebook || '',
            },
            bio: data.profile.bio || '',
          })
        } else {
          setFormData((prev) => ({
            ...prev,
            firstName,
            lastName,
            dateOfBirth: String(data?.dateOfBirth || prev.dateOfBirth || ''),
            email: String(data?.email || prev.email || ''),
          }))
        }

        setDataLoaded(true)
      } catch {
        if (!cancelled) {
          toast.error('Failed to load onboarding data')
          setDataLoaded(true)
        }
      } finally {
        if (!cancelled) {
          setRedirectChecking(false)
        }
      }

      fetch('/api/identity-images')
        .then((res) => res.json())
        .then((data) => {
          if (cancelled) return
          if (data.images) {
            const existing: Record<IdentityImageType, { url?: string }> = {} as Record<IdentityImageType, { url?: string }>
            for (const img of data.images) {
              existing[img.imageType as IdentityImageType] = { url: img.imageUrl }
            }
            setIdentityImages(prev => ({ ...prev, ...existing }))
          }
        })
        .catch(() => { })
    }

    void loadData()

    return () => {
      cancelled = true
    }
  }, [router, isResubmissionMode])

  // Background save progress (non-blocking)
  const saveProgressInBackground = useCallback(() => {
    fetch('/api/onboarding/influencer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    }).catch(err => console.warn('Background save failed:', err))
  }, [formData])

  const fetchReferencePhotos = useCallback(async () => {
    setReferencePhotosLoading(true)
    try {
      const res = await fetch('/api/reference-photos', { credentials: 'include' })
      if (!res.ok) return
      const data = await res.json()
      const payload = data as ReferencePhotosResponse
      setReferencePhotos(Array.isArray(payload.photos) ? payload.photos : [])
      setReferencePhotosReady(Boolean(payload.isReadyForTryOn))
      setReferenceMinRequired(Number(payload.minRequired || 5))
      setReferenceApprovedCount(Number(payload.approvedCount || 0))
      setReferencePhotosNeeded(Number(payload.photosNeeded || 0))
    } catch (error) {
      console.error('Failed to fetch reference photos:', error)
    } finally {
      setReferencePhotosLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchReferencePhotos()
  }, [fetchReferencePhotos])

  const prepareReferencePhotoForUpload = async (file: File): Promise<File> => {
    const maxEdge = 1200
    if (file.size <= 1.5 * 1024 * 1024 && file.type !== 'image/heic' && file.type !== 'image/heif') {
      return file
    }

    return await new Promise<File>((resolve, reject) => {
      const objectUrl = URL.createObjectURL(file)
      const img = new Image()

      img.onload = () => {
        try {
          const scale = Math.min(1, maxEdge / Math.max(img.width, img.height))
          const width = Math.max(1, Math.round(img.width * scale))
          const height = Math.max(1, Math.round(img.height * scale))

          const canvas = document.createElement('canvas')
          canvas.width = width
          canvas.height = height

          const ctx = canvas.getContext('2d')
          if (!ctx) {
            URL.revokeObjectURL(objectUrl)
            reject(new Error('Could not process image'))
            return
          }

          ctx.drawImage(img, 0, 0, width, height)
          canvas.toBlob((blob) => {
            URL.revokeObjectURL(objectUrl)
            if (!blob) {
              reject(new Error('Could not compress image'))
              return
            }
            resolve(new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' }))
          }, 'image/jpeg', 0.78)
        } catch (err) {
          URL.revokeObjectURL(objectUrl)
          reject(err instanceof Error ? err : new Error('Image compression failed'))
        }
      }

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl)
        reject(new Error('Failed to read image'))
      }

      img.src = objectUrl
    })
  }

  const handleReferencePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    e.currentTarget.value = ''
    if (files.length === 0) return

    setReferenceUploading(true)
    setReferenceUploadProgress(0)

    let uploadedCount = 0
    let failedCount = 0

    try {
      for (let index = 0; index < files.length; index += 1) {
        const file = files[index]
        if (!file.type.startsWith('image/')) {
          failedCount += 1
          continue
        }
        if (file.size > 15 * 1024 * 1024) {
          failedCount += 1
          continue
        }

        try {
          const uploadFile = await prepareReferencePhotoForUpload(file)
          const formData = new FormData()
          formData.append('file', uploadFile)

          const res = await fetch('/api/reference-photos', {
            method: 'POST',
            credentials: 'include',
            body: formData,
          })

          if (!res.ok) {
            const errBody = await res.json().catch(() => ({}))
            throw new Error(errBody.error || `Upload failed with status ${res.status}`)
          }

          uploadedCount += 1
        } catch (uploadError) {
          console.error('Reference photo upload error:', uploadError)
          failedCount += 1
        } finally {
          setReferenceUploadProgress(Math.round(((index + 1) / files.length) * 100))
        }
      }

      if (uploadedCount > 0) {
        toast.success(uploadedCount === 1 ? 'Reference photo uploaded' : `${uploadedCount} reference photos uploaded`)
      }
      if (failedCount > 0) {
        toast.error(failedCount === 1 ? 'One photo could not be uploaded' : `${failedCount} photos could not be uploaded`)
      }
      await fetchReferencePhotos()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to upload reference photos')
    } finally {
      setReferenceUploading(false)
      setReferenceUploadProgress(0)
    }
  }

  const handleReferencePhotoDelete = async (photoId: string) => {
    setReferenceDeletingId(photoId)
    try {
      const res = await fetch(`/api/reference-photos?id=${encodeURIComponent(photoId)}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}))
        throw new Error(errBody.error || 'Delete failed')
      }
      toast.success('Reference photo removed')
      await fetchReferencePhotos()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to remove reference photo')
    } finally {
      setReferenceDeletingId(null)
    }
  }

  const getReferenceSelectionScore = (photo: ReferencePhoto) => {
    const analysis = photo.analysis
    if (!analysis) return photo.qualityScore ?? 0.25

    const bodyVisibilityScore =
      analysis.bodyVisibility === 'full' ? 1 :
        analysis.bodyVisibility === 'upper' ? 0.7 :
          analysis.bodyVisibility === 'face_only' ? 0.35 : 0

    const faceClarity = analysis.faceCount === 1 && !analysis.faceOccluded && !analysis.heavyAccessories
      ? analysis.faceDetectionConfidence
      : analysis.faceDetectionConfidence * 0.35

    return (
      faceClarity * 0.35 +
      (analysis.garmentSwapSuitability || 0) * 0.3 +
      bodyVisibilityScore * 0.15 +
      analysis.sharpness * 0.1 +
      analysis.lightingQuality * 0.1 +
      (photo.qualityScore ?? 0) * 0.05
    )
  }

  const hasAtLeastOneSocial = useCallback(() => {
    const values = Object.values(formData.socials || {})
    return values.some((value) => String(value || '').trim().length > 0)
  }, [formData.socials])

  const getGenerationLabel = useCallback((dateString: string) => {
    const normalized = normalizeDateOfBirth(dateString)
    if (!normalized) return null
    const year = new Date(`${normalized}T00:00:00.000Z`).getUTCFullYear()
    if (!Number.isFinite(year)) return null
    const generationTag = getGenerationTagFromDob(normalized)
    if (!generationTag) return null
    return `${generationTag} (${year})`
  }, [])

  // Check if current step has required data filled
  const canProceed = () => {
    switch (step) {
      case 1:
        return Boolean(
          formData.firstName.trim() &&
          formData.lastName.trim() &&
          formData.dateOfBirth &&
          formData.gender
        )
      case 3:
        return formData.preferredCategories.length > 0

      case 4:
        return hasAtLeastOneSocial()
      case 5:
        return true
      case 6:
        return true
      default:
        return true
    }
  }

  // Optimistic step navigation
  const handleNext = () => {
    if (!canProceed()) {
      const messages: Record<number, string> = {
        1: 'Please complete your first name, last name, date of birth, and gender.',
        2: 'Please confirm your email to continue.',
        3: 'Please select at least one interest.',
        4: 'Please add at least one social account.',
      }
      toast.error(messages[step] || 'Please complete this step.')
      return
    }

    if (step < TOTAL_STEPS) {
      setStep(step + 1)
      startTransition(() => {
        saveProgressInBackground()
      })
    } else {
      handleSubmit()
    }
  }

  const handleBack = () => {
    if (step > 1) setStep(step - 1)
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/onboarding/influencer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to complete onboarding')
      }

      if (data.onboardingCompleted) {
        toast.success(isResubmissionMode ? 'Profile updated and resubmitted for review.' : 'Onboarding completed! Pending admin approval.', {
          style: { background: '#FFD93D', border: '2px solid black', color: 'black', fontWeight: 'bold' }
        })
        // Redirect to pending approval page (admin must approve before dashboard access)
        router.replace(typeof data.redirectTo === 'string' && data.redirectTo ? data.redirectTo : '/influencer/pending')
      } else {
        toast.error('Please fill all required fields')
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to complete onboarding')
    } finally {
      setLoading(false)
    }
  }

  const toggleSelection = (field: 'audienceType' | 'preferredCategories', value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((item) => item !== value)
        : [...prev[field], value],
    }))
  }

  const getStepTitle = () => {
    switch (step) {
      case 1: return 'About Yourself'
      case 2: return 'Your Interests'
      case 3: return 'Social Media'
      case 4: return 'Bio'
      case 5: return 'Reference Library'
      default: return 'Profile Setup'
    }
  }

  const getReferenceStatusLabel = (status: ReferencePhotoStatus) => {
    switch (status) {
      case 'approved': return { label: 'Approved', color: 'bg-[#B4F056]' }
      case 'rejected': return { label: 'Rejected', color: 'bg-[#FF9AA2]' }
      default: return { label: 'Pending', color: 'bg-[#FFD93D]' }
    }
  }

  const getReferenceSourceLabel = (source: ReferencePhotoSource) => {
    switch (source) {
      case 'migrated_profile': return 'Migrated profile photo'
      case 'migrated_identity': return 'Migrated identity photo'
      default: return 'App upload'
    }
  }

  const getSocialVerifyUrl = (platform: string, username: string) => {
    if (!username) return undefined
    const cleanUsername = username.replace(/^@/, '')
    switch (platform) {
      case 'instagram': return `https://instagram.com/${cleanUsername}`
      case 'youtube': return `https://youtube.com/@${cleanUsername}`
      case 'facebook': return `https://facebook.com/${cleanUsername}`
      case 'snapchat': return `https://www.snapchat.com/add/${cleanUsername}`
      default: return undefined
    }
  }

  if (redirectChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDF6EC]">
        <div className="text-center">
          <div className="w-16 h-16 border-[4px] border-[#FF8C69] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-black/60 font-bold">Checking your profile...</p>
        </div>
      </div>
    )
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <BrutalInput
                label="First Name"
                placeholder="Enter your first name"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              />
              <BrutalInput
                label="Last Name"
                placeholder="Enter your last name"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1.15fr_0.85fr]">
              <div className="space-y-1.5">
                <label className="ml-1 flex items-center gap-2 text-sm font-bold tracking-wide text-black">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  max={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  className="w-full rounded-xl border-[2px] border-black bg-white px-3 py-3 text-sm font-medium text-black focus:border-black focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:px-4 sm:py-6 sm:text-base"
                />
                {getGenerationLabel(formData.dateOfBirth) && (
                  <div className="inline-flex rounded-full border-[2px] border-black bg-[#FFF4CC] px-3 py-1 text-[11px] font-black uppercase tracking-[0.08em] text-black">
                    {getGenerationLabel(formData.dateOfBirth)}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <label className="ml-1 flex items-center gap-2 text-sm font-bold tracking-wide text-black">
                  Gender
                </label>
                <div className="flex flex-col gap-3">
                  {['Male', 'Female', 'Other'].map((option) => (
                    <ChoiceChip
                      key={option}
                      label={option}
                      selected={formData.gender === option}
                      onClick={() => setFormData({ ...formData, gender: option })}
                      icon={option === 'Male' ? '👨' : option === 'Female' ? '👩' : '🧑'}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )

      case 3:
        return formData.preferredCategories.length > 0

      case 3:
        return (
          <div className="space-y-3">
            <p className="text-sm font-bold text-black/60">
              Pick the style lanes and product spaces you are most interested in creating around.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {CATEGORY_OPTIONS.map((category) => (
              <ChoiceChip
                key={category}
                label={category}
                selected={formData.preferredCategories.includes(category)}
                onClick={() => toggleSelection('preferredCategories', category)}
              />
            ))}
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-5">
            <BrutalInput
              label="Instagram"
              icon={<span className="text-pink-500">📸</span>}
              placeholder="@your_username"
              value={formData.socials.instagram}
              onChange={(e) => setFormData({ ...formData, socials: { ...formData.socials, instagram: e.target.value } })}
              showVerify={Boolean(formData.socials.instagram)}
              verifyUrl={getSocialVerifyUrl('instagram', formData.socials.instagram)}
            />
            <BrutalInput
              label="YouTube"
              icon={<span className="text-red-500">▶️</span>}
              placeholder="Channel name"
              value={formData.socials.youtube}
              onChange={(e) => setFormData({ ...formData, socials: { ...formData.socials, youtube: e.target.value } })}
              showVerify={Boolean(formData.socials.youtube)}
              verifyUrl={getSocialVerifyUrl('youtube', formData.socials.youtube)}
            />
            <BrutalInput
              label="Snapchat"
              icon={<span>👻</span>}
              placeholder="username"
              value={formData.socials.snapchat}
              onChange={(e) => setFormData({ ...formData, socials: { ...formData.socials, snapchat: e.target.value } })}
              showVerify={Boolean(formData.socials.snapchat)}
              verifyUrl={getSocialVerifyUrl('snapchat', formData.socials.snapchat)}
            />
            <BrutalInput
              label="Facebook"
              icon={<span className="text-blue-600">f</span>}
              placeholder="username"
              value={formData.socials.facebook}
              onChange={(e) => setFormData({ ...formData, socials: { ...formData.socials, facebook: e.target.value } })}
              showVerify={Boolean(formData.socials.facebook)}
              verifyUrl={getSocialVerifyUrl('facebook', formData.socials.facebook)}
            />
            <p className="text-xs font-bold text-black/60">
              Add at least one account to continue. Admin will verify and assign metrics/badges manually.
            </p>
          </div>
        )

      case 5:
        return (
          <BrutalTextarea
            label="Tell us about your style"
            placeholder="I love vintage fashion and sustainable brands..."
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          />
        )

      case 6:
        return (
          <div className="space-y-5">
            <div className="bg-[#B4F056] border-[3px] border-black rounded-xl p-4 flex items-center gap-3 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              <span className="text-2xl">📸</span>
              <div>
                <p className="font-black text-sm">Build your reference library for try-on</p>
                <p className="text-xs text-black/60 font-medium">
                  {referencePhotosReady
                    ? 'Ready for try-on generation'
                    : `${referencePhotosNeeded} more approved photo${referencePhotosNeeded === 1 ? '' : 's'} needed`}
                </p>
              </div>
            </div>

            <div className="w-full h-3 border-[2px] border-black bg-white overflow-hidden">
              <motion.div
                className="h-full bg-[#FFD93D]"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (referenceApprovedCount / Math.max(1, referenceMinRequired)) * 100)}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 text-[10px] font-black uppercase border-[2px] border-black bg-white">Approved {referenceApprovedCount}/{referenceMinRequired}</span>
              <span className="px-3 py-1 text-[10px] font-black uppercase border-[2px] border-black bg-white">Total {referencePhotos.length}</span>
              <span className="px-3 py-1 text-[10px] font-black uppercase border-[2px] border-black bg-white">Pending {referencePhotos.filter((photo) => photo.status === 'pending').length}</span>
              <span className="px-3 py-1 text-[10px] font-black uppercase border-[2px] border-black bg-white">Rejected {referencePhotos.filter((photo) => photo.status === 'rejected').length}</span>
            </div>

            <div className="border-[3px] border-black rounded-xl bg-white p-4 flex flex-col sm:flex-row gap-3 sm:items-center justify-between shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              <div>
                <p className="font-black text-sm uppercase">Upload solo photos</p>
                <p className="text-xs text-black/60 font-medium">Use clear, well-lit photos from different angles. No group shots.</p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => referenceInputRef.current?.click()}
                  disabled={referenceUploading}
                  className="px-4 py-2 bg-black text-white border-[2px] border-black font-black uppercase text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all inline-flex items-center gap-2"
                >
                  {referenceUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  Add photos
                </button>
                <button
                  type="button"
                  onClick={() => void fetchReferencePhotos()}
                  className="px-4 py-2 bg-white text-black border-[2px] border-black font-black uppercase text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all inline-flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </button>
              </div>
              <input
                ref={referenceInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleReferencePhotoUpload}
              />
            </div>

            {referenceUploading && referenceUploadProgress > 0 && (
              <p className="text-xs font-black uppercase text-black/50">
                Uploading photos... {referenceUploadProgress}%
              </p>
            )}

            {referencePhotosLoading ? (
              <div className="border-[3px] border-black rounded-xl bg-white p-8 text-center font-black uppercase">
                <Loader2 className="w-5 h-5 animate-spin inline mr-2" />
                Loading reference library...
              </div>
            ) : referencePhotos.length === 0 ? (
              <div className="border-[3px] border-dashed border-black/30 rounded-xl bg-white p-8 text-center">
                <ImagePlus className="w-10 h-10 mx-auto mb-3" />
                <h3 className="text-lg font-black uppercase">No reference photos yet</h3>
                <p className="text-sm font-medium text-black/60 mt-2">
                  Add app-uploaded solo photos here and we’ll score them for try-on readiness.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {referencePhotos
                    .filter((photo) => photo.status === 'approved')
                    .slice()
                    .sort((a, b) => {
                      const scoreA = a.qualityScore ?? 0
                      const scoreB = b.qualityScore ?? 0
                      if (scoreA !== scoreB) return scoreB - scoreA
                      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                    })
                    .slice(0, 3)
                    .map((photo) => {
                      const statusTone = getReferenceStatusLabel(photo.status)
                      return (
                        <div key={photo.id} className="border-[3px] border-black rounded-xl overflow-hidden bg-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                          <div className="relative aspect-[3/4] bg-black/5">
                            <AppImage src={photo.imageUrl} className="object-cover" alt="Reference photo" sizes="240px" />
                            <div className="absolute top-2 left-2 px-2 py-1 border-[2px] border-black text-[10px] font-black uppercase bg-white">
                              Top source
                            </div>
                            <div className={`absolute top-2 right-2 px-2 py-1 border-[2px] border-black text-[10px] font-black uppercase ${statusTone.color}`}>
                              {statusTone.label}
                            </div>
                          </div>
                          <div className="p-3 space-y-2">
                            <p className="text-[10px] font-black uppercase text-black/50">{getReferenceSourceLabel(photo.source)}</p>
                            <p className="text-xs font-bold text-black/70">
                              Score {Math.round((photo.qualityScore ?? getReferenceSelectionScore(photo)) * 100)}%
                            </p>
                          </div>
                        </div>
                      )
                    })}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {referencePhotos.map((photo) => {
                    const statusTone = getReferenceStatusLabel(photo.status)
                    return (
                      <div key={photo.id} className="border-[3px] border-black rounded-xl overflow-hidden bg-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                        <div className="relative aspect-[3/4] bg-black/5">
                          <AppImage src={photo.imageUrl} className="object-cover" alt="Reference photo" sizes="240px" />
                          <div className={`absolute top-2 left-2 px-2 py-1 border-[2px] border-black text-[10px] font-black uppercase ${statusTone.color}`}>
                            {statusTone.label}
                          </div>
                          <button
                            type="button"
                            onClick={() => void handleReferencePhotoDelete(photo.id)}
                            disabled={referenceDeletingId === photo.id}
                            className="absolute top-2 right-2 w-9 h-9 bg-white border-[2px] border-black flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
                            title="Remove photo"
                          >
                            {referenceDeletingId === photo.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                          </button>
                        </div>
                        <div className="p-3 space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-black uppercase text-black/45">{getReferenceSourceLabel(photo.source)}</span>
                            <span className="text-[10px] font-black uppercase text-black/45">Score {Math.round((photo.qualityScore ?? getReferenceSelectionScore(photo)) * 100)}%</span>
                          </div>
                          <p className="text-xs font-bold text-black/60">
                            {photo.approvedForTryOn ? 'Counts toward try-on readiness' : 'Not counted toward readiness yet'}
                          </p>
                          {photo.analysis?.rejectionNote && (
                            <p className="text-[11px] font-bold text-black/60">{photo.analysis.rejectionNote}</p>
                          )}
                          {photo.rejectionReasons.length > 0 && (
                            <div className="space-y-1">
                              {photo.rejectionReasons.map((reason) => (
                                <p key={reason} className="text-[11px] font-bold text-red-600">{reason}</p>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center bg-[#1a1a1a] p-4 lg:p-8 overflow-hidden">
      {/* Background - CSS only, no JS animation */}
      <div
        className="absolute inset-0 z-0 opacity-50 blur-sm"
        style={{
          backgroundImage: "url('/assets/login-influencer-background.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-[#2a1a0a]/60 via-transparent to-black/70 z-[1]" />

      <DecorativeShapes />

      <div className="w-full max-w-2xl relative z-20 py-8 sm:py-12">
        <OnboardingCard
          title={isResubmissionMode ? 'Update Your Profile' : 'Complete Your Profile'}
          step={step}
          totalSteps={TOTAL_STEPS}
          stepTitle={getStepTitle()}
        >
          {isResubmissionMode && (
            <div className="mb-5 rounded-2xl border-[3px] border-black bg-[#FFF4CC] p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-black">Resubmission mode</p>
              <p className="mt-2 text-sm font-semibold leading-relaxed text-black/70">
                Your previous creator submission needs updates. Review your details, polish anything missing, and send it back for approval.
              </p>
            </div>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.2 }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-6 sm:mt-8 pt-4 sm:pt-6 border-t-2 border-black/10 gap-3">
            <button type="button"
              onClick={handleBack}
              disabled={step === 1}
              className={`
                px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-black text-sm sm:text-base flex items-center gap-2 transition-all border-[3px]
                ${step === 1
                  ? 'opacity-0 pointer-events-none border-transparent'
                  : 'border-black/20 hover:border-black hover:bg-white text-black/60 hover:text-black active:shadow-[3px_3px_0px_0px_rgba(0,0,0,0.3)]'
                }
              `}
            >
              <ArrowLeft className="w-5 h-5" strokeWidth={3} />
              Back
            </button>

            <button type="button"
              onClick={handleNext}
              disabled={loading || isPending || !canProceed()}
              className={`
                px-5 sm:px-8 py-2.5 sm:py-3.5 border-[3px] border-black rounded-xl font-black text-sm sm:text-base text-black 
                transition-all flex items-center gap-2
                ${canProceed()
                  ? 'bg-[#FF8C69] shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:shadow-[7px_7px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 active:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-y-0'
                  : 'bg-gray-300 shadow-none cursor-not-allowed opacity-50'
                }
                disabled:opacity-50
              `}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : step === TOTAL_STEPS ? (
                <>🎉 Finish Setup</>
              ) : (
                <>
                  Next
                  <ArrowRight className="w-5 h-5" strokeWidth={3} />
                </>
              )}
            </button>
          </div>
        </OnboardingCard>
      </div>
    </div>
  )
}
