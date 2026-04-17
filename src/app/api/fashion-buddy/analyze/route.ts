import { NextResponse } from 'next/server'
import { createClient } from '@/lib/auth'
import { analyzeOutfitAndProvideAdvice } from '@/lib/openai'
import { z } from 'zod'

const analyzeSchema = z
  .object({
    image: z.string().min(1).max(15_000_000),
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
    const { image } = analyzeSchema.parse(body)

    const advice = await analyzeOutfitAndProvideAdvice(image)

    return NextResponse.json({ advice })
  } catch (error) {
    console.error('Outfit analysis error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

