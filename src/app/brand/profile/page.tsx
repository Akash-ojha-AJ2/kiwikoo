'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { AppImage } from '@/components/ui/AppImage'
import { toast } from '@/lib/simple-sonner'
import {
  User,
  Building2,
  Globe,
  Mail,
  Phone,
  Save,
  Loader2,
  Camera,
  Check,
  Instagram,
  Twitter,
  Linkedin,
} from 'lucide-react'
import { BrutalLoader } from '@/components/ui/BrutalLoader'

interface BrandProfile {
  companyName: string
  brandType: string
  vertical: string
  website: string
  description: string
  contactEmail: string
  contactPhone: string
  socialLinks: {
    instagram: string
    twitter: string
    linkedin: string
  }
}

const BRAND_TYPES = ['Direct-to-Consumer', 'Enterprise', 'Startup', 'Agency', 'Retailer', 'Other']
const VERTICALS = ['Fashion', 'Beauty', 'Lifestyle', 'Tech', 'Food & Beverage', 'Health & Fitness', 'Home & Living', 'Other']

export default function BrandProfilePage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadDone, setUploadDone] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [profile, setProfile] = useState<BrandProfile>({
    companyName: '',
    brandType: '',
    vertical: '',
    website: '',
    description: '',
    contactEmail: '',
    contactPhone: '',
    socialLinks: {
      instagram: '',
      twitter: '',
      linkedin: '',
    },
  })

  useEffect(() => {
    void fetchProfile()
  }, [])

  useEffect(() => {
    void fetchProfileImage()
  }, [])

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error)

      const brandData = data.profile?.brand_data || {}
      setProfile({
        companyName: brandData.companyName || '',
        brandType: brandData.brandType || '',
        vertical: brandData.vertical || '',
        website: brandData.website || '',
        description: brandData.description || '',
        contactEmail: brandData.contactEmail || data.profile?.email || '',
        contactPhone: brandData.contactPhone || '',
        socialLinks: {
          instagram: brandData.socialLinks?.instagram || '',
          twitter: brandData.socialLinks?.twitter || '',
          linkedin: brandData.socialLinks?.linkedin || '',
        },
      })
    } catch (error) {
      console.error('Failed to fetch profile:', error)
      toast.error('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const fetchProfileImage = async () => {
    try {
      const res = await fetch('/api/profile-images', { credentials: 'include' })
      if (!res.ok) return
      const imgData = await res.json()
      const primary = imgData.images?.find((img: any) => img.isPrimary) || imgData.images?.[0]
      if (primary?.imageUrl) {
        setProfileImageUrl(primary.imageUrl)
      }
    } catch (err) {
      console.error('Failed to fetch profile image:', err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const res = await fetch('/api/onboarding/brand', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: profile.companyName,
          brandType: profile.brandType,
          vertical: profile.vertical,
          website: profile.website,
          description: profile.description,
          contactEmail: profile.contactEmail,
          contactPhone: profile.contactPhone,
          socialLinks: profile.socialLinks,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      toast.success('Profile updated successfully!')
    } catch (error) {
      console.error('Failed to save profile:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  const updateField = (field: keyof Omit<BrandProfile, 'socialLinks'>, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }))
  }

  const updateSocialLink = (platform: keyof BrandProfile['socialLinks'], value: string) => {
    setProfile((prev) => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [platform]: value },
    }))
  }

  const preparePhotoForUpload = async (file: File): Promise<File> => {
    const maxEdge = 1600

    if (file.size <= 1.8 * 1024 * 1024 && file.type !== 'image/heic' && file.type !== 'image/heif') {
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
          }, 'image/jpeg', 0.82)
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
      formData.append('label', 'brand-avatar')

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

      toast.success('Profile photo updated!')

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

      toast.error(errorMessage)
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAF8]">
        <BrutalLoader size="lg" tone="brand" label="Loading brand profile" />
      </div>
    )
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-10 animate-fade-in">
      <div className="mb-8 md:mb-10">
        <h1 className="text-3xl md:text-5xl font-black text-black mb-2 leading-tight flex items-center gap-2.5 md:gap-3">
          <User className="w-9 h-9 md:w-10 md:h-10" />
          Brand Profile
        </h1>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p className="text-base md:text-xl text-black/65 font-medium">
            Manage your brand information and settings
          </p>
          <Link
            href="/settings/billing"
            className="inline-flex w-full items-center justify-center rounded-xl border-[3px] border-black bg-[#FFD93D] px-4 py-2 text-sm font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:w-auto"
          >
            Billing
          </Link>
        </div>
      </div>

      <section className="mb-8 bg-white border-[3px] border-black shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] p-5 md:p-7">
        <div className="flex flex-col items-center gap-4 text-center sm:gap-5 xl:flex-row xl:items-center xl:text-left">
          <div className="relative mx-auto h-[116px] w-[104px] shrink-0 overflow-hidden border-[4px] border-black bg-[#FFD93D] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] sm:h-[136px] sm:w-[120px] xl:mx-0 xl:h-[156px] xl:w-[140px]">
            {profileImageUrl ? (
              <AppImage src={profileImageUrl} alt="Brand profile" className="object-cover" sizes="140px" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Building2 className="w-12 h-12 text-black/35" />
              </div>
            )}

            {(uploadingPhoto || uploadDone) && (
              <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white">
                {uploadDone ? <Check className="w-7 h-7 mb-1.5" /> : <Loader2 className="w-7 h-7 mb-1.5 animate-spin" />}
                <p className="text-[10px] font-bold uppercase tracking-wider">
                  {uploadDone ? 'Updated' : `Uploading ${uploadProgress}%`}
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingPhoto}
              className="absolute bottom-2 right-2 z-10 w-9 h-9 bg-black text-white border-[2px] border-black flex items-center justify-center hover:bg-white hover:text-black transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none"
              title="Upload profile photo"
            >
              {uploadingPhoto ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
          </div>

          <div className="w-full min-w-0 max-w-xl">
            <h2 className="text-xl md:text-2xl font-black uppercase text-black">Brand Avatar</h2>
            <p className="mt-1 text-sm font-medium leading-relaxed text-black/65 md:text-base">
              Upload a logo or brand profile image. This updates instantly across your account.
            </p>
          </div>
        </div>
      </section>

      <form onSubmit={handleSubmit} className="space-y-8">
        <section className="bg-white border-[3px] border-black shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] p-5 md:p-7 lg:p-8">
          <h2 className="text-3xl font-black mb-6 flex items-center gap-3">
            <Building2 className="w-7 h-7" />
            Company Information
          </h2>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-black uppercase tracking-wider mb-2.5">Company Name *</label>
              <input
                type="text"
                value={profile.companyName}
                onChange={(e) => updateField('companyName', e.target.value)}
                className="w-full px-5 py-3.5 border-2 border-black text-lg font-semibold focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-black uppercase tracking-wider mb-2.5">Brand Type</label>
                <select
                  value={profile.brandType}
                  onChange={(e) => updateField('brandType', e.target.value)}
                  className="w-full px-5 py-3.5 border-2 border-black text-lg font-semibold bg-white"
                >
                  <option value="">Select type</option>
                  {BRAND_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-black uppercase tracking-wider mb-2.5">Industry Vertical</label>
                <select
                  value={profile.vertical}
                  onChange={(e) => updateField('vertical', e.target.value)}
                  className="w-full px-5 py-3.5 border-2 border-black text-lg font-semibold bg-white"
                >
                  <option value="">Select vertical</option>
                  {VERTICALS.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-black uppercase tracking-wider mb-2.5">Website</label>
              <div className="relative">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-black/45" />
                <input
                  type="url"
                  value={profile.website}
                  onChange={(e) => updateField('website', e.target.value)}
                  className="w-full pl-12 pr-5 py-3.5 border-2 border-black text-lg font-medium focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] outline-none"
                  placeholder="https://yourbrand.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-black uppercase tracking-wider mb-2.5">Brand Description</label>
              <textarea
                value={profile.description}
                onChange={(e) => updateField('description', e.target.value)}
                rows={5}
                className="w-full px-5 py-3.5 border-2 border-black text-lg font-medium focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] outline-none resize-y"
                placeholder="Tell us about your brand..."
              />
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <section className="bg-white border-[3px] border-black shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] p-5 md:p-7">
            <h2 className="text-2xl md:text-3xl font-black mb-5 flex items-center gap-3">
              <Mail className="w-6 h-6" />
              Contact Information
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-black uppercase tracking-wider mb-2.5">Contact Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-black/45" />
                  <input
                    type="email"
                    value={profile.contactEmail}
                    onChange={(e) => updateField('contactEmail', e.target.value)}
                    className="w-full pl-12 pr-5 py-3.5 border-2 border-black text-base md:text-lg font-medium focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-black uppercase tracking-wider mb-2.5">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-black/45" />
                  <input
                    type="tel"
                    value={profile.contactPhone}
                    onChange={(e) => updateField('contactPhone', e.target.value)}
                    className="w-full pl-12 pr-5 py-3.5 border-2 border-black text-base md:text-lg font-medium focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] outline-none"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white border-[3px] border-black shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] p-5 md:p-7">
            <h2 className="text-2xl md:text-3xl font-black mb-5 flex items-center gap-3">
              <Instagram className="w-6 h-6" />
              Social Media
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-black uppercase tracking-wider mb-2.5">Instagram</label>
                <div className="relative">
                  <Instagram className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-black/45" />
                  <input
                    type="text"
                    value={profile.socialLinks.instagram}
                    onChange={(e) => updateSocialLink('instagram', e.target.value)}
                    className="w-full pl-12 pr-5 py-3.5 border-2 border-black text-base md:text-lg font-medium focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] outline-none"
                    placeholder="@yourbrand"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-black uppercase tracking-wider mb-2.5">Twitter / X</label>
                <div className="relative">
                  <Twitter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-black/45" />
                  <input
                    type="text"
                    value={profile.socialLinks.twitter}
                    onChange={(e) => updateSocialLink('twitter', e.target.value)}
                    className="w-full pl-12 pr-5 py-3.5 border-2 border-black text-base md:text-lg font-medium focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] outline-none"
                    placeholder="@yourbrand"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-black uppercase tracking-wider mb-2.5">LinkedIn</label>
                <div className="relative">
                  <Linkedin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-black/45" />
                  <input
                    type="text"
                    value={profile.socialLinks.linkedin}
                    onChange={(e) => updateSocialLink('linkedin', e.target.value)}
                    className="w-full pl-12 pr-5 py-3.5 border-2 border-black text-base md:text-lg font-medium focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] outline-none"
                    placeholder="company/yourbrand"
                  />
                </div>
              </div>
            </div>
          </section>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-4 md:py-5 bg-[#B4F056] border-[3px] border-black font-black uppercase text-xl shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:shadow-[7px_7px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 active:translate-y-[1px] disabled:opacity-50 transition-all flex items-center justify-center gap-3"
        >
          {saving ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <>
              <Save className="w-6 h-6" />
              Save Changes
            </>
          )}
        </button>
      </form>
    </div>
  )
}
