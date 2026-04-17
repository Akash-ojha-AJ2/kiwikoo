import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/auth'
import { getFirstSuccessfulOutput, getJobOutputsFromRecord } from '@/lib/tryon/job-outputs'

export const dynamic = 'force-dynamic'

export async function GET(_request: Request, ctx: { params: Promise<{ id: string }> }) {
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
    const { data: job, error } = await service
      .from('generation_jobs')
      .select('id, user_id, status, output_image_path, error_message, settings, created_at, updated_at')
      .eq('id', id)
      .eq('user_id', authUser.id)
      .single()

    if (error || !job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    const outputs = getJobOutputsFromRecord(job)
    const primaryOutput = getFirstSuccessfulOutput(outputs)

    return NextResponse.json({
      jobId: job.id,
      status: job.status,
      imageUrl: primaryOutput?.imageUrl,
      base64Image: primaryOutput?.base64Image,
      output_image_path: primaryOutput?.outputImagePath,
      outputs,
      error: job.error_message || undefined,
      settings: job.settings || {},
      createdAt: job.created_at,
      updatedAt: job.updated_at,
    })
  } catch (error) {
    console.error('Try-on job poll error:', error)
    return NextResponse.json({ error: 'Failed to fetch job status' }, { status: 500 })
  }
}
