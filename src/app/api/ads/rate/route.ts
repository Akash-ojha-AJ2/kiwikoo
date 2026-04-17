import { NextResponse } from 'next/server'
import { createClient } from '@/lib/auth'
import { rateAdCreative } from '@/lib/openai'
import { z } from 'zod'

const rateSchema = z
  .object({
    adImage: z.string().min(1).max(15_000_000),
    productImage: z.string().min(1).max(15_000_000).optional(),
    influencerImage: z.string().min(1).max(15_000_000).optional(),
  })
  .strict()

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser()

    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json().catch(() => null)
    const { adImage, productImage, influencerImage } = rateSchema.parse(body)

    const rating = await rateAdCreative(adImage, productImage, influencerImage)

    return NextResponse.json(rating)
  } catch (error) {
    console.error('Ad rating error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

