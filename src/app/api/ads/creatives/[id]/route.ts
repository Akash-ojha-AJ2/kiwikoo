import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/auth'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const service = createServiceClient()
    const { data: profile } = await service
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'brand') {
      return NextResponse.json({ error: 'Unauthorized - Brand access required' }, { status: 403 })
    }

    const { data: creative, error } = await service
      .from('ad_creatives')
      .select('id, title, image_url')
      .eq('id', id)
      .eq('brand_id', user.id)
      .single()

    if (error || !creative) {
      return NextResponse.json({ error: 'Creative not found' }, { status: 404 })
    }

    return NextResponse.json({
      id: creative.id,
      title: creative.title || 'Ad Creative',
      imageUrl: creative.image_url,
    })
  } catch (error) {
    console.error('Fetch creative error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
