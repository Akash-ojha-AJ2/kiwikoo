'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { AppImage } from '@/components/ui/AppImage'
import {
  User,
  Mail,
  Calendar,
  Loader2,
  Camera,
  Edit3,
  Settings,
  TrendingUp,
  Zap,
  Check,
  X,
  Instagram,
  Youtube,
  Twitter,
  ExternalLink,
  Users,
  Share2,
  ChevronDown,
  Upload,
  Trash2,
  RefreshCw,
  ImagePlus
} from 'lucide-react'
import { toast } from '@/lib/simple-sonner'
import Link from 'next/link'
import { useQueryClient, useQuery } from '@tanstack/react-query'
import { formatDateOfBirth } from '@/lib/profile-demographics'

type ReferencePhotoSource = 'app_upload' | 'migrated_profile' | 'migrated_identity'
type ReferencePhotoStatus = 'pending' | 'approved' | 'rejected'

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

function BrutalCard({ children, className = '', title }: { children: React.ReactNode, className?: string, title?: string }) {
  return (
    <div className={`bg-white border-[3px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-5 sm:p-8 relative ${className}`}>
      {title && (
        <div className="absolute -top-4 left-6 bg-white px-4 border-[3px] border-black text-sm font-bold uppercase tracking-widest shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          {title}
        </div>
      )}
      {children}
    </div>
  )
}

function BrutalTag({ label, color = 'bg-white' }: { label: string, color?: string }) {
  return (
    <span className={`px-4 py-2 text-sm font-bold border-[2px] border-black text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] uppercase tracking-wide ${color}`}>
      {label}
    </span>
  )
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] pt-28 pb-20 animate-pulse">
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
        <div className="mb-6 h-12 w-full max-w-[360px] bg-black/10 sm:h-16" />
        <div className="mb-14 h-7 w-full max-w-[520px] bg-black/10 sm:h-8" />
        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-10">
            <div className="h-[320px] bg-white border-[3px] border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)]" />
            <div className="h-[240px] bg-white border-[3px] border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)]" />
            <div className="h-[180px] bg-white border-[3px] border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)]" />
          </div>
          <div className="lg:col-span-4 space-y-8">
            <div className="h-[220px] bg-white border-[3px] border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)]" />
            <div className="h-[280px] bg-white border-[3px] border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)]" />
          </div>
        </div>
      </div>
    </div>
  )
}

const fetchProfileData = async () => {
  const res = await fetch('/api/profile')
  if (!res.ok) throw new Error('Failed to fetch profile')
  return res.json()
}

type SectionKey = 'about' | 'character' | 'social' | 'metrics'

export default function ProfilePage() {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadDone, setUploadDone] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [expanded, setExpanded] = useState<Record<SectionKey, boolean>>({
    about: true,
    character: true,
    social: true,
    metrics: true,
  })
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

  const fileInputRef = useRef<HTMLInputElement>(null)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['full-profile'],
    queryFn: fetchProfileData,
    refetchOnWindowFocus: true
  })

  useEffect(() => {
    if (data?.user?.name) {
      setName(data.user.name)
    }
    if (data) {
      setLastUpdated(new Date())
    }
  }, [data])

  const user = data?.user
  const profile = user?.influencerProfile
  const formattedDob = formatDateOfBirth(profile?.dateOfBirth)
  const generationTag = typeof profile?.generationTag === 'string' ? profile.generationTag : null

  useEffect(() => {
    async function fetchProfileImage() {
      try {
        const res = await fetch('/api/profile-images')
        if (res.ok) {
          const imgData = await res.json()
          const primary = imgData.images?.find((img: any) => img.isPrimary) || imgData.images?.[0]
          if (primary?.imageUrl) {
            setProfileImageUrl(primary.imageUrl)
          }
        }
      } catch (err) {
        console.error('Failed to fetch profile image:', err)
      }
    }
    fetchProfileImage()
  }, [])

  // Fetch the canonical reference-photo library used by try-on.
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
    } catch (err) {
      console.error('Failed to fetch reference photos:', err)
    } finally {
      setReferencePhotosLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchReferencePhotos()
  }, [fetchReferencePhotos])

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
          const uploadFile = await preparePhotoForUpload(file)
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
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to upload reference photos')
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
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to remove reference photo')
    } finally {
      setReferenceDeletingId(null)
    }
  }

  const toggleSection = (key: SectionKey) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const publicSlug = (user as any)?.slug || user?.email?.split('@')[0] || ''
  const publicProfilePath = publicSlug ? `/u/${publicSlug}` : '/profile'

  const copyProfileLink = async () => {
    const url = typeof window !== 'undefined'
      ? new URL(publicProfilePath, window.location.origin).toString()
      : publicProfilePath

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: 'My Profile', url })
        return
      } catch {
        // fall back to clipboard below
      }
    }

    try {
      await navigator.clipboard.writeText(url)
      toast.success('Profile link copied')
    } catch {
      toast.error('Unable to copy link')
    }
  }

  const preparePhotoForUpload = async (file: File): Promise<File> => {
    const maxEdge = 1200 // Reduced from 1600 to ensure files stay small for API route limits

    // Keep already-light files as-is for best quality and speed. (Lowered threshold to 1.5MB)
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
            // Reduced quality from 0.82 to 0.75 to ensure payload stays under 4MB limit
            resolve(new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' }))
          }, 'image/jpeg', 0.75)
        } catch (error) {
          URL.revokeObjectURL(objectUrl)
          reject(error instanceof Error ? error : new Error('Image compression failed'))
        }
      }

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl)
        reject(new Error('Failed to read image'))
      }

      img.src = objectUrl
    })
  }

  const uploadPhotoFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    if (file.size > 15 * 1024 * 1024) {
      toast.error('Image must be less than 15MB')
      return
    }

    setUploadingPhoto(true)
    setUploadDone(false)
    setUploadProgress(15)

    const previousImage = profileImageUrl
    let progressTimer: ReturnType<typeof setInterval> | null = null
    let timeoutId: ReturnType<typeof setTimeout> | null = null

    try {
      const uploadFile = await preparePhotoForUpload(file)

      if (uploadFile.size > 5 * 1024 * 1024) {
        throw new Error('Compressed image is still too large. Please choose a smaller image.')
      }

      const previewUrl = URL.createObjectURL(uploadFile)
      setProfileImageUrl(previewUrl)

      progressTimer = setInterval(() => {
        setUploadProgress((prev) => (prev >= 90 ? prev : prev + 8))
      }, 180)

      const formData = new FormData()
      formData.append('file', uploadFile)
      formData.append('label', 'profile-avatar')

      const controller = new AbortController()
      timeoutId = setTimeout(() => controller.abort(), 45000)

      const res = await fetch('/api/profile-images', {
        method: 'POST',
        credentials: 'include',
        body: formData,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}))
        throw new Error(errBody.error || 'Upload failed')
      }

      const resData = await res.json()
      const finalUrl = resData.image?.imageUrl || previewUrl
      setProfileImageUrl(finalUrl)
      setUploadProgress(100)
      setUploadDone(true)

      if (finalUrl !== previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }

      toast.success('Profile photo updated!', {
        action: {
          label: 'Undo',
          onClick: () => setProfileImageUrl(previousImage)
        }
      })

      setTimeout(() => {
        setUploadDone(false)
        setUploadProgress(0)
      }, 1200)
    } catch (err) {
      console.error('Photo upload error:', err)
      setProfileImageUrl(previousImage)

      const errorMessage = err instanceof Error && err.name === 'AbortError'
        ? 'Upload timed out. Try a smaller image or better network.'
        : err instanceof Error
          ? err.message
          : 'Failed to upload photo'

      toast.error(errorMessage, {
        action: {
          label: 'Retry',
          onClick: () => {
            void uploadPhotoFile(file)
          }
        }
      })
    } finally {
      if (progressTimer) clearInterval(progressTimer)
      if (timeoutId) clearTimeout(timeoutId)
      setUploadingPhoto(false)
    }
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.currentTarget.value = ''
    if (!file) return
    await uploadPhotoFile(file)
  }

  const patchName = async (nextName: string) => {
    const res = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ name: nextName.trim() })
    })

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}))
      throw new Error(errBody.error || 'Failed to update name')
    }
  }

  const handleSaveName = async () => {
    const trimmed = name.trim()
    if (!trimmed) return

    const previous = queryClient.getQueryData(['full-profile']) as any
    const previousName = previous?.user?.name || user?.name || ''

    setSaving(true)
    setEditing(false)

    queryClient.setQueryData(['full-profile'], (old: any) => {
      if (!old?.user) return old
      return { ...old, user: { ...old.user, name: trimmed } }
    })

    try {
      await patchName(trimmed)
      await queryClient.invalidateQueries({ queryKey: ['full-profile'] })

      toast.success('Name updated!', {
        action: {
          label: 'Undo',
          onClick: () => {
            setName(previousName)
            void patchName(previousName)
            queryClient.setQueryData(['full-profile'], (old: any) => {
              if (!old?.user) return old
              return { ...old, user: { ...old.user, name: previousName } }
            })
          }
        }
      })
    } catch (err) {
      queryClient.setQueryData(['full-profile'], previous)
      setName(previousName)
      toast.error(err instanceof Error ? err.message : 'Failed to update name', {
        action: {
          label: 'Retry',
          onClick: () => void handleSaveName()
        }
      })
    } finally {
      setSaving(false)
    }
  }

  const getLevelInfo = (score: number = 0) => {
    if (score >= 90) return { label: 'Master', bg: 'bg-purple-400' }
    if (score >= 70) return { label: 'Expert', bg: 'bg-blue-400' }
    if (score >= 50) return { label: 'Pro', bg: 'bg-green-400' }
    return { label: 'Starter', bg: 'bg-yellow-400' }
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

    const qualityScore = photo.qualityScore ?? 0

    return (
      faceClarity * 0.35 +
      (analysis.garmentSwapSuitability || 0) * 0.3 +
      bodyVisibilityScore * 0.15 +
      analysis.sharpness * 0.1 +
      analysis.lightingQuality * 0.1 +
      qualityScore * 0.05
    )
  }

  const sortedReferencePhotos = [...referencePhotos].sort((a, b) => {
    const scoreDelta = getReferenceSelectionScore(b) - getReferenceSelectionScore(a)
    if (Math.abs(scoreDelta) > 0.0001) return scoreDelta
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })
  const suggestedReferencePhotos = sortedReferencePhotos.filter((photo) => photo.status === 'approved').slice(0, 3)
  const remainingReferencePhotos = sortedReferencePhotos.filter((photo) => !suggestedReferencePhotos.some((selected) => selected.id === photo.id))

  const getReferenceStatusTone = (status: ReferencePhotoStatus) => {
    switch (status) {
      case 'approved':
        return { label: 'Approved', color: 'bg-[#B4F056]' }
      case 'rejected':
        return { label: 'Rejected', color: 'bg-[#FF9AA2]' }
      default:
        return { label: 'Pending', color: 'bg-[#FFD93D]' }
    }
  }

  const getReferenceSourceLabel = (source: ReferencePhotoSource) => {
    switch (source) {
      case 'migrated_profile':
        return 'Migrated from profile photos'
      case 'migrated_identity':
        return 'Migrated from identity photos'
      default:
        return 'App upload'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric'
    })
  }

  const formatLastUpdated = (date: Date | null) => {
    if (!date) return 'Not synced yet'
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }

  if (isLoading) {
    return <LoadingSkeleton />
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] pt-24 flex items-center justify-center">
        <p className="text-xl font-bold">Profile not found. Please log in.</p>
      </div>
    )
  }

  const level = getLevelInfo(Number(profile?.badgeScore || 0))
  const followers = Number(profile?.followers || 0)
  const rawEngagement = Number(profile?.engagementRate || 0)
  const engagementRate = rawEngagement <= 1 && rawEngagement > 0 ? +(rawEngagement * 100).toFixed(2) : +rawEngagement.toFixed(2)
  const audienceRate = Number(profile?.audienceRate || 0)
  const hasSocials = Boolean(profile?.socials && Object.keys(profile.socials).length > 0)
  return (
    <div className="min-h-screen bg-[#FDFBF7] pt-28 pb-20">
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl">

        <div className="mb-16">
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-black uppercase mb-4 tracking-tight leading-none">
            Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-black to-gray-500">Profile</span>
          </h1>
          <p className="text-base sm:text-xl font-bold text-black/60 max-w-2xl border-l-[4px] border-[#FFD93D] pl-4 sm:pl-6 py-2">
            Manage your digital persona, track your growth, and showcase your influence.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button type="button"
              onClick={() => setEditing(true)}
              className="w-full sm:w-auto px-5 py-2 bg-black text-white border-[3px] border-black font-bold uppercase tracking-wide shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
            >
              Edit Profile
            </button>
            <Link
              href={publicProfilePath}
              className="w-full sm:w-auto text-center px-5 py-2 bg-white text-black border-[3px] border-black font-bold uppercase tracking-wide shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
            >
              View Public Profile
            </Link>
            <button type="button"
              onClick={copyProfileLink}
              className="w-full sm:w-auto justify-center px-5 py-2 bg-[#FFD93D] text-black border-[3px] border-black font-bold uppercase tracking-wide shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all inline-flex items-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              Share
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-10">
            <BrutalCard className="pt-36 md:pt-10 mt-16 md:mt-12" >
              <div className="absolute -top-16 left-1/2 -translate-x-1/2 md:translate-x-0 md:left-8 z-10 w-[160px] h-[180px] md:w-[180px] md:h-[200px]">
                <div className="relative w-full h-full border-[4px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-[#FFD93D] overflow-hidden">
                  {profileImageUrl ? (
                    <AppImage src={profileImageUrl} alt="Profile" className="object-cover" sizes="180px" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-14 h-14 text-black/35" />
                    </div>
                  )}

                  {(uploadingPhoto || uploadDone) && (
                    <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white">
                      {uploadDone ? <Check className="w-8 h-8 mb-2" /> : <Loader2 className="w-8 h-8 mb-2 animate-spin" />}
                      <p className="text-xs font-bold uppercase tracking-wider">
                        {uploadDone ? 'Updated' : `Uploading ${uploadProgress}%`}
                      </p>
                    </div>
                  )}

                  <button type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingPhoto}
                    className="absolute bottom-2 right-2 z-10 w-10 h-10 bg-black text-white border-[2px] border-black flex items-center justify-center hover:bg-white hover:text-black transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none"
                    title="Upload profile photo"
                  >
                    {uploadingPhoto ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </div>
              </div>

              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 md:pl-[220px]">
                <div className="flex flex-col items-center md:items-start text-center md:text-left">
                  {editing ? (
                    <div className="flex flex-wrap justify-center md:justify-start items-center gap-2 mb-2 w-full">
                      <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            void handleSaveName()
                          }
                          if (e.key === 'Escape') {
                            e.preventDefault()
                            setName(user.name || '')
                            setEditing(false)
                          }
                        }}
                        className="text-2xl md:text-3xl font-black bg-white border-[3px] border-black px-4 py-2 w-full max-w-sm focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all text-center md:text-left"
                        autoFocus
                      />
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={handleSaveName} disabled={saving} className="bg-black text-white p-2.5 border-[3px] border-black hover:bg-white hover:text-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all">
                          <Check className="w-5 h-5" />
                        </button>
                        <button type="button"
                          onClick={() => {
                            setName(user.name || '')
                            setEditing(false)
                          }}
                          className="bg-white text-black p-2.5 border-[3px] border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 group justify-center md:justify-start">
                      <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight">{user.name || 'Set Name'}</h2>
                      <button type="button" onClick={() => setEditing(true)} className="opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-black/5 rounded">
                        <Edit3 className="w-5 h-5" />
                      </button>
                    </div>
                  )}

                  <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-4">
                    <span className="px-3 py-1 bg-black text-white text-xs font-bold uppercase tracking-widest border-[2px] border-black">
                      {user.role}
                    </span>
                    <span className={`px-3 py-1 ${level.bg} text-black text-xs font-bold uppercase tracking-widest border-[2px] border-black`}>
                      {level.label}
                    </span>
                    <span className="px-3 py-1 bg-white text-black text-xs font-bold uppercase tracking-widest border-[2px] border-black flex items-center gap-2">
                      <Calendar className="w-3 h-3" />
                      Joined {formatDate(user.createdAt)}
                    </span>
                  </div>
                </div>

                <Link href="/settings" className="w-full md:w-auto px-6 py-3 bg-white border-[3px] border-black font-bold uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex items-center justify-center gap-2 text-sm mt-2 md:mt-0">
                  <Settings className="w-4 h-4" />
                  Settings
                </Link>
              </div>

              <div className="mt-8 pt-8 border-t-[3px] border-black space-y-4">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-4 md:pl-[220px]">
                  <div className="w-10 h-10 border-[2px] border-black bg-white flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div className="text-center md:text-left">
                    <p className="text-xs font-bold uppercase text-black/50 tracking-widest">Email Address</p>
                    <p className="text-lg font-bold break-all">{user.email}</p>
                  </div>
                </div>
              </div>
            </BrutalCard>

            <BrutalCard title="About Me">
              <button type="button"
                onClick={() => toggleSection('about')}
                className="md:hidden w-full mb-4 flex items-center justify-between border-[2px] border-black px-3 py-2 font-bold uppercase text-xs"
              >
                <span>{expanded.about ? 'Hide Details' : 'Show Details'}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${expanded.about ? 'rotate-180' : ''}`} />
              </button>

              <div className={`${expanded.about ? 'block' : 'hidden'} md:block`}>
                <p className="text-lg font-medium leading-relaxed text-black/80">
                  {profile?.bio || 'No bio added yet. Tell brands about yourself!'}
                </p>

                {!profile?.bio && (
                  <Link href="/onboarding/influencer" className="inline-block mt-4 px-4 py-2 border-[2px] border-black font-bold uppercase text-xs bg-[#FFD93D]">
                    Add Bio
                  </Link>
                )}

                <div className="mt-8">
                  {(formattedDob || generationTag || profile?.gender) && (
                    <div className="mb-6">
                      <h3 className="text-xs font-bold uppercase text-black/50 tracking-widest mb-4">Identity Snapshot</h3>
                      <div className="flex flex-wrap gap-3">
                        {formattedDob && <BrutalTag label={`DOB ${formattedDob}`} color="bg-[#FFF3E8]" />}
                        {generationTag && <BrutalTag label={generationTag} color="bg-[#B4F056]" />}
                        {profile?.gender && <BrutalTag label={String(profile.gender)} color="bg-[#FFD93D]" />}
                      </div>
                    </div>
                  )}

                  <h3 className="text-xs font-bold uppercase text-black/50 tracking-widest mb-4">Niches & Focus</h3>
                  <div className="flex flex-wrap gap-3">
                    {profile?.niches && Array.isArray(profile.niches) && profile.niches.map((niche: string) => (
                      <BrutalTag key={niche} label={niche} color="bg-[#FF90E8]" />
                    ))}
                    {profile?.preferredCategories && Array.isArray(profile.preferredCategories) && profile.preferredCategories.map((cat: string) => (
                      <BrutalTag key={cat} label={cat} color="bg-[#90E8FF]" />
                    ))}
                    {(!profile?.niches?.length && !profile?.preferredCategories?.length) && (
                      <div className="flex items-center gap-3">
                        <span className="text-black/50 italic font-medium">No niches selected yet.</span>
                        <Link href="/onboarding/influencer" className="px-3 py-1 border-[2px] border-black text-xs font-bold uppercase bg-white">
                          Add Niches
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </BrutalCard>

            {/* Reference library */}
            <BrutalCard title="Reference Library">
              <button type="button"
                onClick={() => toggleSection('character')}
                className="md:hidden w-full mb-4 flex items-center justify-between border-[2px] border-black px-3 py-2 font-bold uppercase text-xs"
              >
                <span>{expanded.character ? 'Hide Details' : 'Show Details'}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${expanded.character ? 'rotate-180' : ''}`} />
              </button>

              <div className={`${expanded.character ? 'block' : 'hidden'} md:block`}>
                <div className="grid lg:grid-cols-12 gap-6 items-start">
                  <div className="lg:col-span-4 space-y-4">
                    <div className="border-[3px] border-black bg-[#FFF9E5] p-4 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-black/50">Try-on readiness</p>
                          <p className="text-xl font-black uppercase leading-tight mt-1">
                            {referencePhotosReady ? 'Ready to generate' : `${referencePhotosNeeded} more approved photos`}
                          </p>
                        </div>
                        <div className={`px-3 py-1 border-[2px] border-black font-black uppercase text-[10px] ${referencePhotosReady ? 'bg-[#B4F056]' : 'bg-[#FFD93D]'}`}>
                          {referencePhotosReady ? 'Ready' : 'Locked'}
                        </div>
                      </div>

                      <div className="mt-4 w-full h-3 border-[2px] border-black bg-white overflow-hidden">
                        <motion.div
                          className="h-full bg-[#FFD93D]"
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, (referenceApprovedCount / Math.max(1, referenceMinRequired)) * 100)}%` }}
                          transition={{ duration: 0.5, ease: 'easeOut' }}
                        />
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="px-2 py-1 border-[2px] border-black bg-white text-[10px] font-black uppercase">Approved {referenceApprovedCount}/{referenceMinRequired}</span>
                        <span className="px-2 py-1 border-[2px] border-black bg-white text-[10px] font-black uppercase">Total {referencePhotos.length}</span>
                        <span className="px-2 py-1 border-[2px] border-black bg-white text-[10px] font-black uppercase">Pending {referencePhotos.filter((photo) => photo.status === 'pending').length}</span>
                        <span className="px-2 py-1 border-[2px] border-black bg-white text-[10px] font-black uppercase">Rejected {referencePhotos.filter((photo) => photo.status === 'rejected').length}</span>
                      </div>
                    </div>

                    <div className="border-[3px] border-black bg-white p-4 shadow-[4px_4px_0_0_rgba(0,0,0,1)] space-y-3">
                      <button
                        type="button"
                        onClick={() => referenceInputRef.current?.click()}
                        disabled={referenceUploading}
                        className="w-full px-4 py-3 bg-black text-white border-[2px] border-black font-black uppercase tracking-wide shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all inline-flex items-center justify-center gap-2"
                      >
                        {referenceUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                        Upload Photos
                      </button>
                      <input
                        ref={referenceInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleReferencePhotoUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => void fetchReferencePhotos()}
                        className="w-full px-4 py-3 bg-white text-black border-[2px] border-black font-black uppercase tracking-wide shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all inline-flex items-center justify-center gap-2"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Refresh Library
                      </button>
                      {referenceUploading && referenceUploadProgress > 0 && (
                        <p className="text-[11px] font-bold uppercase text-black/60">
                          Uploading... {referenceUploadProgress}%
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="border-[2px] border-black bg-white p-3">
                        <p className="text-[10px] font-black uppercase tracking-wide text-black/50">Suggested picks</p>
                        <p className="text-2xl font-black">{Math.min(3, suggestedReferencePhotos.length)}</p>
                      </div>
                      <div className="border-[2px] border-black bg-white p-3">
                        <p className="text-[10px] font-black uppercase tracking-wide text-black/50">Need for v1</p>
                        <p className="text-2xl font-black">{Math.max(0, referenceMinRequired - referenceApprovedCount)}</p>
                      </div>
                    </div>

                    <div className="border-[2px] border-dashed border-black/20 p-4 bg-[#F8FAFC]">
                      <p className="text-xs font-bold text-black/60 leading-relaxed">
                        Upload clear solo photos from different angles. The try-on flow will auto-pick the strongest 3 approved photos from this library and only use those as source references.
                      </p>
                    </div>
                  </div>

                  <div className="lg:col-span-8 space-y-6">
                    {referencePhotosLoading ? (
                      <div className="border-[3px] border-black bg-white p-8 text-center font-black uppercase animate-pulse">
                        <Loader2 className="w-5 h-5 animate-spin inline mr-2" />
                        Loading reference library...
                      </div>
                    ) : referencePhotos.length === 0 ? (
                      <div className="border-[3px] border-black bg-white p-8 text-center">
                        <ImagePlus className="w-10 h-10 mx-auto mb-3" />
                        <h3 className="text-xl font-black uppercase">No reference photos yet</h3>
                        <p className="text-sm font-medium text-black/60 mt-2 max-w-md mx-auto">
                          Add app-uploaded solo photos to build your try-on library. Once you have {referenceMinRequired} approved photos, the try-on pipeline unlocks.
                        </p>
                      </div>
                    ) : (
                      <>
                        {suggestedReferencePhotos.length > 0 && (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between gap-3">
                              <h3 className="text-sm font-black uppercase tracking-widest">Auto-picked top 3</h3>
                              <span className="text-[10px] font-black uppercase text-black/40">Best approved source photos for try-on</span>
                            </div>
                            <div className="grid sm:grid-cols-3 gap-4">
                              {suggestedReferencePhotos.map((photo) => {
                                const statusTone = getReferenceStatusTone(photo.status)
                                return (
                                  <div key={photo.id} className="border-[3px] border-black bg-white shadow-[4px_4px_0_0_rgba(0,0,0,1)] overflow-hidden">
                                    <div className="relative aspect-[3/4] bg-black/5">
                                      <AppImage src={photo.imageUrl} alt="Reference photo" className="object-cover" sizes="240px" />
                                    </div>
                                    <div className="p-3 space-y-2">
                                      <div className="flex items-center justify-between gap-2">
                                        <span className={`px-2 py-1 border-[2px] border-black text-[10px] font-black uppercase ${statusTone.color}`}>{statusTone.label}</span>
                                        <span className="text-[10px] font-black uppercase text-black/45">{getReferenceSourceLabel(photo.source)}</span>
                                      </div>
                                      <p className="text-xs font-bold text-black/70">Score {Math.round((photo.qualityScore ?? getReferenceSelectionScore(photo)) * 100)}%</p>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )}

                        <div className="space-y-3">
                          <div className="flex items-center justify-between gap-3">
                            <h3 className="text-sm font-black uppercase tracking-widest">All photos</h3>
                            <span className="text-[10px] font-black uppercase text-black/40">{referencePhotos.length} total</span>
                          </div>
                          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                            {remainingReferencePhotos.map((photo) => {
                              const statusTone = getReferenceStatusTone(photo.status)
                              return (
                                <div key={photo.id} className="border-[3px] border-black bg-white shadow-[4px_4px_0_0_rgba(0,0,0,1)] overflow-hidden">
                                  <div className="relative aspect-[3/4] bg-black/5">
                                    <AppImage src={photo.imageUrl} alt="Reference photo" className="object-cover" sizes="240px" />
                                    <div className="absolute top-2 left-2">
                                      <span className={`px-2 py-1 border-[2px] border-black text-[10px] font-black uppercase ${statusTone.color}`}>{statusTone.label}</span>
                                    </div>
                                    <div className="absolute top-2 right-2">
                                      <button
                                        type="button"
                                        onClick={() => void handleReferencePhotoDelete(photo.id)}
                                        disabled={referenceDeletingId === photo.id}
                                        className="w-9 h-9 flex items-center justify-center bg-white border-[2px] border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
                                        title="Remove reference photo"
                                      >
                                        {referenceDeletingId === photo.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                      </button>
                                    </div>
                                  </div>
                                  <div className="p-3 space-y-2">
                                    <div className="flex items-center justify-between gap-2">
                                      <span className="text-[10px] font-black uppercase text-black/45">{getReferenceSourceLabel(photo.source)}</span>
                                      <span className="text-[10px] font-black uppercase text-black/45">Score {Math.round((photo.qualityScore ?? getReferenceSelectionScore(photo)) * 100)}%</span>
                                    </div>
                                    <p className="text-xs font-bold text-black/65">
                                      {photo.approvedForTryOn ? 'Counts toward try-on readiness' : 'Not counted toward readiness yet'}
                                    </p>
                                    {photo.analysis?.rejectionNote && (
                                      <p className="text-[11px] font-bold text-black/60">{photo.analysis.rejectionNote}</p>
                                    )}
                                    {photo.rejectionReasons.length > 0 && (
                                      <div className="space-y-1">
                                        {photo.rejectionReasons.map((reason) => (
                                          <p key={reason} className="text-[11px] font-bold text-red-600">
                                            {reason}
                                          </p>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </BrutalCard>

            <BrutalCard title="Social Presence">
              <button type="button"
                onClick={() => toggleSection('social')}
                className="md:hidden w-full mb-4 flex items-center justify-between border-[2px] border-black px-3 py-2 font-bold uppercase text-xs"
              >
                <span>{expanded.social ? 'Hide Details' : 'Show Details'}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${expanded.social ? 'rotate-180' : ''}`} />
              </button>

              <div className={`${expanded.social ? 'block' : 'hidden'} md:block`}>
                {hasSocials ? (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {Object.entries(profile.socials).map(([platform, handle]) => {
                      if (!handle) return null
                      const p = platform.toLowerCase()
                      let Icon = ExternalLink
                      let bg = 'bg-white'

                      if (p === 'instagram') { Icon = Instagram; bg = 'bg-pink-100' }
                      if (p === 'youtube') { Icon = Youtube; bg = 'bg-red-100' }
                      if (p === 'twitter') { Icon = Twitter; bg = 'bg-blue-100' }

                      return (
                        <div key={platform} className={`flex items-center gap-4 p-4 border-[2px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${bg}`}>
                          <Icon className="w-6 h-6" />
                          <div>
                            <p className="text-xs font-bold uppercase tracking-widest">{platform}</p>
                            <p className="font-bold">{(handle as string).replace('@', '')}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="border-[2px] border-dashed border-black p-5 bg-white/50">
                    <p className="font-medium text-black/70 mb-3">No socials connected yet.</p>
                    <Link href="/settings/profile" className="inline-block px-4 py-2 bg-black text-white border-[2px] border-black text-xs font-bold uppercase">
                      Connect Socials
                    </Link>
                  </div>
                )}
              </div>
            </BrutalCard>
          </div>

          <div className="lg:col-span-4 space-y-8 lg:sticky lg:top-28 self-start">
            <BrutalCard className="text-center">
              <h3 className="text-sm font-bold uppercase tracking-widest mb-2">Current Level</h3>
              <div className="text-6xl font-black mb-2">{Math.round(Number(profile?.badgeScore || 0))}</div>
              <div className={`inline-block px-4 py-1 border-[2px] border-black text-xs font-bold uppercase tracking-widest ${level.bg} mb-6`}>
                {level.label}
              </div>

              <div className="w-full h-4 border-[2px] border-black bg-white rounded-full overflow-hidden relative">
                <div
                  className="absolute top-0 left-0 h-full bg-black"
                  style={{ width: `${Math.min(100, Number(profile?.badgeScore || 0))}%` }}
                />
              </div>
              <p className="text-xs font-bold mt-2 text-right">{Math.min(100, Number(profile?.badgeScore || 0))}/100 XP</p>
              <p className="text-[11px] font-semibold text-black/50 mt-3">Last updated {formatLastUpdated(lastUpdated)}</p>
            </BrutalCard>

            <BrutalCard title="Audience Metrics">
              <button type="button"
                onClick={() => toggleSection('metrics')}
                className="md:hidden w-full mb-4 flex items-center justify-between border-[2px] border-black px-3 py-2 font-bold uppercase text-xs"
              >
                <span>{expanded.metrics ? 'Hide Details' : 'Show Details'}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${expanded.metrics ? 'rotate-180' : ''}`} />
              </button>

              <div className={`${expanded.metrics ? 'block' : 'hidden'} md:block`}>
                <div className="space-y-6 mt-2">
                  <div className="flex items-center justify-between pb-4 border-b-[2px] border-black/10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#FFD93D] border-[2px] border-black flex items-center justify-center">
                        <Users className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase text-black/50">Followers</p>
                        <p className="text-2xl font-black">{followers.toLocaleString()}</p>
                        <p className="text-[11px] text-black/50 font-semibold">Total followers</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pb-4 border-b-[2px] border-black/10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#90E8FF] border-[2px] border-black flex items-center justify-center">
                        <Zap className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase text-black/50">Engagement</p>
                        <p className="text-2xl font-black">{engagementRate}%</p>
                        <p className="text-[11px] text-black/50 font-semibold">{engagementRate >= 3 ? 'Healthy rate' : 'Can improve with consistency'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#FF90E8] border-[2px] border-black flex items-center justify-center">
                        <TrendingUp className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase text-black/50">Audience Growth</p>
                        <p className="text-2xl font-black">{audienceRate}%</p>
                        <p className="text-[11px] text-black/50 font-semibold">Compared with last 30 days</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </BrutalCard>

            {profile?.audienceType && Array.isArray(profile.audienceType) && profile.audienceType.length > 0 && (
              <BrutalCard title="Audience Type">
                <div className="flex flex-wrap gap-2">
                  {profile.audienceType.map((type: string) => (
                    <span key={type} className="px-3 py-1 bg-gray-200 border-[2px] border-black font-bold text-xs uppercase">
                      {type}
                    </span>
                  ))}
                </div>
              </BrutalCard>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
