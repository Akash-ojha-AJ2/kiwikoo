import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/auth'

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024
const DEFAULT_ALLOWED_BUCKETS = [
  'ads',
  'identity-images',
  'portfolios',
  'products',
  'profile-images',
  'try-ons',
  'uploads',
]

function getAllowedBuckets(): Set<string> {
  const fromEnv = (process.env.ALLOWED_UPLOAD_BUCKETS || '')
    .split(',')
    .map((bucket) => bucket.trim().toLowerCase())
    .filter(Boolean)

  if (fromEnv.length > 0) {
    return new Set(fromEnv)
  }

  return new Set(DEFAULT_ALLOWED_BUCKETS)
}

function sanitizeFileName(fileName: string): string {
  const safeName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_')
  return safeName.length > 160 ? safeName.slice(-160) : safeName
}

function toFriendlyUploadError(rawMessage: string, bucket: string): string {
  if (rawMessage.includes('Bucket not found') || rawMessage.includes('does not exist')) {
    return `Storage bucket "${bucket}" does not exist. Please create it in Supabase Storage settings.`
  }

  if (rawMessage.includes('row-level security')) {
    return 'Permission denied. Please check bucket policies in Supabase Storage.'
  }

  if (rawMessage.includes('Invalid API key') || rawMessage.includes('401') || rawMessage.includes('403')) {
    return 'Invalid Supabase service configuration. Please verify service role key in environment variables.'
  }

  return rawMessage || 'Failed to upload to storage'
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser()

    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let storageClient: Awaited<ReturnType<typeof createClient>> | ReturnType<typeof createServiceClient> = supabase
    try {
      storageClient = createServiceClient()
    } catch (error) {
      console.warn('Service role key missing, falling back to session client for upload route:', error)
      storageClient = supabase
    }

    const formData = await request.formData()
    const file = formData.get('file')
    const requestedBucket = String(formData.get('bucket') || 'uploads').trim().toLowerCase()

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image uploads are allowed' }, { status: 400 })
    }

    if (file.size === 0) {
      return NextResponse.json({ error: 'Uploaded file is empty' }, { status: 400 })
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json({ error: 'Image must be less than 10MB' }, { status: 400 })
    }

    const allowedBuckets = getAllowedBuckets()
    if (!allowedBuckets.has(requestedBucket)) {
      return NextResponse.json(
        { error: `Bucket "${requestedBucket}" is not allowed` },
        { status: 400 }
      )
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const fileName = `${Date.now()}-${sanitizeFileName(file.name)}`
    const storagePath = `${authUser.id}/${fileName}`

    let activeBucket = requestedBucket
    let uploadResult = await storageClient.storage.from(activeBucket).upload(storagePath, buffer, {
      contentType: file.type || 'image/jpeg',
      upsert: true,
    })

    if (
      uploadResult.error &&
      activeBucket !== 'uploads' &&
      allowedBuckets.has('uploads') &&
      (uploadResult.error.message?.includes('Bucket not found') ||
        uploadResult.error.message?.includes('does not exist'))
    ) {
      console.warn(`Bucket "${activeBucket}" not found, falling back to "uploads"`)
      activeBucket = 'uploads'
      uploadResult = await storageClient.storage.from(activeBucket).upload(storagePath, buffer, {
        contentType: file.type || 'image/jpeg',
        upsert: true,
      })
    }

    if (uploadResult.error || !uploadResult.data) {
      const message = toFriendlyUploadError(uploadResult.error?.message || '', requestedBucket)
      return NextResponse.json(
        {
          error: message,
        },
        { status: 500 }
      )
    }

    const {
      data: { publicUrl },
    } = storageClient.storage.from(activeBucket).getPublicUrl(uploadResult.data.path)

    return NextResponse.json({
      path: publicUrl,
      storagePath: uploadResult.data.path,
      bucket: activeBucket,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
