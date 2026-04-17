/**
 * GENERATION BY ID API - SUPABASE ONLY
 * 
 * DELETE - Delete a generation
 */
import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/auth'
import { deleteUpload } from '@/lib/storage'
import { getAllOutputPaths, getJobOutputsFromRecord } from '@/lib/tryon/job-outputs'

const BUCKET = 'try-ons'

function inferTryOnStorageKey(params: { outputImagePath?: string | null; userId: string; jobId: string }): string {
  const fallback = `tryon/${params.userId}/${params.jobId}.png`
  const raw = params.outputImagePath
  if (!raw) return fallback

  // If DB already contains a storage key, use it directly.
  if (!raw.startsWith('http')) return raw

  // If DB contains a public URL, extract object key after bucket segment.
  const marker = '/try-ons/'
  const idx = raw.indexOf(marker)
  if (idx >= 0) {
    const key = raw.slice(idx + marker.length)
    return key || fallback
  }

  return fallback
}

export async function DELETE(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient()
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser()

    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await ctx.params
    const service = createServiceClient()

    // Find the generation
    const { data: existing, error: findError } = await service
      .from('generation_jobs')
      .select('id, output_image_path, settings')
      .eq('id', id)
      .eq('user_id', authUser.id)
      .single()

    if (findError || !existing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    // Delete DB row first (authoritative)
    const { error: deleteError } = await service
      .from('generation_jobs')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Failed to delete generation:', deleteError)
      return NextResponse.json({ error: 'Failed to delete generation' }, { status: 500 })
    }

    // Best-effort storage cleanup (non-fatal if missing)
    try {
      const outputPaths = getAllOutputPaths(getJobOutputsFromRecord(existing))
      const keys = outputPaths
        .map((outputPath) =>
          inferTryOnStorageKey({
            outputImagePath: outputPath,
            userId: authUser.id,
            jobId: id,
          })
        )
        .filter((key) => !key.startsWith('base64://'))

      for (const key of new Set(keys)) {
        await deleteUpload(key, BUCKET)
      }
    } catch (storageErr) {
      console.warn('Failed to delete try-on image from storage (non-fatal):', storageErr)
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Generations DELETE error:', error)
    return NextResponse.json({ error: 'Failed to delete generation' }, { status: 500 })
  }
}
