import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/auth'

export const maxDuration = 60

const MAX_PROFILE_IMAGE_BYTES = 5 * 1024 * 1024
const PROFILE_BUCKET_CANDIDATES = ['profile-images', 'uploads']

interface ProfileImageResponseItem {
  id: string
  imageUrl: string
  isPrimary: boolean
  label: string | null
}

interface ProfileImageMetadataItem {
  id?: string
  url?: string
  imageUrl?: string
  isPrimary?: boolean
  label?: string | null
}

function normalizeProfileImages(rawImages: unknown): ProfileImageResponseItem[] {
  if (!Array.isArray(rawImages)) return []

  return rawImages
    .map((item, index) => {
      const image = item as ProfileImageMetadataItem | string
      if (typeof image === 'string') {
        return {
          id: `img-${index}`,
          imageUrl: image,
          isPrimary: index === 0,
          label: null,
        }
      }

      const imageUrl = image.url || image.imageUrl
      if (!imageUrl) return null

      return {
        id: image.id || `img-${index}`,
        imageUrl,
        isPrimary: Boolean(image.isPrimary || index === 0),
        label: image.label || null,
      }
    })
    .filter((item): item is ProfileImageResponseItem => Boolean(item?.imageUrl))
}

function mimeTypeToExtension(mimeType: string): string {
  if (mimeType.includes('png')) return 'png'
  if (mimeType.includes('webp')) return 'webp'
  if (mimeType.includes('gif')) return 'gif'
  if (mimeType.includes('avif')) return 'avif'
  return 'jpg'
}

/**
 * GET /api/profile-images
 *
 * Returns the current user's saved profile images.
 */
export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser()

    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const [{ data: profile }, { data: accountProfile }] = await Promise.all([
      supabase
        .from('influencer_profiles')
        .select('profile_images')
        .eq('user_id', authUser.id)
        .maybeSingle(),
      supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', authUser.id)
        .maybeSingle(),
    ])

    let images = normalizeProfileImages(profile?.profile_images)

    if (images.length === 0 && typeof accountProfile?.avatar_url === 'string' && accountProfile.avatar_url) {
      images = [
        {
          id: 'avatar-primary',
          imageUrl: accountProfile.avatar_url,
          isPrimary: true,
          label: 'avatar',
        },
      ]
    }

    return NextResponse.json({ images })
  } catch (error) {
    console.error('Profile images error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/profile-images
 *
 * Saves a new profile image for the current user.
 * Supports multipart/form-data (fast path) and JSON base64 (backward compatibility).
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser()

    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let db: Awaited<ReturnType<typeof createClient>> | ReturnType<typeof createServiceClient> = supabase
    try {
      db = createServiceClient()
    } catch {
      db = supabase
    }

    const contentTypeHeader = request.headers.get('content-type') || ''
    let label: string | null = null
    let makePrimary = false
    let fileBuffer: Buffer | null = null
    let uploadContentType = 'image/jpeg'
    let extension = 'jpg'

    if (contentTypeHeader.includes('multipart/form-data')) {
      const formData = await request.formData()
      const file = formData.get('file')
      const labelValue = formData.get('label')
      const makePrimaryValue = formData.get('makePrimary')

      label = typeof labelValue === 'string' ? labelValue : null
      makePrimary = makePrimaryValue === 'true'

      if (!(file instanceof File)) {
        return NextResponse.json({ error: 'Image file required' }, { status: 400 })
      }

      if (!file.type.startsWith('image/')) {
        return NextResponse.json({ error: 'Invalid file type' }, { status: 400 })
      }

      if (file.size > MAX_PROFILE_IMAGE_BYTES) {
        return NextResponse.json({ error: 'Image must be less than 5MB' }, { status: 400 })
      }

      const arrayBuffer = await file.arrayBuffer()
      fileBuffer = Buffer.from(arrayBuffer)
      uploadContentType = file.type || 'image/jpeg'
      extension = mimeTypeToExtension(uploadContentType)
    } else {
      const body = await request.json().catch(() => null)
      const imageBase64 = body?.imageBase64
      label = body?.label || null
      makePrimary = Boolean(body?.makePrimary)

      if (!imageBase64) {
        return NextResponse.json({ error: 'Image data required' }, { status: 400 })
      }

      const base64Data = String(imageBase64).replace(/^data:image\/\w+;base64,/, '')
      fileBuffer = Buffer.from(base64Data, 'base64')
      uploadContentType = 'image/jpeg'
      extension = 'jpg'
    }

    if (!fileBuffer || fileBuffer.length === 0) {
      return NextResponse.json({ error: 'Invalid image payload' }, { status: 400 })
    }

    const fileName = `${authUser.id}/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${extension}`

    let uploadPath: string | null = null
    let activeBucket: string | null = null
    let uploadErrorMessage = ''

    for (const bucket of PROFILE_BUCKET_CANDIDATES) {
      const { data, error } = await db.storage.from(bucket).upload(fileName, fileBuffer, {
        contentType: uploadContentType,
        upsert: true,
      })

      if (!error && data?.path) {
        uploadPath = data.path
        activeBucket = bucket
        break
      }

      uploadErrorMessage = error?.message || uploadErrorMessage
    }

    if (!uploadPath || !activeBucket) {
      return NextResponse.json(
        { error: uploadErrorMessage || 'Failed to upload profile photo. Please try again.' },
        { status: 500 }
      )
    }

    const {
      data: { publicUrl },
    } = db.storage.from(activeBucket).getPublicUrl(uploadPath)

    const imageUrl = publicUrl

    const { error: profileUpdateError } = await supabase
      .from('profiles')
      .update({ avatar_url: imageUrl })
      .eq('id', authUser.id)

    if (profileUpdateError) {
      const { error: serviceProfileUpdateError } = await db
        .from('profiles')
        .update({ avatar_url: imageUrl })
        .eq('id', authUser.id)

      if (serviceProfileUpdateError) {
        console.error('Failed to update profiles.avatar_url:', serviceProfileUpdateError)
        return NextResponse.json(
          {
            error: serviceProfileUpdateError.message || 'Failed to save profile avatar. Please try again.',
          },
          { status: 500 }
        )
      }
    }

    const now = new Date().toISOString()

    try {
      const { data: existingProfile } = await db
        .from('influencer_profiles')
        .select('id, profile_images')
        .eq('user_id', authUser.id)
        .maybeSingle()

      const normalizedExisting = normalizeProfileImages(existingProfile?.profile_images).map((img, index) => ({
        id: img.id,
        url: img.imageUrl,
        label: img.label,
        isPrimary: makePrimary ? false : Boolean(img.isPrimary || index === 0),
      }))

      const newImage = {
        id: `img-${Date.now()}`,
        url: imageUrl,
        label: label || null,
        isPrimary: makePrimary || normalizedExisting.length === 0,
      }

      const nextImages = [...normalizedExisting, newImage]

      if (existingProfile?.id) {
        await db
          .from('influencer_profiles')
          .update({
            profile_images: nextImages,
            updated_at: now,
          })
          .eq('id', existingProfile.id)
      } else {
        await db
          .from('influencer_profiles')
          .insert({
            user_id: authUser.id,
            profile_images: nextImages,
            updated_at: now,
          })
      }

      return NextResponse.json({
        success: true,
        image: {
          id: newImage.id,
          imageUrl: newImage.url,
          isPrimary: newImage.isPrimary,
          label: newImage.label,
        },
      })
    } catch (metadataError) {
      console.warn('Profile image metadata write skipped:', metadataError)
      return NextResponse.json({
        success: true,
        image: {
          id: `img-${Date.now()}`,
          imageUrl,
          isPrimary: true,
          label: label || null,
        },
        warning: 'Avatar updated, but image history metadata was not saved.',
      })
    }
  } catch (error) {
    console.error('Save profile image error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
