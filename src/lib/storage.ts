import { createServiceClient } from '@/lib/auth'

// Cache for buckets that have been verified/created
const verifiedBuckets = new Set<string>()
const MAX_UPLOAD_ATTEMPTS = 3
const BASE_RETRY_DELAY_MS = 450
const UPLOAD_TIMEOUT_MS = 60_000 // 60s max per upload attempt

function sanitizeSupabaseUrl(rawUrl: string): string {
  return rawUrl.trim().replace(/\/+$/, '')
}

function toErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  return String(error)
}

function isRetryableStorageError(error: unknown): boolean {
  const msg = toErrorMessage(error).toLowerCase()
  if (!msg) return false

  return (
    msg.includes('unexpected token') ||
    msg.includes('<!doctype') ||
    msg.includes('<html') ||
    msg.includes('storageunknownerror') ||
    msg.includes('fetch failed') ||
    msg.includes('network') ||
    msg.includes('socket') ||
    msg.includes('timed out') ||
    msg.includes('timeout') ||
    msg.includes('502') ||
    msg.includes('503') ||
    msg.includes('504')
  )
}

function getUploadErrorMessage(error: unknown, bucket: string, supabaseUrl: string): string {
  const msg = toErrorMessage(error)
  const urlHost = safeHost(supabaseUrl)

  if (msg.includes('Bucket not found') || msg.includes('does not exist')) {
    return `Storage bucket "${bucket}" does not exist. Please create it in Supabase Storage settings.`
  }
  if (msg.includes('new row violates row-level security') || msg.includes('row-level security')) {
    return 'Permission denied. Please check bucket policies in Supabase Storage. Make sure the bucket is public or has proper RLS policies.'
  }
  if (msg.includes('Invalid API key') || msg.includes('JWT') || msg.includes('401') || msg.includes('403')) {
    return 'Invalid Supabase service role key. Please check your SUPABASE_SERVICE_ROLE_KEY environment variable.'
  }
  if (
    msg.includes('Unexpected token') ||
    msg.includes('<!DOCTYPE') ||
    msg.includes('<html') ||
    msg.includes('StorageUnknownError')
  ) {
    return `Storage service returned invalid JSON (often an HTML error page). Verify NEXT_PUBLIC_SUPABASE_URL points to your project API host and service key is valid. Current host: ${urlHost}.`
  }

  return msg || 'Storage upload failed'
}

function safeHost(url: string): string {
  try {
    return new URL(url).host
  } catch {
    return 'invalid_url'
  }
}

function hasLikelyMisconfiguredSupabaseUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    const path = parsed.pathname.replace(/\/+$/, '')
    return path.length > 0 && path !== '' && path !== '/'
  } catch {
    return true
  }
}

async function delay(ms: number): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Ensure a bucket exists, create it if it doesn't
 */
async function ensureBucketExists(supabase: ReturnType<typeof createServiceClient>, bucket: string): Promise<void> {
  // Skip if already verified this session
  if (verifiedBuckets.has(bucket)) {
    return
  }

  try {
    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()
    
    if (listError) {
      console.warn('Could not list buckets:', listError.message)
      // Continue anyway - the bucket might exist
      return
    }

    const bucketExists = buckets?.some(b => b.name === bucket)
    
    if (!bucketExists) {
      console.log(`Creating storage bucket: ${bucket}`)
      const { error: createError } = await supabase.storage.createBucket(bucket, {
        public: true, // Make it public for easy access to URLs
        fileSizeLimit: 10 * 1024 * 1024, // 10MB limit
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
      })
      
      if (createError && !createError.message.includes('already exists')) {
        console.warn(`Could not create bucket ${bucket}:`, createError.message)
        // Continue anyway - might be permissions issue but bucket exists
      } else {
        console.log(`✓ Created bucket: ${bucket} (public: true)`)
      }
    } else {
      // Bucket exists - verify it's public
      const bucketInfo = buckets?.find(b => b.name === bucket)
      if (bucketInfo && !bucketInfo.public) {
        console.warn(`⚠️  Bucket "${bucket}" exists but is NOT public. Images may fail to load.`)
        console.warn(`   Please make the bucket public in Supabase Storage settings.`)
      } else if (bucketInfo && bucketInfo.public) {
        console.log(`✓ Bucket "${bucket}" exists and is public`)
      }
    }
    
    verifiedBuckets.add(bucket)
  } catch (error) {
    console.warn('Bucket check failed, continuing:', error)
    // Continue anyway - bucket operations might still work
  }
}

export async function saveUpload(
  file: Buffer | string,
  path: string,
  bucket: string = 'uploads',
  contentType: string = 'image/jpeg'
): Promise<string> {
  try {
    // Validate environment variables
    const supabaseUrl = sanitizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL || '')
    if (!supabaseUrl) {
      throw new Error('NEXT_PUBLIC_SUPABASE_URL is not configured')
    }
    if (hasLikelyMisconfiguredSupabaseUrl(supabaseUrl)) {
      console.warn(
        `⚠️ NEXT_PUBLIC_SUPABASE_URL may be misconfigured (${supabaseUrl}). Use the project root URL, not a path like /storage/v1.`
      )
    }
    
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured. Please set it in your environment variables.')
    }

    // Use service client to bypass RLS policies for server-side uploads
    const supabase = createServiceClient()

    // Ensure bucket exists
    await ensureBucketExists(supabase, bucket)

    // If file is base64 string, convert to buffer
    let fileBuffer: Buffer
    if (typeof file === 'string') {
      // Remove data URL prefix if present
      const base64Data = file.replace(/^data:image\/\w+;base64,/, '')
      try {
        fileBuffer = Buffer.from(base64Data, 'base64')
      } catch (parseError) {
        throw new Error('Invalid base64 image data')
      }
    } else {
      fileBuffer = file
    }

    // Validate file buffer
    if (!fileBuffer || fileBuffer.length === 0) {
      throw new Error('Empty file buffer - cannot upload')
    }

    console.log(`Uploading to bucket "${bucket}" at path: ${path} (${fileBuffer.length} bytes)`)

    let uploadedPath: string | null = null
    let lastUploadError: unknown = null
    let successAttempt = 0

    for (let attempt = 1; attempt <= MAX_UPLOAD_ATTEMPTS; attempt++) {
      let data: any = null
      let error: any = null

      try {
        const uploadPromise = supabase.storage.from(bucket).upload(path, fileBuffer, {
          contentType,
          upsert: true,
        })

        // Race against timeout to prevent indefinite hangs
        const result = await Promise.race([
          uploadPromise,
          delay(UPLOAD_TIMEOUT_MS).then(() => {
            throw new Error(`Upload timed out after ${UPLOAD_TIMEOUT_MS / 1000}s`)
          }),
        ]) as any

        data = result?.data
        error = result?.error
      } catch (timeoutOrNetworkErr) {
        error = timeoutOrNetworkErr
      }

      if (!error && data?.path) {
        uploadedPath = data.path
        successAttempt = attempt
        break
      }

      lastUploadError = error || new Error('Upload succeeded but no data returned from storage')
      const retryable = isRetryableStorageError(lastUploadError)
      const canRetry = retryable && attempt < MAX_UPLOAD_ATTEMPTS

      const failureDetails = {
        attempt,
        maxAttempts: MAX_UPLOAD_ATTEMPTS,
        retryable,
        message: toErrorMessage(lastUploadError),
        statusCode: (error as any)?.statusCode,
      }

      if (canRetry) {
        console.warn('Supabase storage upload attempt failed (transient, retrying):', failureDetails)
      } else {
        console.error('Supabase storage upload attempt failed:', failureDetails)
      }

      if (!canRetry) break

      const backoff = BASE_RETRY_DELAY_MS * Math.pow(2, attempt - 1)
      const jitter = Math.floor(Math.random() * 120)
      await delay(backoff + jitter)
    }

    if (!uploadedPath) {
      const errorMessage = getUploadErrorMessage(lastUploadError, bucket, supabaseUrl)
      throw new Error(errorMessage)
    }

    if (successAttempt > 1) {
      console.log(`✓ Storage upload recovered after ${successAttempt} attempts`)
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(uploadedPath)

    if (!publicUrl) {
      throw new Error('Failed to generate public URL for uploaded file')
    }

    console.log(`✓ Successfully uploaded to: ${publicUrl}`)
    return publicUrl
  } catch (error) {
    console.error('Storage upload error:', error)
    
    // Re-throw with improved error message
    if (error instanceof Error) {
      throw error
    }
    
    // Handle unknown error types
    const errorStr = String(error)
    if (errorStr.includes('HTML') || errorStr.includes('<html>')) {
      throw new Error('Storage service returned an HTML error page. Please check your Supabase configuration, service role key, and storage bucket settings.')
    }
    
    throw new Error(`Storage upload failed: ${errorStr}`)
  }
}

export async function getUploadUrl(path: string, bucket: string = 'uploads'): Promise<string> {
  try {
    // Use service client for server-side operations
    const supabase = createServiceClient()
    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(path)

    return publicUrl
  } catch (error) {
    console.error('Get upload URL error:', error)
    throw error
  }
}

export async function deleteUpload(path: string, bucket: string = 'uploads'): Promise<void> {
  try {
    // Use service client for server-side operations
    const supabase = createServiceClient()
    const { error } = await supabase.storage.from(bucket).remove([path])

    if (error) {
      throw error
    }
  } catch (error) {
    console.error('Delete upload error:', error)
    throw error
  }
}
