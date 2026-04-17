import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// Jobs older than this are considered stale and auto-expired.
// Normal generation takes 30-90s. 5 minutes is very generous.
const STALE_JOB_THRESHOLD_MINUTES = 5

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser()

    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const service = createServiceClient()

    // AUTO-EXPIRE: Mark any job stuck in pending/processing for > 5 minutes as failed.
    // This prevents infinite polling loops when a job crashes, times out, or the server restarts.
    await service
      .from('generation_jobs')
      .update({ status: 'failed', updated_at: new Date().toISOString() })
      .eq('user_id', authUser.id)
      .in('status', ['pending', 'processing'])
      .lt('created_at', new Date(Date.now() - STALE_JOB_THRESHOLD_MINUTES * 60 * 1000).toISOString())

    // Now fetch the active job (if any remain after cleanup)
    const { data: activeJob, error } = await service
      .from('generation_jobs')
      .select('id, status, created_at, updated_at')
      .eq('user_id', authUser.id)
      .in('status', ['pending', 'processing'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) {
      console.error('Try-on active job query error:', error)
      return NextResponse.json({ error: 'Failed to fetch active job' }, { status: 500 })
    }

    if (!activeJob) {
      return NextResponse.json({ active: false })
    }

    return NextResponse.json({
      active: true,
      jobId: activeJob.id,
      status: activeJob.status,
      createdAt: activeJob.created_at,
      updatedAt: activeJob.updated_at,
    })
  } catch (error) {
    console.error('Try-on active job error:', error)
    return NextResponse.json({ error: 'Failed to fetch active job' }, { status: 500 })
  }
}
