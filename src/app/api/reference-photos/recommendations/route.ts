import { NextResponse } from 'next/server'

import { createClient, createServiceClient } from '@/lib/auth'
import { getReferencePhotoRecommendations } from '@/lib/reference-photos/service'

export const maxDuration = 30

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
    const recommendations = await getReferencePhotoRecommendations(service, user.id)

    return NextResponse.json(recommendations)
  } catch (error) {
    console.error('[reference-photos] recommendations error:', error)
    return NextResponse.json({ error: 'Failed to fetch recommendations' }, { status: 500 })
  }
}
