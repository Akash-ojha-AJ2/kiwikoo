import { NextResponse } from 'next/server'

import { createClient, createServiceClient } from '@/lib/auth'
import {
  analyzeAndUpdateReferencePhoto,
  getReferencePhotoLibrary,
} from '@/lib/reference-photos/service'

export const maxDuration = 60

const MAX_REFERENCE_PHOTO_BYTES = 10 * 1024 * 1024
const STORAGE_BUCKET = 'uploads'

function mimeTypeToExtension(mimeType: string): string {
  if (mimeType.includes('png')) return 'png'
  if (mimeType.includes('webp')) return 'webp'
  if (mimeType.includes('gif')) return 'gif'
  if (mimeType.includes('avif')) return 'avif'
  return 'jpg'
}

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const service = createServiceClient()
    const library = await getReferencePhotoLibrary(service, user.id)

    return NextResponse.json(library)
  } catch (error) {
    console.error('[reference-photos] GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch reference photo library' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const service = createServiceClient()
    const contentType = request.headers.get('content-type') || ''

    let fileBuffer: Buffer | null = null
    let uploadContentType = 'image/jpeg'
    let extension = 'jpg'

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      const file = formData.get('file')

      if (!(file instanceof File)) {
        return NextResponse.json({ error: 'Image file required' }, { status: 400 })
      }

      if (!file.type.startsWith('image/')) {
        return NextResponse.json({ error: 'Invalid file type' }, { status: 400 })
      }

      if (file.size > MAX_REFERENCE_PHOTO_BYTES) {
        return NextResponse.json({ error: 'Image must be less than 10MB' }, { status: 400 })
      }

      fileBuffer = Buffer.from(await file.arrayBuffer())
      uploadContentType = file.type || uploadContentType
      extension = mimeTypeToExtension(uploadContentType)
    } else {
      const body = await request.json().catch(() => null)
      const imageBase64 = body?.imageBase64

      if (!imageBase64) {
        return NextResponse.json({ error: 'imageBase64 required' }, { status: 400 })
      }

      const base64Data = String(imageBase64).replace(/^data:image\/\w+;base64,/, '')
      fileBuffer = Buffer.from(base64Data, 'base64')
    }

    if (!fileBuffer || fileBuffer.length === 0) {
      return NextResponse.json({ error: 'Invalid image payload' }, { status: 400 })
    }

    const storagePath = `reference-photos/${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${extension}`
    const { data: uploadData, error: uploadError } = await service.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, fileBuffer, {
        contentType: uploadContentType,
        upsert: true,
      })

    if (uploadError || !uploadData?.path) {
      console.error('[reference-photos] upload error:', uploadError)
      return NextResponse.json({ error: 'Failed to upload photo' }, { status: 500 })
    }

    const {
      data: { publicUrl },
    } = service.storage.from(STORAGE_BUCKET).getPublicUrl(uploadData.path)

    const { data: insertedPhoto, error: insertError } = await service
      .from('reference_photos')
      .insert({
        user_id: user.id,
        image_url: publicUrl,
        image_path: uploadData.path,
        source: 'app_upload',
        status: 'pending',
        approved_for_tryon: false,
        rejection_reasons: [],
        is_active: true,
      })
      .select('*')
      .single()

    if (insertError || !insertedPhoto) {
      console.error('[reference-photos] insert error:', insertError)
      return NextResponse.json({ error: 'Failed to store photo metadata' }, { status: 500 })
    }

    const base64ForAnalysis = `data:image/${extension};base64,${fileBuffer.toString('base64')}`
    void analyzeAndUpdateReferencePhoto(service, user.id, insertedPhoto.id, base64ForAnalysis).catch((error) => {
      console.error('[reference-photos] background analysis error:', error)
    })

    return NextResponse.json({
      photo: {
        id: insertedPhoto.id,
        imageUrl: insertedPhoto.image_url,
        source: insertedPhoto.source,
        status: insertedPhoto.status,
        qualityScore: insertedPhoto.quality_score,
        selectionScore: null,
        analysis: insertedPhoto.analysis,
        approvedForTryOn: insertedPhoto.approved_for_tryon,
        rejectionReasons: insertedPhoto.rejection_reasons || [],
        createdAt: insertedPhoto.created_at,
        updatedAt: insertedPhoto.updated_at,
      },
      message: 'Photo uploaded. Analysis is running now.',
    })
  } catch (error) {
    console.error('[reference-photos] POST error:', error)
    return NextResponse.json({ error: 'Failed to upload reference photo' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const photoId = searchParams.get('id')

    if (!photoId) {
      return NextResponse.json({ error: 'Photo id required' }, { status: 400 })
    }

    const service = createServiceClient()
    const { error } = await service
      .from('reference_photos')
      .update({
        is_active: false,
        approved_for_tryon: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', photoId)
      .eq('user_id', user.id)

    if (error) {
      console.error('[reference-photos] DELETE error:', error)
      return NextResponse.json({ error: 'Failed to archive reference photo' }, { status: 500 })
    }

    try {
      const { extractIdentityEmbedding } = await import('@/lib/tryon/identity-embedding')
      await extractIdentityEmbedding(user.id)
    } catch (embeddingError) {
      console.warn('[reference-photos] identity embedding refresh after delete failed:', embeddingError)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[reference-photos] DELETE error:', error)
    return NextResponse.json({ error: 'Failed to archive reference photo' }, { status: 500 })
  }
}
